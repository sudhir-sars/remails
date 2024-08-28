import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { gmail_v1 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

// Initialize OAuth2Client
const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!
);

// Define the structure of the decoded JWT token
interface DecodedToken {
  refreshToken: string;
}
async function fetchEmails(auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';
  let emailAddresses = new Set<string>();
  let pageToken: string | undefined = undefined;

  do {
    try {
      const response: GaxiosResponse<gmail_v1.Schema$ListMessagesResponse> = await gmail.users.messages.list({
        userId,
        maxResults: 500,
        pageToken: pageToken || undefined,
        q: 'in:anywhere', // This should fetch all emails in all folders
        fields: 'messages(id,payload/headers),nextPageToken',
      });

      if (response.status === 204) {
        console.log('No messages found in the mailbox.');
        break;
      }

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        console.log('No messages returned in this page.');
        break;
      }

      messages.forEach(message => {
        if (message.payload && message.payload.headers) {
          const extractedEmails = extractEmailAddresses(message.payload.headers);
          extractedEmails.forEach(email => emailAddresses.add(email));
        }
      });

      pageToken = response.data.nextPageToken!;
      
      // Optional: Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error fetching emails:', error);
      // Implement appropriate error handling here
      break;
    }
  } while (pageToken);

  return Array.from(emailAddresses);
}
function extractEmailAddresses(headers: gmail_v1.Schema$MessagePartHeader[]): string[] {
  const emailRegex = /<([^>]+)>/;
  const extractedEmails: string[] = [];

  headers.forEach((header) => {
    if (header.name && header.value && ['From', 'To', 'Cc', 'Bcc'].includes(header.name)) {
      const addresses = header.value.split(',');
      addresses.forEach((address: string) => {
        const match = address.match(emailRegex);
        if (match) {
          extractedEmails.push(match[1]);
        }
      });
    }
  });

  return extractedEmails;
}

// Handler for GET requests
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  console.log(token)
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify and set credentials
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    // Fetch emails and get unique email addresses
    const emails = await fetchEmails(oAuth2Client);

    // Respond with the fetched data
    return NextResponse.json({ success: true, message: 'Fetched successfully', data: emails }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving emails or refreshing access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve emails or refresh access token' }, { status: 500 });
  }
}