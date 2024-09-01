import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';

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
  data: string;
  size: number;
  extension: string;
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

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const messageId = url.searchParams.get('messageId');

  if (!messageId) {
    return NextResponse.json({ success: false, error: 'Missing messageId parameter' }, { status: 400 });
  }

  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Missing Authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Invalid Authorization header format' }, { status: 401 });
    }

    // Verify and set credentials
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Get the email message
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    // Extract attachments
    const { attachments } = await extractContent(message.data);

    const attachmentPromises = attachments.map(async (attachment) => {
      const attachmentData = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachment.body?.attachmentId!,
      });

      const buffer = Buffer.from(attachmentData.data.data!, 'base64');
      return {
        filename: attachment.filename!,
        mimeType: attachment.mimeType!,
        data: buffer.toString('base64'),
        size: buffer.length,
        extension: attachment.filename!.split('.').pop()!,
      };
    });

    const attachmentResults = await Promise.all(attachmentPromises);

    return NextResponse.json({ success: true, attachments: attachmentResults }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attachments' }, { status: 500 });
  }
};
