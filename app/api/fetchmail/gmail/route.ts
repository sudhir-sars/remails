import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
);

interface DecodedToken {
  refreshToken: string;
}

const SCOPES = ['https://mail.google.com/'];

// Function to format the email data
function formatEmailData(email: any) {
  const headers = email.payload?.headers || [];
  const fromHeader = headers.find((header) => header.name?.toLowerCase() === 'from');
  const subjectHeader = headers.find((header) => header.name?.toLowerCase() === 'subject');

  const senderName = fromHeader?.value?.split('<')[0].trim() || '';
  const senderEmail = fromHeader?.value?.match(/<(.*)>/) ? fromHeader.value.match(/<(.*)>/)[1] : '';
  const subject = subjectHeader?.value || '';

  const snippet = email.snippet || '';
  const text = email.payload?.parts
    ?.find((part) => part.mimeType === 'text/plain')
    ?.body.data.replace(/-/g, '+').replace(/_/g, '/') || '';

  const decodedText = Buffer.from(text, 'base64').toString('utf-8');

  return {
    id: email.id,
    threadId: email.threadId,
    name: senderName,
    email: senderEmail,
    subject,
    text: decodedText,
    date: new Date(parseInt(email.internalDate, 10)).toISOString(),
    read: !email.labelIds.includes('UNREAD'),
    labels: email.labelIds,
  };
}

async function fetchEmails(auth: OAuth2Client, pageToken: any) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const response = await gmail.users.messages.list({
      userId,
      maxResults: 2,
      pageToken,
      fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate),nextPageToken',
    });

    const messageIds = response.data.messages?.map((message) => message.id) || [];
    const emails = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await gmail.users.messages.get({
          userId,
          id: messageId!,
          format: 'full',
        });

        // return formatEmailData(message.data);
        return message.data
      })
    );

    const nextPageToken = response.data.nextPageToken;

    console.log(`Fetched ${emails.length} emails.`);

    return { emails, nextPageToken };
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
    return NextResponse.json({ success: false, error: 'Missing code parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    const refreshToken = decoded.refreshToken;
    // Set the refresh token
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();

    oAuth2Client.setCredentials(credentials);

    const { emails, nextPageToken } = await fetchEmails(oAuth2Client, pageToken);
    return NextResponse.json({ success: true, data: emails, nextPageToken }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};