// /utils/uploadToDrive.ts

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!
);

function bufferToStream(buffer: Buffer): ReadableStream<Uint8Array> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(buffer);
      controller.close();
    },
  });
  return stream;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oAuth2Client.refreshAccessToken();
  return credentials.access_token!;
}

export async function createFolder(drive: drive_v3.Drive, folderName: string): Promise<string> {
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

export async function createFolderIfNotExists(accessToken: string, folderName: string) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  oAuth2Client.setCredentials({ access_token: accessToken });
  return await createFolder(drive, folderName);
}

export async function uploadFileToDrive(file: File, folderId: string | null, accessToken: string) {
  oAuth2Client.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const fileMetadata = {
    name: file.name,
    mimeType: file.type,
    parents: folderId ? [folderId] : undefined,
  };

  const media = {
    mimeType: file.type,
    body: file.stream(),
  };

  const driveResponse = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, thumbnailLink',
  });

  await drive.permissions.create({
    fileId: driveResponse.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: driveResponse.data.id!,
    webViewLink: driveResponse.data.webViewLink!,
    thumbnailLink: driveResponse.data.thumbnailLink!,
  };
}
