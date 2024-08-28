import { drive_v3 } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

interface DecodedToken {
  refreshToken: string;
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const fileId = url.searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ success: false, error: 'Missing fileId parameter' }, { status: 400 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Missing Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Invalid Authorization header format' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Get the file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name',
    });

    // Generate a link to download the file
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    return NextResponse.json({ success: true, downloadUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to generate download link' }, { status: 500 });
  }
};
