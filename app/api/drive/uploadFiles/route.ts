import { drive_v3, google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';


const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

interface DecodedToken {
  refreshToken: string;
}

interface UploadedFile {
  filename: string;
  fileId: string;
  mimeType: string;
  thumbnailLink: string;
  webViewLink: string;
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

async function makeFilePublic(drive: drive_v3.Drive, fileId: string): Promise<void> {
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
}

async function uploadFile(drive: drive_v3.Drive, file: File): Promise<UploadedFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileSizeInMB = buffer.byteLength / (1024 * 1024);

  const fileMetadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    // No parent folder specified, so file goes to root
    parents: [], 
  };

  const media = {
    mimeType: file.type || 'application/octet-stream',
    body: bufferToStream(buffer),
  };

  const driveResponse = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, thumbnailLink',
  });

  await makeFilePublic(drive, driveResponse.data.id!);

  return {
    filename: file.name,
    fileId: driveResponse.data.id!,
    mimeType: file.type || 'application/octet-stream',
    thumbnailLink: driveResponse.data.thumbnailLink || '',
    webViewLink: driveResponse.data.webViewLink || '',
  };
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

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    
    // Log details about each file received
    files.forEach(file => {
      console.log(`Received file: ${file.name}, size: ${file.size} bytes`);
    });

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files were uploaded.' }, { status: 400 });
    }

    const uniqueFiles = Array.from(new Set(files.map(file => file.name)))
      .map(name => files.find(file => file.name === name)!);

    const uploadPromises = uniqueFiles.map(file => 
      uploadFile(drive, file)
    );
    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({ success: true, files: uploadedFiles }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to upload files' }, { status: 500 });
  }
}
