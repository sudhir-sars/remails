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

async function fetchLabelCounts(auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0);

    // Convert to Unix timestamp (seconds since epoch)
    const after = Math.floor(startTime.getTime() / 1000);

    // Fetch all labels
    const labelsResponse = await gmail.users.labels.list({ userId });
    const labels = labelsResponse.data.labels || [];
    console.log(labelsResponse.data)
    const labelCounts: { [key: string]: number } = {};

    for (const label of labels) {
      if (label.id && label.name) {
        try {
          const messagesResponse = await gmail.users.messages.list({
            userId,
            labelIds: [label.id],
            q: `after:${after}`,
          });

          // Get the count of messages matching the time criteria
          const count = messagesResponse.data.resultSizeEstimate || 0;
          

          labelCounts[label.name] = count;
          
        } catch (error) {
          console.error(`Error fetching details for label ${label.name}:`, error);
          // Optionally, you can set a default value or skip this label
         return []
        }
      }
    }

    return labelCounts;
  } catch (err) {
    console.error('Error fetching label counts:', err);
    throw err;
  }
}

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  

  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const labelCounts = await fetchLabelCounts(oAuth2Client);
    

    return NextResponse.json({ success: true,labelCounts }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
