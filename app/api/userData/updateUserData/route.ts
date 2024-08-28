import { NextResponse, NextRequest } from 'next/server';
import connectDb from '@/middleware/db/mongoose';
import User from '@/middleware/db/Model/user/User';

async function updateUser(userId: string, userData: any) {
  // Update only the fields present in userData
  const user = await User.findOneAndUpdate(
    { userId },
    userData,
    { new: true }
  );
  return user;
}

const handler = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return NextResponse.json({ success: false, status: 405, error: 'Method not allowed' });
  }

  try {
    const { userId, userData } = await req.json();
    console.log(userData)

    if (!userId || !userData) {
      return NextResponse.json({ success: false, status: 400, error: 'Missing userId or userData' });
    }

    // Ensure userData is correctly structured
    const updatedUser = await updateUser(userId, userData);

    if (!updatedUser) {
      return NextResponse.json({ success: false, status: 404, error: 'User not found' });
    }

    return NextResponse.json({ success: true, status: 200, data: updatedUser, message: "User data updated successfully", error: false });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json({ success: false, status: 500, error: 'Failed to update user data' });
  }
};

export const POST = connectDb(handler);
