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

async function fetchEmailThreads(auth: OAuth2Client, threadIds: Set<string>, accessToken: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  const fetchThread = async (threadId: string) => {
    try {
      const { data } = await gmail.users.threads.get({
        userId,
        id: threadId,
        format: 'full',
        fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate)',
      });

      const emails = data
      return  emails 
    } catch (err) {
      console.error(`Error fetching emails for thread ${threadId}:`, err);
      return null;
    }
  };

  const threads = await Promise.all(Array.from(threadIds).map(fetchThread));
  return threads.filter(thread => thread !== null);
}


interface LabelCount {
  name: string;
  count: number;
}
async function fetchLabelCounts(auth: OAuth2Client): Promise<LabelCount[]> {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const labelsResponse = await gmail.users.labels.list({ userId });
    const labels = labelsResponse.data.labels || [];

    const labelCountsPromises = labels.map(async (label) => {
      if (!label.id || !label.name) {
        console.warn('Label missing id or name:', label);
        return { name: 'unknown', count: 0 };
      }

      try {
        const labelData = await gmail.users.labels.get({ userId, id: label.id });
        const count = labelData.data.messagesTotal || 0;
        return { name: label.name, count };
      } catch (error) {
        console.error(`Error fetching details for label ${label.name}:`, error);
        return { name: label.name, count: 0 };
      }
    });

    return await Promise.all(labelCountsPromises);
  } catch (err) {
    console.error('Error fetching label counts:', err);
    throw err;
  }
}

async function fetchEmails(auth: OAuth2Client, accessToken: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    
    const response = await gmail.users.messages.list({
      userId,
      maxResults:1 ,
      fields: 'messages(id,threadId),nextPageToken',
    });
   

    const threadIds = new Set<string>((response.data.messages || []).map(message => message.threadId!));

    const email = await 
      fetchEmailThreads(auth, threadIds, accessToken)

    return  email 
  } catch (err) {
    console.error('Error fetching emails:', err);
    throw err;
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const pageToken = url.searchParams.get('pageToken');
  const lastFetchTime = url.searchParams.get('lastFetchTime');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const  email = await fetchEmails(oAuth2Client, credentials.access_token!);

    return NextResponse.json({ success: true, email: email }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
