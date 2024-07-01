import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { serialize } from 'cookie';
import { getTempSession, setTempSession, deleteTempSession } from '../../../../utils/session';
import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const tokenGenCode = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  let sessionId: string;
  console.log("Search Parameters:");

  url.searchParams.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  try {
    ({ sessionId } = JSON.parse(state || '{}'));
  } catch (error) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid state parameter' });
  }

  if (!tokenGenCode || !sessionId) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid request' });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(tokenGenCode);
    const { refresh_token, access_token } = tokens;

    if (!refresh_token) {
      console.error('Refresh token not returned. User may need to reauthenticate.');
    }

    const payload = {
      refreshToken: refresh_token,
      sessionId,
    };

    const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: '1h' });
    const redirectUrl = `${process.env.NEXT_PUBLIC_HOST}/?JWT_token=${token}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to exchange code for token' });
  }
};
