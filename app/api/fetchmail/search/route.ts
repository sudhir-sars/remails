// Path: /api/fetchmail/search.ts

import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

interface DecodedToken {
  refreshToken: string;
}

async function extractContent(email: gmail_v1.Schema$Message): Promise<{ textBody: string, htmlBody: string, attachments: gmail_v1.Schema$MessagePart[] }> {
  const parts = email.payload?.parts || [];
  let textBody = '';
  let htmlBody = '';
  const attachments: gmail_v1.Schema$MessagePart[] = [];

  const recursiveExtract = async (parts: gmail_v1.Schema$MessagePart[]): Promise<void> => {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      } else if (part.parts) {
        await recursiveExtract(part.parts);
      }
    }
  };

  await recursiveExtract(parts);

  // Fallback checks
  if (!textBody && email.payload?.mimeType === 'text/plain' && email.payload?.body?.data) {
    textBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  if (!htmlBody && email.payload?.mimeType === 'text/html' && email.payload?.body?.data) {
    htmlBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  if (attachments.length === 0) {
    const topLevelParts = email.payload?.parts || [];
    for (const part of topLevelParts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      }
    }
  }

  return { textBody, htmlBody, attachments };
}

async function getAttachmentInfo(gmail: gmail_v1.Gmail, userId: string, messageId: string, attachmentId: string) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId,
      messageId,
      id: attachmentId,
    });

    return {
      data: response.data.data, // Base64 encoded attachment data
      size: response.data.size,
    };
  } catch (error) {
    console.error(`Error getting attachment info for ${attachmentId}:`, error);
    return null;
  }
}

interface LabelCount {
  name: string;
  count: number;
}

async function formatEmailData(gmail: gmail_v1.Gmail, email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const getHeader = (name: string) => headers.find(header => header.name?.toLowerCase() === name)?.value || '';
  const [senderName, senderEmail] = getHeader('from').split('<');

  const { textBody, htmlBody, attachments } = await extractContent(email);

  return {
    id: email.id,
    threadId: email.threadId,
    name: senderName?.trim() || '',
    email: senderEmail?.replace('>', '') || '',
    reply: getHeader('reply-to'),
    snippet: email.snippet,
    subject: getHeader('subject'),
    htmlBody,
    textBody,
    date: new Date(parseInt(email.internalDate || '0', 10)).toISOString(),
    read: !email.labelIds?.includes('UNREAD'),
    labels: email.labelIds,
    attachments: attachments,
  };
}

async function fetchLabelCounts(auth: OAuth2Client): Promise<LabelCount[]> {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const labelsResponse = await gmail.users.labels.list({ userId });
    const labels = labelsResponse.data.labels || [];

    const labelCountsPromises = labels.map(async (label) => {
      if (!label.id || !label.name) {
        console.warn('Label missing id or name:', label);
        return { name: 'unknown', count: 0 };
      }

      try {
        const labelData = await gmail.users.labels.get({ userId, id: label.id });
        const count = labelData.data.messagesTotal || 0;
        return { name: label.name, labelId: label.id, count };
      } catch (error) {
        console.error(`Error fetching details for label ${label.name}:`, error);
        return { name: label.name, labelId: label.id, count: 0 };
      }
    });

    return await Promise.all(labelCountsPromises);
  } catch (err) {
    console.error('Error fetching label counts:', err);
    throw err;
  }
}

async function fetchEmailId(auth: OAuth2Client, messageIds: string[]) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  const fetchMessage = async (messageId: string) => {
    try {
      const { data } = await gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full',
        fields: 'id,threadId,labelIds,snippet,payload,internalDate',
      });

      const emails = await formatEmailData(gmail, data);
      return emails;
    } catch (err) {
      console.error(`Error fetching emails for thread ${messageId}:`, err);
      return null;
    }
  };

  const messages = await Promise.all(Array.from(messageIds).map(fetchMessage));
  return messages.filter(thread => thread !== null);
}

