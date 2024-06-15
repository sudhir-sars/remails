import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

interface DecodedToken {
  accessToken: string;
  refreshToken: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' });
    }

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({
      access_token: decoded.accessToken,
      refresh_token: decoded.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const too="sudhir.72744@gmail.com"
    const email = [
      `From: "Your Name" <your-email@gmail.com>`,
      `To: ${too}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset="UTF-8"`,
      '',
      html
    ].join('\n');

    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully', response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' });
  }
};
