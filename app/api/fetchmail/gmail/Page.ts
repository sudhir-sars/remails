import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import cookie from 'cookie';
import CryptoJS from 'crypto-js';

// Replace with your credentials
const CLIENT_ID = '453820533420-8bc3787ivpb4fm527991kgsqoepp6ko6.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = `http://localhost:3000/api/auth/callback`;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const encryptToken = async(tokens:any, secretKey:string) => {
  return CryptoJS.AES.encrypt(tokens, secretKey).toString();
};

const decryptToken = async(encryptedToken:any, secretKey:string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
];

// Function to fetch the first five emails
async function fetchEmails(auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const response = await gmail.users.messages.list({
      userId,
      maxResults: 100,
      fields: 'messages(id)',
    });

    const messageIds = response.data.messages?.map(message => message.id) || [];

    const emails = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await gmail.users.messages.get({
          userId,
          id: messageId!,
          format: 'full',
        });

        const headers = message.data.payload?.headers || [];
        const fromHeader = headers.find(header => header.name?.toLowerCase() === 'from');

        if (fromHeader) {
          const senderName = fromHeader.value?.split('<')[0].trim();
          const emailMatch = fromHeader.value?.match(/<(.*)>/);
          const senderEmail = emailMatch ? emailMatch[1] : '';

          return {
            ...message.data,
            senderName,
            senderEmail,
          };
        }

        return message.data;
      })
    );

    console.log(`Fetched ${emails.length} emails.`);
    return emails;
  } catch (err) {
    console.error('Error fetching emails:', err);
    throw err;
  }
}

export const GET = async (req: NextRequest) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return NextResponse.redirect(authUrl);
};

export const POST = async (req: NextRequest) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing code parameter' }, { status: 400 });
  }

  try {
  
    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    // console.log('Access Token:', tokens.access_token);
    // console.log('Refresh Token:', tokens.refresh_token);

    const emails = await fetchEmails(oAuth2Client);
    return NextResponse.json({ success: true, data: emails }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
