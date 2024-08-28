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

function extractEmailAddress(header: string): string[] {
  return header.split(',').map(part => {
    part = part.trim(); // Remove extra whitespace
    if (part.includes('<') && part.includes('>')) {
      // Extract email from within < >
      const match = part.match(/<([^>]+)>/);
      return match ? match[1].trim() : part;
    } else {
      // Return the part directly
      return part;
    }
  }).filter(email => email.includes('@')); // Ensure only valid email addresses are included
}


async function formatEmailData(gmail: gmail_v1.Gmail, email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const getHeader = (name: string) => headers.find(header => header.name?.toLowerCase() === name)?.value || '';
  const [senderName, senderEmail] = getHeader('from').split('<');
  const to = extractEmailAddress(getHeader('to'));
  const cc = extractEmailAddress(getHeader('cc'));
  const bcc = extractEmailAddress(getHeader('bcc'));

  const { textBody, htmlBody, attachments } = await extractContent(email);

  const attachmentPromises = attachments.map(async (attachment) => {
    // const attachmentInfo = await getAttachmentInfo(gmail, 'me', email.id!, attachment.body!.attachmentId!);
    return {
      filename: attachment.filename!,
      mimeType: attachment.mimeType || 'application/octet-stream',
      // data: attachmentInfo?.data,
      // size: attachmentInfo?.size,
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
    labels: email.labelIds || [],
    attachments: resolvedAttachments,
    to,
    cc,
    bcc
    
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

      const emailData = await formatEmailData(gmail, data);
      return {
        [emailData.id!]: emailData
      };
    } catch (err) {
      console.error(`Error fetching emails for thread ${messageId}:`, err);
      return null;
    }
  };

  const messages = await Promise.all(Array.from(messageIds).map(fetchMessage));
  const emails = messages.reduce((acc, message) => ({ ...acc, ...message }), {} as Record<string, any>);
  return emails;
}

async function fetchEmails(auth: OAuth2Client, pageToken: string | null, lastFetchTime: string | null, labelName: string | null,  senders: string[] = [],
  domains: string[] = []) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';
  const mailsToFetch = 100;

  try {
    let query = lastFetchTime ? `after:${lastFetchTime}` : '';

    if (labelName) {
      const response = await gmail.users.messages.list({
        userId,
        maxResults: mailsToFetch,
        q: query,
        labelIds: [labelName],
        pageToken: pageToken || undefined,
        fields: 'messages(id),nextPageToken',
      });

      const currentFetchTime = Date.now();

      const messageIds = (response.data.messages || []).map(message => message.id!);

      const [emails, labelCounts] = await Promise.all([
        fetchEmailId(auth, messageIds),
        fetchLabelCounts(auth)
      ]);

      const emailCount = emails ? Object.keys(emails).length : 0;
      console.log("fetched " + emailCount + " emails")

      return { emails: emails || {}, nextPageToken: response.data.nextPageToken, currentFetchTime, labelCounts };
    } else if (senders || domains) {
      let senderDomainQueryParts: string[] = [];

    if (senders.length > 0) {
      const sendersQuery = senders.map(sender => `from:${sender}`).join(' OR ');
      senderDomainQueryParts.push(`(${sendersQuery})`);
    }
    if (domains.length > 0) {
      const domainsQuery = domains.map(domain => `from:@${domain}`).join(' OR ');
      senderDomainQueryParts.push(`(${domainsQuery})`);
    }
    if (senderDomainQueryParts.length > 0) {
      query += ` (${senderDomainQueryParts.join(' OR ')})`;
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

      const emailCount = emails ? Object.keys(emails).length : 0;
      console.log("fetched " + emailCount + " emails")

      return { emails: emails || {}, nextPageToken: response.data.nextPageToken, currentFetchTime, labelCounts };
    } else {
      // Fallback behavior if neither labelName, sender, nor domain is specified
      const response = await gmail.users.messages.list({
        userId,
        maxResults: mailsToFetch,
        // maxResults: mailsToFetch,
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

      const emailCount = emails ? Object.keys(emails).length : 0;
      console.log("fetched " + emailCount + " emails")

      return { emails: emails || {}, nextPageToken: response.data.nextPageToken, currentFetchTime, labelCounts };
    }

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
  const labelId = url.searchParams.get('labelId');
  const sender = url.searchParams.get('sender');
  const domain = url.searchParams.get('domain');

  // Convert sender and domain parameters into arrays if they exist
  const senders = sender ? sender.split(',').map(s => s.trim()) : [];
  const domains = domain ? domain.split(',').map(d => d.trim()) : [];

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    // Verify and set credentials
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    console.log(decoded.refreshToken)
    oAuth2Client.setCredentials(credentials);

    // Fetch emails based on provided parameters
    const { emails, nextPageToken, currentFetchTime, labelCounts } = await fetchEmails(
      oAuth2Client,
      pageToken,
      lastFetchTime,
      labelId,
      senders,
      domains
    );

  
    return NextResponse.json({ success: true, data: emails, nextPageToken, currentFetchTime, labelCounts }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving emails or refreshing access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve emails or refresh access token' }, { status: 500 });
  }
};
