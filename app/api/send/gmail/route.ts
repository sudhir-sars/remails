import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import Receipt from '@/middleware/db/Model/reciept/Reciept';
import connectDb from '@/middleware/db/mongoose';
import { JSDOM } from 'jsdom';

const oAuth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_REDIRECT_URI
);

const drive = google.drive({ version: 'v3', auth: oAuth2Client });
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

interface DecodedToken {
  refreshToken: string;
}

const addTrackingPixel = async (htmlContent: string, GUID: string): Promise<string> => {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const trackingPixel = document.createElement('img');
  trackingPixel.src = `${process.env.NEXT_PUBLIC_HOST}/api/gmail/receipt?GUID=${GUID}`;
  trackingPixel.alt = '';
  trackingPixel.style.display = 'none';

  document.body.appendChild(trackingPixel);

  return dom.serialize();
};

const fetchFileFromDrive = async (fileId: string): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> => {
  try {
    // Fetch the file data from Google Drive
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, {
      responseType: 'arraybuffer', // Ensure response type is ArrayBuffer
    });

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(response.data as ArrayBuffer);
    
    // Fetch file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType',
    });

    const mimeType = fileMetadata.data.mimeType || 'application/octet-stream';
    const fileName = fileMetadata.data.name || 'attachment';

    return { buffer, mimeType, fileName };
  } catch (error) {
    console.error('Error fetching file from Google Drive:', error);
    throw new Error('Failed to fetch file from Google Drive');
  }
};


export const POST = connectDb(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    console.log(formData)
    const to = formData.get('to') as string;
    const subject = formData.get('subject') as string;
    const html = formData.get('html') as string;
    const cc = formData.get('cc') as string;
    const bcc = formData.get('bcc') as string;
    const fileIds = formData.get('fileIds') as string; // Expecting a comma-separated string of file IDs
    const fromName = formData.get('fromName') as string;
    const fromEmail = formData.get('fromEmail') as string;

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' });
    }

    if (!to || !subject || !html || !fromName || !fromEmail) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' });
    }

    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const GUID = uuidv4();

    const boundary = 'foo_bar_baz';
    const modifiedHtml = await addTrackingPixel(html, GUID);

    let email = [
      `From: "${fromName}" <${fromEmail}>`,
      `To: ${to}`,
    ];

    if (cc) {
      email.push(`Cc: ${cc}`);
    }

    if (bcc) {
      email.push(`Bcc: ${bcc}`);
    }

    email = email.concat([
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 7bit',
      '',
      modifiedHtml,
      '',
    ]);

    let attachmentCount = 0;
    const fileIdsArray = fileIds ? fileIds.split(',') : [];

    for (const fileId of fileIdsArray) {
      const { buffer, mimeType, fileName } = await fetchFileFromDrive(fileId);
      attachmentCount++;
      const base64Data = buffer.toString('base64');

      email = email.concat([
        `--${boundary}`,
        `Content-Type: ${mimeType}; name="${fileName}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${fileName}"`,
        '',
        base64Data,
        '',
      ]);
    }

    email.push(`--${boundary}--`);

    const encodedEmail = Buffer.from(email.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      });
      
      if (response.status === 200) {
        const newReceipt = new Receipt({
          GUID: GUID,
        });
        console.log(`Sending email with ${attachmentCount} attachments`);
      await newReceipt.save();
      return NextResponse.json({ success: true, message: 'Email sent successfully', response });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to send email', response });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' });
  }
});
