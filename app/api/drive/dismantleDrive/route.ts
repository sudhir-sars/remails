import { drive_v3, google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

interface DecodedToken {
  refreshToken: string;
}

async function deleteAllContents(drive: drive_v3.Drive, folderId: string): Promise<void> {
  const listResponse = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: 'files(id, mimeType)',
    spaces: 'drive',
  });

  const items = listResponse.data.files || [];

  for (const item of items) {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      await deleteAllContents(drive, item.id!);
    }
    await drive.files.delete({ fileId: item.id! });
  }
}

export async function POST(req: NextRequest) {
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

    const requestBody = await req.json();
    const folderId = requestBody.folderId;

    if (!folderId) {
      return NextResponse.json({ success: false, error: 'Missing folder ID' }, { status: 400 });
    }

    await deleteAllContents(drive, folderId);

    return NextResponse.json({ success: true, message: 'Folder contents deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete folder contents' }, { status: 500 });
  }
}
