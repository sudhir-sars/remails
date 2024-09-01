import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,

);
interface DecodedToken{
  refreshToken:string
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token'); // JWT token containing the refresh token

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    // Decode the JWT to extract the refresh token
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    const refreshToken = decoded.refreshToken 

    // Set the refresh token
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    // Request a new access token
    const { credentials } = await oAuth2Client.refreshAccessToken();

    oAuth2Client.setCredentials(credentials);

    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });

    try {
      const userInfo = await oauth2.userinfo.get();
      // console.log(userInfo);

      return NextResponse.json({ success: true, data: userInfo.data }, { status: 200 });
    } catch (err) {
      console.error('Error fetching user data:', err);
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }
  } catch (err) {
    console.error('Error during token processing:', err);
    return NextResponse.json({ success: false, error: err}, { status: 400 });
  }
}
