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

async function fetchEmails(auth: OAuth2Client, threadId: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const { data } = await gmail.users.threads.get({
      userId,
      id: threadId,
      format: 'full',
      fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate)',
    });

    

    const email = data.messages;
    return email;
  } catch (err) {
    console.error(`Error fetching emails for thread ${threadId}:`, err);
    return null;
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const threadId = url.searchParams.get('threadId');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  if (!threadId) {
    return NextResponse.json({ success: false, error: 'Missing threadId parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const email = await fetchEmails(oAuth2Client, threadId);

    if (!email || email.length === 0) {
      return NextResponse.json({ success: false, error: 'No emails found for the given thread ID' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: email }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
