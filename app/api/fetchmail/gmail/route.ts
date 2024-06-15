import DOMPurify from 'dompurify';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
);

interface DecodedToken {
  refreshToken: string;
}

const SCOPES = ['https://mail.google.com/'];

function formatEmailData(email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const fromHeader = headers.find((header) => header.name?.toLowerCase() === 'from');
  const replyToHeader = headers.find((header) => header.name?.toLowerCase() === 'reply-to');
  const subjectHeader = headers.find((header) => header.name?.toLowerCase() === 'subject');
  const senderName = fromHeader?.value?.split('<')[0].trim() || '';
  const senderEmail = fromHeader?.value?.match(/<(.*)>/)?.[1] || '';
  const replyEmail = replyToHeader?.value || '';
  const subject = subjectHeader?.value || '';
  const htmlBody = email.payload?.parts?.find((part) => part.mimeType === 'text/html')?.body?.data || '';
  let decodedHtmlBody = Buffer.from(htmlBody, 'base64').toString('utf-8');
  decodedHtmlBody = decodedHtmlBody.replace(/\r\n/g, '');
  return {
    id: email.id,
    threadId: email.threadId,
    name: senderName,
    email: senderEmail,
    reply: replyEmail,
    snippet: email.snippet,
    subject,
    htmlBody: decodedHtmlBody,
    date: new Date(parseInt(email.internalDate || '0', 10)).toISOString(),
    read: !email.labelIds?.includes('UNREAD'),
    labels: email.labelIds,
  };
}

interface LabelDetails {
  name: string;
  messagesUnread: number;
}

async function listLabels(auth: OAuth2Client) {
  const gmail = google.gmail('v1');
  try {
    const res = await gmail.users.labels.list({
      userId: 'me',
      auth: auth,
    });
    const labelDetailsArray: LabelDetails[] = [];

    const labels = res.data.labels;
    if (labels) {
      for (const label of labels) {
        const labelDetails = await gmail.users.labels.get({
          userId: 'me',
          id: label.id!,
          auth: auth,
        });

        labelDetailsArray.push({
          name: labelDetails.data.name!,
          messagesUnread: labelDetails.data.messagesUnread!,
        });
      }
    }
    return labelDetailsArray;
  } catch (error) {
    console.error('Error listing labels:', error);
    throw error;
  }
}

async function fetchEmailThreads(auth: OAuth2Client, threadIds: Set<string>) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';
  const threads = [];

  const threadIdsArray = Array.from(threadIds); // Convert Set to Array
  for (const threadId of threadIdsArray) {
    try {
      const params: gmail_v1.Params$Resource$Users$Threads$Get = {
        userId,
        id: threadId,
        format: 'full',
        fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate)',
      };

      const thread = await gmail.users.threads.get(params);

      const emails = thread.data.messages!.map((message) => formatEmailData(message));

      threads.push({ threadId, emails });
    } catch (err) {
      console.error(`Error fetching emails for thread ${threadId}:`, err);
    }
  }

  return threads;
}


async function fetchEmails(auth: OAuth2Client, pageToken: string | null, lastFetchTime: string | null) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const query = lastFetchTime ? `after:${lastFetchTime}` : '';

    const response = await gmail.users.messages.list({
      userId,
      maxResults: 10,
      q: query,
      pageToken: pageToken || undefined,
      fields: 'messages(id,threadId),nextPageToken',
    });

    const currentFetchTime = Date.now();
    const messages = response.data.messages || [];

    const threadIds = new Set<string>(messages.map((message) => message.threadId!));
    

    const [labels, threads] = await Promise.all([listLabels(auth), fetchEmailThreads(auth, threadIds)]);

    const nextPageToken = response.data.nextPageToken;

    console.log(`Fetched ${threads.length} threads.`);
    return { threads, nextPageToken, currentFetchTime, labels };
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
    const refreshToken = decoded.refreshToken;

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();

    oAuth2Client.setCredentials(credentials);

    const { threads, nextPageToken, currentFetchTime, labels } = await fetchEmails(oAuth2Client, pageToken, lastFetchTime);
    return NextResponse.json({ success: true, data: threads, nextPageToken, currentFetchTime, labels }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
