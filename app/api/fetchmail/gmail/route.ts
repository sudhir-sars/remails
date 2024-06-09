
import DOMPurify from 'dompurify';
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import { emit } from 'process';

const oAuth2Client = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
);

interface DecodedToken {
  refreshToken: string;
}

const SCOPES = ['https://mail.google.com/'];

function formatEmailData(email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const fromHeader = headers.find((header) => header.name?.toLowerCase() === 'from');
  const replyToHeader = headers.find((header) => header.name?.toLowerCase() === 'reply-to');
  const subjectHeader = headers.find((header) => header.name?.toLowerCase() === 'subject');
  // const snippet = headers.find((header) => header.name?.toLowerCase() === 'snipper');
  const senderName = fromHeader?.value?.split('<')[0].trim() || '';
  const senderEmail = fromHeader?.value?.match(/<(.*)>/)?.[1] || '';
  const replyEmail = replyToHeader?.value || '';
  const subject = subjectHeader?.value || '';
  const htmlBody = email.payload?.parts?.find((part) => part.mimeType === 'text/html')?.body?.data || '';
  // const htmlText = email.payload?.parts?.find((part) => part.mimeType === 'text/html')?.body?.data || '';
  let decodedHtmlBody = Buffer.from(htmlBody, 'base64').toString('utf-8');
  // decodedHtmlBody = decodedHtmlBody.replace('\r\n', '')
  // decodedHtmlBody = DOMPurify.sanitize(decodedHtmlBody);
  decodedHtmlBody = decodedHtmlBody.replace(/\r\n/g, '');
  return {
    id: email.id,
    threadId: email.threadId,
    name: senderName,
    email: senderEmail,
    reply: replyEmail,
    snippet:email.snippet,
    subject,
    htmlBody: decodedHtmlBody,
    
    date: new Date(parseInt(email.internalDate || '0', 10)).toISOString(),
    read: !email.labelIds?.includes('UNREAD'),
    labels: email.labelIds,
    // htmlText:email
  };
}

async function fetchEmailThreads(auth: OAuth2Client, threadId: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  try {
    

    const params: gmail_v1.Params$Resource$Users$Threads$Get = {
      userId,
      id: threadId,
      format:"full",
      
      fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate)',
    };

    const thread = await gmail.users.threads.get(params);

    if (!thread.data.messages) {
      console.log(`No messages found in thread ${threadId}.`);
      return [];
    }
    // console.log(thread.data.messages[0])
    
    const emails = await Promise.all(
      thread.data.messages
        .filter((message) => message.id && true)
        .map(async (message) => {
          const fullMessage = await gmail.users.messages.get({
            userId,
            id: message.id!,
            format: 'full',
            // q:lastFetchTime,
          });
          // console.log(fullMessage.data.payload?.headers)
          return formatEmailData(fullMessage.data);
          
        })
    );

    console.log(`Fetched ${emails.length} emails from thread ${threadId}.`);
    return emails;
  } catch (err) {
    console.error(`Error fetching emails for thread ${threadId}:`, err);
    throw err;
  }
}

async function fetchEmails(auth: OAuth2Client, pageToken: string | null,lastFetchTime:number) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';
  
  
  try {
    const query = lastFetchTime ? `after:${lastFetchTime}` : '';

    const response = await gmail.users.messages.list({
      userId,
      maxResults: 20,
      q: query,
      pageToken: pageToken || undefined,  // Handle undefined pageToken
      fields: 'messages(id,threadId,labelIds,snippet,payload,internalDate),nextPageToken',
    });
    const currentFetchTime=Date.now();

    

    const messageIds = response.data.messages?.map((message) => message.id) || [];
   
    

    const emails = await Promise.all(
      messageIds.map(async (messageId) => {
        const message = await gmail.users.messages.get({
          userId,
          id: messageId!,
          format: 'metadata',
        });

        // const formattedEmail = formatEmailData(message.data);
        const emailThreads = await fetchEmailThreads(auth, message.data.threadId);
        
        // console.log(emailThreads)
        return {  threads: emailThreads };
      })
    );

    const nextPageToken = response.data.nextPageToken;

    console.log(`Fetched ${emails.length} emails.`);

    return { emails, nextPageToken ,currentFetchTime};
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
  console.log(pageToken)
  console.log(lastFetchTime)
 


  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token parameter' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!) as DecodedToken;
    const refreshToken = decoded.refreshToken;

    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();

    oAuth2Client.setCredentials(credentials);

    const { emails, nextPageToken,currentFetchTime } = await fetchEmails(oAuth2Client, pageToken, lastFetchTime);
    return NextResponse.json({ success: true, data: emails, nextPageToken,currentFetchTime }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve access token' }, { status: 500 });
  }
};
