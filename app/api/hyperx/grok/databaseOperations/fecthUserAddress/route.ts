import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/middleware/db/mongoose';


import UserMailBoxAddress from '@/middleware/db/Model/userMailBoxAddress/UserMailBoxAddress';

export const POST = connectDb(async (req: NextRequest) => {
  try {
    const { userId } = await req.json();

    let userMailBoxAddress = await UserMailBoxAddress.findOne({ userId });
   
    if (!userMailBoxAddress) {

      return NextResponse.json({ success: true, data:"", message: 'no user data found' }, { status: 200 });
    }


    return NextResponse.json({ success: true, data:userMailBoxAddress, message: 'User  data fetched successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch interaction data interaction' }, { status: 500 });
  }
});
