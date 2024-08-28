import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/middleware/db/mongoose';
import { HyperxInteraction } from '@/middleware/db/Model/hyperxInteraction/HyperxInteraction';

export const POST = connectDb(async (req: NextRequest) => {
  try {
    const { interactionId, userId, queryType, originalQuery, formattedQuery, genericQueryResponse, gmailData, gmailDataSummary, performance } = await req.json();

    const newInteraction = new HyperxInteraction({
      interactionId,
      userId,
      queryType,
      originalQuery,
      formattedQuery,
      genericQueryResponse,
      gmailData,
      gmailDataSummary,
      performance,
    });

    await newInteraction.save();

    return NextResponse.json({ success: true, message: 'Interaction stored successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to store interaction' }, { status: 500 });
  }
});
