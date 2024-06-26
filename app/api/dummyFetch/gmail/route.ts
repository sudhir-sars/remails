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

async function extractContent(email: gmail_v1.Schema$Message, auth: OAuth2Client): Promise<{ textBody: string, htmlBody: string, attachments: gmail_v1.Schema$MessagePart[] }> {
  const parts = email.payload?.parts || [];
  let textBody = '';
  let htmlBody = '';
  const attachments: gmail_v1.Schema$MessagePart[] = [];

  const recursiveExtract = async (parts: gmail_v1.Schema$MessagePart[]): Promise<void> => {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        textBody = Buffer.from(part.body.data, 'base64').toString('utf-8')
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        // htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8').replace(/\r\n/g, '');
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
       else if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      } else if (part.parts) {
        await recursiveExtract(part.parts);
      }
    }
  };

  await recursiveExtract(parts);

  // If no text body is found, check top-level payload as fallback
  if (!textBody && email.payload?.mimeType === 'text/plain' && email.payload?.body?.data) {
    textBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8')
  }

  // If no HTML body is found, check top-level payload as fallback
  if (!htmlBody && email.payload?.mimeType === 'text/html' && email.payload?.body?.data) {
    // htmlBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8').replace(/\r\n/g, '');
    htmlBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  // Fallback for attachments: Check top-level payload if no attachments found
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

async function getAttachmentInfo(gmail: gmail_v1.Gmail, userId: string, messageId: string, attachmentId: string, accessToken: string) {
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

async function formatEmailData(gmail: gmail_v1.Gmail, email: gmail_v1.Schema$Message, accessToken: string) {
  const headers = email.payload?.headers || [];
  const getHeader = (name: string) => headers.find(header => header.name?.toLowerCase() === name)?.value || '';
  const [senderName, senderEmail] = getHeader('from').split('<');

  const { textBody, htmlBody, attachments } = await extractContent(email, oAuth2Client);

  // const attachmentPromises = attachments.map(async (attachment) => {
  //   const attachmentInfo = await getAttachmentInfo(gmail, 'me', email.id!, attachment.body!.attachmentId!, accessToken);
  //   return {
  //     filename: attachment.filename!,
  //     mimeType: attachment.mimeType || 'application/octet-stream',
  //     data: attachmentInfo?.data,
  //     size: attachmentInfo?.size,
  //   };
  // });

  // const resolvedAttachments = await Promise.all(attachmentPromises);

  return {
    // id: email.id,
    // threadId: email.threadId,
    // name: senderName?.trim() || '',
    // email: senderEmail?.replace('>', '') || '',
    // reply: getHeader('reply-to'),
    // snippet: email.snippet,
    // subject: getHeader('subject'),
    // htmlBody,
    textBody,
    // date: new Date(parseInt(email.internalDate || '0', 10)).toISOString(),
    // read: !email.labelIds?.includes('UNREAD'),
    // labels: email.labelIds,
    // attachments: resolvedAttachments,
  };
}

async function fetchEmailThreads(auth: OAuth2Client, threadIds: Set<string>, accessToken: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  const fetchThread = async (threadId: string) => {
    try {
      const { data } = await gmail.users.threads.get({
        userId,
        id: threadId,
        format: 'full',
        fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate)',
      });

      const emails = await Promise.all(data.messages!.map(message => formatEmailData(gmail, message, accessToken)));
      return { threadId, emails };
    } catch (err) {
      console.error(`Error fetching emails for thread ${threadId}:`, err);
      return null;
    }
  };

  const threads = await Promise.all(Array.from(threadIds).map(fetchThread));
  return threads.filter(thread => thread !== null);
}

async function fetchEmails(auth: OAuth2Client, pageToken: string | null, lastFetchTime: string | null, accessToken: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const query = lastFetchTime ? `after:${lastFetchTime}` : '';

    const response = await gmail.users.messages.list({
      userId,
      maxResults: 1000,
      q: query,
      pageToken: pageToken || undefined,
      fields: 'messages(id,threadId),nextPageToken',
    });
    const currentFetchTime = Date.now();

    const threadIds = new Set<string>((response.data.messages || []).map(message => message.threadId!));

    const threads = await fetchEmailThreads(auth, threadIds, accessToken);
    console.log(`fetched ${threads.length} `)
    return { threads, nextPageToken: response.data.nextPageToken, currentFetchTime };
  } catch (err) {
    console.error('Error fetching emails:', err);
    throw err;
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const pageToken = url.searchParams.get('pageToken');
  const lastFetchTime = url.searchParams.get('lastFetchTime');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const { threads, nextPageToken, currentFetchTime } = await fetchEmails(oAuth2Client, pageToken, lastFetchTime, credentials.access_token!);
    return NextResponse.json({ success: true, data: threads, nextPageToken, currentFetchTime }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
