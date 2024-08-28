// In your API routes (e.g., /api/gmail/endWatch.ts)
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as { refreshToken: string };
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });

    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    await gmail.users.stop({ userId: 'me' });

    return NextResponse.json({ success: true, message: 'Watch ended successfully' });
  } catch (error) {
    console.error('Error ending watch:', error);
    return NextResponse.json({ success: false, error: 'Failed to end watch' }, { status: 500 });
  }
}