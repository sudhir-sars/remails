
// app/api/semantic-search/route.ts

import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OAuth2Client } from 'google-auth-library';
import { google, gmail_v1 } from 'googleapis';
import jwt from 'jsonwebtoken';
import {generalQueries} from '../../constants/hyperSearch'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
import { stripHtml } from 'string-strip-html';
import { generalQueryResponse } from '../../constants/hyperSearch';
function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = stripHtml(input).result;
  // Remove special characters
  sanitized = sanitized.replace(/[^\w\s?]/gi, '');
  // Trim whitespace
  return sanitized.trim();
}


function checkForSuspiciousPatterns(query: string): boolean {
  const suspiciousPatterns = [
    /sql/i,
    /inject/i,
    /script/i,
    /eval\(/i,
    /execute/i,
    /system\(/i,
    /command/i,
    /prompt/i,
    /\b(and|or)\b.*=.*/i,
    /union.*select/i,
    /base64/i,
    /\/etc\/passwd/i,
    /\/bin\/bash/i,
    /cmd\.exe/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(query));
}


// // Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);

interface DecodedToken {
  refreshToken: string;
}

async function extractContent(email: gmail_v1.Schema$Message): Promise<{ textBody: string, htmlBody: string, attachments: gmail_v1.Schema$MessagePart[] }> {
  const parts = email.payload?.parts || [];
  let textBody = '';
  let htmlBody = '';
  const attachments: gmail_v1.Schema$MessagePart[] = [];

  const recursiveExtract = async (parts: gmail_v1.Schema$MessagePart[]): Promise<void> => {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      } else if (part.parts) {
        await recursiveExtract(part.parts);
      }
    }
  };

  await recursiveExtract(parts);

  // Fallback checks
  if (!textBody && email.payload?.mimeType === 'text/plain' && email.payload?.body?.data) {
    textBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  if (!htmlBody && email.payload?.mimeType === 'text/html' && email.payload?.body?.data) {
    htmlBody = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
  }

  if (attachments.length === 0) {
    const topLevelParts = email.payload?.parts || [];
    for (const part of topLevelParts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push(part);
      }
    }
  }

  return { textBody, htmlBody, attachments };
}

async function getAttachmentInfo(gmail: gmail_v1.Gmail, userId: string, messageId: string, attachmentId: string) {
  try {
    const response = await gmail.users.messages.attachments.get({
      userId,
      messageId,
      id: attachmentId,
    });

    return {
      data: response.data.data, // Base64 encoded attachment data
      size: response.data.size,
    };
  } catch (error) {
    console.error(`Error getting attachment info for ${attachmentId}:`, error);
    return null;
  }
}
async function formatEmailData(gmail: gmail_v1.Gmail, email: gmail_v1.Schema$Message) {
  const headers = email.payload?.headers || [];
  const getHeader = (name: string) => headers.find(header => header.name?.toLowerCase() === name)?.value || '';
  const [senderName, senderEmail] = getHeader('from').split('<');

  const { textBody, htmlBody, attachments } = await extractContent(email);

  // const attachmentPromises = attachments.map(async (attachment) => {
  //   const attachmentInfo = await getAttachmentInfo(gmail, 'me', email.id!, attachment.body!.attachmentId!);
  //   return {
  //     filename: attachment.filename!,
  //     mimeType: attachment.mimeType || 'application/octet-stream',
  //     data: attachmentInfo?.data,
  //     size: attachmentInfo?.size,
  //   };
  // });

  // const resolvedAttachments = await Promise.all(attachmentPromises);
// 
  return {
    // id: email.id,
    // threadId: email.threadId,
    senderName: senderName?.trim() || '',
    senderEmail: senderEmail?.replace('>', '') || '',
    replyTo: getHeader('reply-to'),
    snippet: email.snippet,
    subject: getHeader('subject'),
    // htmlBody,
    textBody,
    date: new Date(parseInt(email.internalDate || '0', 10)).toISOString(),
    // read: !email.labelIds?.includes('UNREAD'),
    // labels: email.labelIds,
    // attachments: resolvedAttachments,
    attachments: attachments,

  };
}

async function fetchEmailId(auth: OAuth2Client, messageIds: string[]) {
  const gmail = google.gmail({ version: 'v1', auth });
  const userId = 'me';

  const fetchMessage = async (messageId: string) => {
    try {
      const { data } = await gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full',
        fields: 'id,threadId,labelIds,snippet,payload,internalDate',
      });

      return await formatEmailData(gmail, data);
    } catch (err) {
      console.error(`Error fetching email ${messageId}:`, err);
      return null;
    }
  };

  const messages = await Promise.all(messageIds.map(fetchMessage));
  return messages.filter(message => message !== null);
}





interface DecodedToken {
  refreshToken: string;
}



