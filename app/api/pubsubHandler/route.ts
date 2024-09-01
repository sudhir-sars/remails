import { NextResponse, NextRequest } from 'next/server';
import connectDb from '@/middleware/db/mongoose'; // Import the middleware
import User from '@/middleware/db/Model/user/User';
import { isDuplicate } from '@/utils/cache';

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Decode the base64-encoded data
    const decodedData = JSON.parse(Buffer.from(body.message.data, 'base64').toString());
    const { emailAddress } = decodedData;

    if (isDuplicate(emailAddress)) {
      console.log('Duplicate notification received within 1000ms, skipping processing');
      return NextResponse.json({ message: 'Duplicate notification skipped' }, { status: 200 });
    }

    const user = await User.findOne({ email: emailAddress });
    
    if (!user) {
      console.error('User not found for email:', emailAddress);
      return NextResponse.json({ error: 'User not found' }, { status: 200 });
    }

    const { userId } = user;

    const postData = {
      userId,
      newHistoryId: decodedData.historyId,
      decodedData
    };

    // Send data to the WebSocket server's HTTP endpoint
    const response = await fetch(`${process.env.WEBSOCKET_SERVER_URL}/pubsubHandler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postData,
        userId
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send data: ${response.statusText}`);
    }

    console.log('Data sent to WebSocket server');
    return NextResponse.json({}, { status: 200 });

  } catch (error) {
    console.error('Error processing Pub/Sub message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Wrap the handler with connectDb middleware
export const POST = connectDb(postHandler);
