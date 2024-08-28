// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/middleware/db/mongoose';
import { HyperxUserPastInteractionData } from '@/middleware/db/Model/hyperxUserPastInteractionData/HyperxUserPastInteractionData';

const INTERACTION_THRESHOLD = 20; // Adjust as needed

export const POST = connectDb(async (req: NextRequest) => {
  try {
    const { userId, newInteraction } = await req.json();
    

    let hyperxUserPastInteractionData = await HyperxUserPastInteractionData.findOne({ userId });

    if (!hyperxUserPastInteractionData) {
      // Create a new document if none exists
      hyperxUserPastInteractionData = new HyperxUserPastInteractionData({
        userId,
        PastInteractionData: [newInteraction]
      });
    } else {
      // Push the new interaction data
      hyperxUserPastInteractionData.PastInteractionData.push(newInteraction);
    }

    const PastInteractionData = hyperxUserPastInteractionData.PastInteractionData;

    if (PastInteractionData.length > INTERACTION_THRESHOLD) {
      const firstSevenInteractions = PastInteractionData.slice(0, 7);
      const summariesToSummarize = firstSevenInteractions
        .map(interaction => interaction.gmailDataSummary)
        .filter(summary => summary !== undefined); // Filter out undefined summaries

      if (summariesToSummarize.length > 0) {
        // Find the latest interaction time from the first 7 interactions
        const latestInteractionTime = firstSevenInteractions
          .map(interaction => interaction.interactionTime)
          .reduce((latest, current) => (new Date(current) > new Date(latest) ? current : latest), firstSevenInteractions[0].interactionTime);
        
        const summarizerResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/hyperx/grok/summerization`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pastInteractions: summariesToSummarize })
        });

        if (!summarizerResponse.ok) {
          throw new Error('Failed to summarize interactions');
        }

        const summary = await summarizerResponse.json();

        // Replace interaction data with the new summary
        hyperxUserPastInteractionData.PastInteractionData = [{ 
          interactionTime: latestInteractionTime,
          originalQuery: 'Summary of all past interactions',
          gmailDataSummary: summary.summary,
         
          classification:'generic',
         

        }];
      }
    }

    await hyperxUserPastInteractionData.save();
    return NextResponse.json({ success: true, data:"", message: 'Data updated successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error storing interaction:', error);
    return NextResponse.json({ success: false, error: 'Failed to process interaction data' }, { status: 500 });
  }
});