async function processQueryWithGemini(query: string, userData: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
  You are an AI assistant specialized in converting natural language queries into optimized Gmail search queries. Your task is to create a search query that will yield the most relevant results in Gmail's search function.
  
  User's original query: "${query}"
  
  User data (for context):
  ${JSON.stringify(userData, null, 2)}
  
  Instructions:
  1. Analyze the user's query and the provided user data.
  2. Identify key terms, dates, sender/recipient information, and any other relevant details.
  3. Construct a Gmail search query that:
     - Uses Gmail's advanced search operators where appropriate, including but not limited to:
       * from: (sender)
       * to: (recipient)
       * subject: (words in the subject line)
       * has:attachment
       * filename: (name or type of attachment)
       * in: (label name)
       * is:starred, is:important, is:snoozed, is:unread
       * after: and before: (date)
       * older_than: and newer_than: (time period)
       * larger: and smaller: (message size)
       * has:drive, has:document, has:spreadsheet, has:presentation
       * category: (primary, social, promotions, updates, forums)
       * list: (mailing list email)
       * -{term} (excludes term)
       * OR (for multiple possibilities)
       * () for grouping terms
     - Focuses on the most important aspects of the user's request
     - Excludes irrelevant information
     - Is concise and directly usable in Gmail's search bar
  
  4. The query should be optimized for Gmail's search syntax and capabilities.
  5. Do not include any explanations or additional text, only output the final search query.
  
  Generate the Gmail search query:
  `;

  const result = await model.generateContent(prompt);
  const processedQuery = result.response.text();

  if (!processedQuery) {
    throw new Error('No valid response from Gemini for query processing');
  }

  return processedQuery.trim();
}

async function searchGmail(auth: OAuth2Client, query: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 10, // Adjust as needed
  });
  
  const messageIds = (response.data.messages || []).map(message => message.id!);
  return await fetchEmailId(auth, messageIds) || [];
}

async function interpretResultsWithGemini(query: string, gmailResults: any, userData: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
  Hey there! You're Sam an AI assistant helping a friend make sense of their Gmail search results. Your job is to break down the results in a casual, friendly way - like you're chatting over coffee.
  Your friend's original question: "${query}"
  
  Some context about your friend:
  ${JSON.stringify(userData, null, 2)}
  
  What the Gmail search turned up:
  ${JSON.stringify(gmailResults, null, 2)}
  
  Here's what you need to do:
  1. Take a good look at what your friend was asking about.
  2. Skim through those Gmail results and pick out the juicy bits.
  3. Give your friend the lowdown in a way that:
     - Actually answers what they were asking about
     - Highlights the stuff that matters most
    - Focus on answering their question
    - Point out anything interesting or important
    - If you spot any patterns, mention them
    - If there's something they should do next, suggest it
    - Don't mention anything about searching or AI - just act like you know this stuff
    - Don't mention anything about gamil searches data just act like you know this stuff
  
  4. Keep it casual and easy to read. Bullet points are cool if you need 'em.
  5. If the search results seem off-base, just say so and maybe suggest how they could search better.
  6. Imagine you're just chatting with a buddy - keep it real and helpful.
  
  Alright, go ahead and break it down for your friend:
  `;

  const result = await model.generateContent(prompt);
  const interpretation = result.response.text();

  if (!interpretation) {
    throw new Error('No valid interpretation from Gemini');
  }

  return interpretation;
}

function handleGeneralQuery(rawQuery: string): string {
  const query = sanitizeInput(rawQuery).toLowerCase();

  if (checkForSuspiciousPatterns(query)) {
    console.warn(`Suspicious query detected: ${rawQuery}`);
    return "I'm focused on helping with emails. How can I assist you with that today?";
  }

  if (generalQueries.some(q => query.trim()==q)) {
    return generalQueryResponse;
  }

  // Handle other types of queries...
  return "";
}

export const POST = async (req: NextRequest) => {
  try {
  //   const url = new URL(req.url);
  // const token = url.searchParams.get('token');
  // const query = url.searchParams.get('query');
  // const userData = url.searchParams.get('userData');
  const { token, query,userData } = await req.json();
  console.log(userData,token,query)
  


    if (!query || !token || !userData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Verify and set credentials
    const generalResponse = handleGeneralQuery(query);
    if (generalResponse !== "") {
      return NextResponse.json({ 
        success: true, 
        interpretation: generalResponse 
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET!) as DecodedToken;
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    // Process query with Gemini
    const processedQuery = await processQueryWithGemini(query, userData);

    // Search Gmail with processed query
    const gmailResults = await searchGmail(oAuth2Client, processedQuery);

    // Interpret results with Gemini
    const interpretation = await interpretResultsWithGemini(query, gmailResults, userData);

    return NextResponse.json({ 
      success: true, 
      processedQuery, 
      gmailResults, 
      interpretation 
    });

  } catch (error) {
    console.error('Error in semantic search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};