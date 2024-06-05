import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

// Replace with your credentials
const CLIENT_ID = '453820533420-8bc3787ivpb4fm527991kgsqoepp6ko6.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = `http://localhost:3000/api/auth/callback`;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
];


export const GET = async (req: NextRequest) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return NextResponse.redirect(authUrl);
};


