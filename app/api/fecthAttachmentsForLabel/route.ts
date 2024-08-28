import { drive_v3 } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

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
  thumbnailLink?: string;
  webViewLink?: string;
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

async function fetchAttachmentDetails(gmail: gmail_v1.Gmail, messageId: string): Promise<gmail_v1.Schema$MessagePart[]> {
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'metadata', // Fetch only metadata
  });

  const parts = message.data.payload?.parts || [];
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

  return attachments;
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
  const pageToken = url.searchParams.get('pageToken') || ''; // Handle page token
  const token = url.searchParams.get('token') || ''; // Handle page token

  try {
   
    if (!token) {
      return NextResponse.json({ success: false, error: 'Invalid Authorization header format' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Fetch messages with attachments, limited to 10 per request
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'has:attachment', // Query to get only messages with attachments
      maxResults: 50,
      pageToken,
    });

    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;

    const attachments: Attachment[] = [];
    const folderId = await createFolder(drive, 'remailsMetaData');

    const messageProcessingPromises = messages.map(async (message) => {
      const messageId = message.id;

      if (!messageId) return;

      const messageAttachments = await fetchAttachmentDetails(gmail, messageId);

      const attachmentPromises = messageAttachments.map(async (attachment) => {
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
          mimeType: attachment.mimeType!,
          fileId:driveResponse.data.id,
          thumbnailLink: driveResponse.data.thumbnailLink!,
          webViewLink: driveResponse.data.webViewLink!,
        };
      });

      const attachmentResults = await Promise.all(attachmentPromises);
      attachments.push(...attachmentResults);
    });

    await Promise.all(messageProcessingPromises);

    return NextResponse.json({
      success: true,
      attachments,
      nextPageToken, // Include nextPageToken in response
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attachments' }, { status: 500 });
  }
};
