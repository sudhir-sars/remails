import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { serialize } from 'cookie'; // Import serialize function from cookie package
import { getTempSession, setTempSession, deleteTempSession } from '../../../../utils/session';
import jwt from 'jsonwebtoken';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token_gen_code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  let sessionId: string;

  try {
    ({ sessionId } = JSON.parse(state || '{}'));
  } catch (error) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid state parameter' });
  }

  if (!token_gen_code || !sessionId) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid request' });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(token_gen_code);
    const {refresh_token,access_token,expiry_date}=tokens
    // Create a JWT with the tokens and session ID as payload
    const payload = {
      token_gen_code,
      access_token,
      refresh_token,
      sessionId,
      expiry_date
    };
    const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: '1h' });

    // Construct the redirect URL with the JWT as a query parameter
    const redirectUrl = `http://localhost:3000/?token=${token}`;

    // Return response with cookie set
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to exchange code for token' });
  }
};