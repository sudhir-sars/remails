import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import connectDb from '@/middleware/db/mongoose';
import User from '@/middleware/db/Model/user/User';
import { isDuplicate } from '@/utils/cache';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function setupWatch(auth:any) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/remails-425420/topics/MyTopic',
        labelFilterAction: 'include',
        labelIds: ['INBOX'],
      },
    });
    console.log('Watch setup successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error setting up watch:', error);
    throw error;
  }
}

async function updateUserHistoryId(userId:string, historyId:string) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { $set: { historyId: historyId } },
      { new: true }
    );
    if (!updatedUser) {
      console.error(`User with ID ${userId} not found`);
      return false;
    }
    console.log(`Updated history ID for user ${userId}: ${historyId}`);
    return true;
  } catch (error) {
    console.error('Error updating user history ID:', error);
    return false;
  }
}

const handler = async (req: NextRequest) => {
  console.log("Setting up watch dog for logged in user")
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const token = url.searchParams.get('token');

  if (!userId || !token) {
    return NextResponse.json({ success: false, status: 400, statusText: 'Missing userId or token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { refreshToken: string };
    oAuth2Client.setCredentials({ refresh_token: decoded.refreshToken });

    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    const watchInfo = await setupWatch(oAuth2Client);

    if (watchInfo && watchInfo.historyId) {
      const updateSuccess = await updateUserHistoryId(userId, watchInfo.historyId);
      if (updateSuccess) {
        return NextResponse.json({ success: true, status: 200, message: 'Watch setup and user history ID updated successfully' });
      } else {
        return NextResponse.json({ success: false, status: 500, error: 'Failed to update user history ID' });
      }
    } else {
      return NextResponse.json({ success: false, status: 500, error: 'Failed to get history ID from watch setup' });
    }
  } catch (error) {
    console.error('Error in watchdog setup:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to set up watchdog' });
  }
};

export const GET = connectDb(handler);