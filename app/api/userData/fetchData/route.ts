import { NextResponse, NextRequest } from 'next/server';
import connectDb from '@/middleware/db/mongoose';
import User from '@/middleware/db/Model/user/User';

async function fetchUser(userId: string) {
  const user = await User.findOne({ userId });
  return user;
}

const handler = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, status: 405, error: 'Method not allowed' });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, status: 400, error: 'Missing userId' });
    }

    const user = await fetchUser(userId);

    if (!user) {
      return NextResponse.json({ success: false, status: 404, error: 'User not found' });
    }

    return NextResponse.json({ success: true, status: 200, data: user, message: "User data fetched successfully", error: false });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to fetch user data' });
  }
};

export const POST = connectDb(handler);
