import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import User from '@/middleware/db/Model/user/User';

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

async function formatEmailData(gmail: gmail_v1.Gmail, email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const getHeader = (name: string) => headers.find(header => header.name?.toLowerCase() === name)?.value || '';
  const [senderName, senderEmail] = getHeader('from').split('<');
  
  const { textBody, htmlBody, attachments } = await extractContent(email);

  const attachmentPromises = attachments.map(async (attachment) => {
    const attachmentInfo = await getAttachmentInfo(gmail, 'me', email.id!, attachment.body!.attachmentId!);
    return {
      filename: attachment.filename!,
      mimeType: attachment.mimeType || 'application/octet-stream',
      data: attachmentInfo?.data,
      size: attachmentInfo?.size,
    };
  });

  const resolvedAttachments = await Promise.all(attachmentPromises);

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
    attachments: resolvedAttachments,
  };
}

interface LabelCount {
  name: string;
  count: number;
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
        return { name: label.name, count };
      } catch (error) {
        console.error(`Error fetching details for label ${label.name}:`, error);
        return { name: label.name, count: 0 };
      }
    });

    return await Promise.all(labelCountsPromises);
  } catch (err) {
    console.error('Error fetching label counts:', err);
    throw err;
  }
}
async function fetchEmailId(auth: OAuth2Client, messageIds:string[]) {
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
      return emails ;
    } catch (err) {
      console.error(`Error fetching emails for thread ${messageId}:`, err);
      return null;
    }
  };

  const messages = await Promise.all(Array.from(messageIds).map(fetchMessage));
  return messages.filter(thread => thread !== null);
}


async function fetchEmailsSinceHistoryId(auth: OAuth2Client, historyId: string, ) {
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.history.list({
      userId: 'me',
      startHistoryId: historyId,
    });

    const messageIdSet = new Set<string>();

    if (response.data.history) {
      for (const historyItem of response.data.history) {
        if (historyItem.messagesAdded) {
          for (const messageAdded of historyItem.messagesAdded) {
            if (messageAdded.message?.id) {
              console.log(messageAdded.message?.id)
              messageIdSet.add(messageAdded.message.id);
            }
          }
        }
      }
    }
    const uniqueMessageIds = Array.from(messageIdSet);
    
    const currentFetchTime = Date.now();
  
    const emails = await fetchEmailId(auth, uniqueMessageIds);
    const labelCounts = await fetchLabelCounts(auth);

    return { emails, currentFetchTime, labelCounts };
  } catch (err) {
    console.error(`Error fetching emails`, err);
    return { emails: [], currentFetchTime: Date.now(), labelCounts: [] };
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const newHistoryId = url.searchParams.get('newHistoryId');
  const userId = url.searchParams.get('userId');

  if (!token || !userId) {
    return NextResponse.json({ success: false, error: 'Missing token or historyId' }, { status: 400 });
  }
  if (!newHistoryId) {
    return NextResponse.json({ success: true, error: 'Assuming this as initial request' }, { status: 200 });
  }

  try {
    const decoded = jwt.verify(token!, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const user = await User.findOne({ userId: userId });
    const { historyId } = user;

    const { emails, currentFetchTime, labelCounts } = await fetchEmailsSinceHistoryId(oAuth2Client, historyId);
    // const { response } = await fetchEmailsSinceHistoryId(oAuth2Client, historyId, credentials.access_token!);
    console.log(emails.length)
    user.historyId = newHistoryId;
    await user.save();

    return NextResponse.json({ success: true, data: emails, currentFetchTime, labelCounts }, { status: 200 });
    // return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token or fetching emails', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token or fetch emails' }, { status: 500 });
  }
};
