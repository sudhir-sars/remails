// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/middleware/db/mongoose';
import { HyperxInteraction } from '@/middleware/db/Model/hyperxInteraction/HyperxInteraction';
import { HyperxUserPastInteractionData } from '@/middleware/db/Model/hyperxUserPastInteractionData/HyperxUserPastInteractionData';

const INTERACTION_THRESHOLD = 10; // Adjust as needed

export const POST = connectDb(async (req: NextRequest) => {
  try {
    const { userId } = await req.json();

    // Ensure that HyperxUserPastInteractionData is correctly imported and used
    let hyperxUserPastInteractionData = await HyperxUserPastInteractionData.findOne({ userId });

    if (!hyperxUserPastInteractionData) {
      // Create a new document if one does not exist
      hyperxUserPastInteractionData = new HyperxUserPastInteractionData({ userId, interactionData: [] });
      await hyperxUserPastInteractionData.save();
    }

    // Access the property correctly
    let PastInteractionData = hyperxUserPastInteractionData.PastInteractionData;
    // @ts-ignore
    PastInteractionData = PastInteractionData.map(interaction => {
      const { gmailDataSummary, ...filteredInteraction } = interaction.toObject();
      return filteredInteraction;
    })

    return NextResponse.json({ success: true, data: PastInteractionData , message: 'Interaction data fetched successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch interaction data' }, { status: 500 });
  }
});
