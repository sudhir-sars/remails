import { NextRequest, NextResponse } from 'next/server';
import Receipt from '@/middleware/db/Model/reciept/Reciept';
import connectDb from '@/middleware/db/mongoose';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export const GET = connectDb(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const GUID = searchParams.get('GUID');

    if (!GUID) {
      return NextResponse.json({ success: false, error: 'GUID parameter is missing' });
    }

    // Find the receipt by GUID
    const receipt = await Receipt.findOne({ GUID });

    if (!receipt) {
      return NextResponse.json({ success: false, error: 'Receipt not found' });
    }

    // Check the status of the receipt
    if (receipt.status) {
      return NextResponse.json({ success: true, status: true });
    } else {
      return NextResponse.json({ success: true, status: false });
    }
  } catch (error) {
    console.error('Error handling tracking pixel request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process tracking pixel request' });
  }
});