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

async function checkOrCreateFolder(drive: drive_v3.Drive, folderName: string): Promise<string> {
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  const folders = response.data.files;
  if (folders && folders.length > 0) {
    return folders[0].id!;
  }

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return folder.data.id!;
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

    // You might want to use a query parameter for the folder name in the URL
    const url = new URL(req.url);
    const folderName = url.searchParams.get('folderName') || 'remailsMetaData'; // Default to 'remailsMetaData' if not specified

    const folderId = await checkOrCreateFolder(drive, folderName);

    return NextResponse.json({ success: true, folderId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
