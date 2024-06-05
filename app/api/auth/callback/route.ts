// pages/api/auth/callback.js
import { NextResponse, NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import cookie from 'cookie';
import CryptoJS from 'crypto-js';

// Replace with your credentials
const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const encryptToken = async(tokens:any, secretKey:string) => {
  return CryptoJS.AES.encrypt(tokens, secretKey).toString();
};

const decryptToken = async(encryptedToken:any, secretKey:string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};


export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing code parameter' }, { status: 400 });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    const encrypted_token=await encryptToken(tokens,"Shyama@21");
    localStorage.setItem("googleAuthTokens", encrypted_token);

    return NextResponse.redirect('http://localhost:3000/mail');
    
  } 
  catch (error) {
    console.error('Error retrieving access token', error);
    // Redirect to the root URL and indicate failure with an error message
    return NextResponse.redirect(`/?success=false&error=${encodeURIComponent('Failed to retrieve access token')}`);
  }
};

export default GET;
