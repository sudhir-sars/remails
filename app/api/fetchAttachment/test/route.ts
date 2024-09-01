import { drive_v3 } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid function

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

interface DecodedToken {
  refreshToken: string;
}

interface Attachment {
  filename: string;
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

async function extractContent(email: gmail_v1.Schema$Message): Promise<{ attachments: gmail_v1.Schema$MessagePart[] }> {
  const parts = email.payload?.parts || [];
  const attachments: gmail_v1.Schema$MessagePart[] = [];

  const recursiveExtract = async (parts: gmail_v1.Schema$MessagePart[]): Promise<void> => {
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      } else if (part.parts) {
        await recursiveExtract(part.parts);
      }
    }
  };

  await recursiveExtract(parts);

  if (attachments.length === 0) {
    const topLevelParts = email.payload?.parts || [];
    for (const part of topLevelParts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      }
    }
  }

  return { attachments };
}

async function createFolder(drive: drive_v3.Drive, folderName: string): Promise<string> {
  const folderResponse = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (folderResponse.data.files && folderResponse.data.files.length > 0) {
    return folderResponse.data.files[0].id!;
  }

  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id!;
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

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const messageId = url.searchParams.get('messageId');

  if (!messageId) {
    return NextResponse.json({ success: false, error: 'Missing messageId parameter' }, { status: 400 });
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

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    const { attachments } = await extractContent(message.data);

    const folderId = await createFolder(drive, 'remailsMetaData');

    const attachmentPromises = attachments.map(async (attachment) => {
      if (!attachment.mimeType) {
        throw new Error(`Attachment ${attachment.filename} has no MIME type.`);
      }

      const attachmentData = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachment.body?.attachmentId!,
      });

      const buffer = Buffer.from(attachmentData.data.data!, 'base64');

      // Generate a GUID and append it to the filename
      const guid = uuidv4();
      const newFilename = `${guid}_${attachment.filename}`;

      const fileMetadata = {
        name: newFilename, // Use the new filename with GUID
        mimeType: attachment.mimeType,
        parents: [folderId],
      };
      const media = {
        mimeType: attachment.mimeType,
        body: bufferToStream(buffer),
      };

      const driveResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, thumbnailLink',
      });

      // Make the file public
      await makeFilePublic(drive, driveResponse.data.id!);

      return {
        filename: newFilename, // Return the new filename
        fileId:driveResponse.data.id,
        mimeType: attachment.mimeType!,
        thumbnailLink: driveResponse.data.thumbnailLink!,
        webViewLink: driveResponse.data.webViewLink!,
      };
    });

    const attachmentResults = await Promise.all(attachmentPromises);

    return NextResponse.json({ success: true, attachments: attachmentResults }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attachments' }, { status: 500 });
  }
};
