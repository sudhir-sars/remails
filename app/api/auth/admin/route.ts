

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Get credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const JWE_SECRET = process.env.JWE_SECRET!;

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // Check if the username and password match
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const secret = new TextEncoder().encode(JWE_SECRET);
    const token = await new SignJWT({ username,password })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);

    // Respond with success message and token
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token
    });
  } else {
    // Respond with error message
    return NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 });
  }
}
