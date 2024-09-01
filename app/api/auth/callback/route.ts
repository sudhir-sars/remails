import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import connectDb from '@/middleware/db/mongoose';
import User from '@/middleware/db/Model/user/User';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_HOST!;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function setupWatch(auth: OAuth2Client) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const { data } = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/remails-425420/topics/MyTopic',
        labelFilterAction: 'include',
        labelIds: ['INBOX'],
      },
    });
    console.log('Watch setup successful:', data);
    return data;
  } catch (error) {
    console.error('Error setting up watch:', error);
    throw error;
  }
}

const initiateDrive = async (refreshToken: string) => {
  try {
    const token = jwt.sign({ refreshToken }, JWT_SECRET, { expiresIn: '1y' });
    const response = await fetch(`${BASE_URL}/api/drive/initiateDrive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ folderName: 'remailsMetaData' }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Drive initiation failed: ${errorText}`);
      throw new Error('Drive initiation failed');
    }

    const { folderId } = await response.json();
    return folderId;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

async function saveUser(userInfo: any, tokens: any, historyId: string) {
  const { id, email, name, given_name, family_name, picture } = userInfo;
  const userData = {
    userId: id,
    email,
    name,
    givenName: given_name,
    familyName: family_name,
    picture,
    historyId,
    userAddressLastFetchTime:Date.now(),
    refreshToken: tokens.refresh_token,
    isOnBoardingNotDone: false,
  };

  const existingUser = await User.findOne({ userId: id })
  
  if (existingUser) {
    if (existingUser.isOnBoardingNotDone) {
      await User.findOneAndUpdate({ userId: id }, userData, { upsert: true, new: true }).exec();
      return '/onBoarding';
    }
    return '/';
  } else {
    await User.create(userData);
    return '/onBoarding';
  }
}

async function initiateScheduler(refreshToken: string, userId: string) {
  try {
    const token = jwt.sign({ refreshToken }, JWT_SECRET, { expiresIn: '1y' });

    const schedulerResponse= await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/APIRequestScheduler/userDataScheduler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId }),
      })
      
   

    if (!schedulerResponse.ok) {
      console.error(`Scheduler initiation failed: ${schedulerResponse.status}`);
      throw new Error('Scheduler initiation failed');
    }



    console.log('Batch scheduling request sent successfully');
  } catch (error) {
    console.error('Error scheduling batch fetch:', error);
    throw error;
  }
}

const handler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const tokenGenCode = url.searchParams.get('code');
  const state = url.searchParams.get('state');


  let sessionId: string | undefined;
  try {
    ({ sessionId } = JSON.parse(state || '{}'));
  } catch (error) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid state parameter' });
  }

  if (!tokenGenCode || !sessionId) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Invalid request' });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(tokenGenCode);
    oAuth2Client.setCredentials(tokens);

    if (!tokens.refresh_token) {
      console.error('Refresh token not returned. User may need to reauthenticate.');
    }

    const oauth2 = google.oauth2({ version: 'v2', auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();

    const [metaFolderId, watchInfo] = await Promise.all([
      initiateDrive(tokens.refresh_token!),
      setupWatch(oAuth2Client),
      initiateScheduler(tokens.refresh_token!, userInfo.data.id!),
    ]);
    console.log(metaFolderId)

    const redirectPath = await saveUser(userInfo.data, tokens, watchInfo.historyId!);

    const payload = {
      refreshToken: tokens.refresh_token,
      userId: userInfo.data.id,
      historyId: watchInfo.historyId!,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const redirectUrl = `${BASE_URL}${redirectPath}?JWT_token=${token}&metaFolderId=${metaFolderId}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to process request' });
  }
};

export const GET = connectDb(handler);