async function fetchEmails(auth: OAuth2Client, pageToken: string | null, searchParams: any) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';
  const mailsToFetch = 50;

  try {
    let query = '';

    if (searchParams.senderFilter) {
      query += query ? ` AND from:${searchParams.senderFilter}` : `from:${searchParams.senderFilter}`;
    }
    if (searchParams.recipientFilter) {
      query += query ? ` AND to:${searchParams.recipientFilter}` : `to:${searchParams.recipientFilter}`;
    }
    if (searchParams.subjectFilter) {
      query += query ? ` AND subject:${searchParams.subjectFilter}` : `subject:${searchParams.subjectFilter}`;
    }
    if (searchParams.ccBccFilter) {
      query += query ? ` AND (cc:${searchParams.ccBccFilter} OR bcc:${searchParams.ccBccFilter})` : `(cc:${searchParams.ccBccFilter} OR bcc:${searchParams.ccBccFilter})`;
    }
    if (searchParams.date.from) {
      const fromDate = new Date(parseInt(searchParams.date.from, 10));
      const fromFormatted = `${fromDate.getFullYear()}/${(fromDate.getMonth() + 1).toString().padStart(2, '0')}/${fromDate.getDate().toString().padStart(2, '0')}`;
      query += query ? ` AND after:${fromFormatted}` : `after:${fromFormatted}`;
    }
    if (searchParams.date.to) {
      const toDate = new Date(parseInt(searchParams.date.to, 10));
      const toFormatted = `${toDate.getFullYear()}/${(toDate.getMonth() + 1).toString().padStart(2, '0')}/${toDate.getDate().toString().padStart(2, '0')}`;
      query += query ? ` AND before:${toFormatted}` : `before:${toFormatted}`;
    }
    if (searchParams.readStatus === true) {
      query += query ? ` AND is:read` : `is:read`;
    } else if (searchParams.readStatus === false) {
      query += query ? ` AND is:unread` : `is:unread`;
    }
    if (searchParams.hasAttachment) {
      query += query ? ` AND has:attachment` : `has:attachment`;
    }
    console.log(query)

    const response = await gmail.users.messages.list({
      userId,
      maxResults: mailsToFetch,
      q: query,
      pageToken: pageToken || undefined,
      fields: 'messages(id),nextPageToken',
    });

    const currentFetchTime = Date.now();

    const messageIds = (response.data.messages || []).map(message => message.id!);

    const [emails, labelCounts] = await Promise.all([
      fetchEmailId(auth, messageIds),
      fetchLabelCounts(auth)
    ]);
    console.log("fecthed "+emails.length+" emails")

    return { emails, nextPageToken: response.data.nextPageToken, currentFetchTime, labelCounts };

  } catch (err) {
    console.error('Error fetching emails:', err);
    throw err;
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const pageToken = url.searchParams.get('pageToken');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });

    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const searchParams = {
      senderFilter: url.searchParams.get('sender'),
      recipientFilter: url.searchParams.get('recipient'),
      subjectFilter: url.searchParams.get('subject'),
      ccBccFilter: url.searchParams.get('ccBcc'),
      date: {
        from: url.searchParams.get('dateFrom'),
        to: url.searchParams.get('dateTo'),
      },
      readStatus: url.searchParams.get('readStatus') === 'true' ? true : 
                  url.searchParams.get('readStatus') === 'false' ? false : null,
      hasAttachment: url.searchParams.get('hasAttachment') === 'true',
    };

    const { emails, nextPageToken, currentFetchTime, labelCounts } = await fetchEmails(
      oAuth2Client,
      pageToken,
      searchParams
    );

    return NextResponse.json({ success: true, data: emails, nextPageToken, currentFetchTime, labelCounts }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving emails or refreshing access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve emails or refresh access token' }, { status: 500 });
  }
};
