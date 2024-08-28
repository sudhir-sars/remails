import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { query, PastInteractionData, metaData } = await req.json();

    const genericResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
          You are an AI assistant helping with email-related queries. Your goal is to provide a clear, helpful, and natural response to the user's request or question.
        
          Guidelines:
          - Focus on the user's needs and provide a response that feels like part of a natural conversation.
          - Avoid mentioning any technical details, systems, or processes behind the scenes.
          - Keep the response concise, friendly, and relevant to what the user is asking.
        
          Important: Ensure the response is focused on the user's query and maintain a conversational tone.
          `
        }
        ,
        {
          role: 'user',
          content: `User Query: ${query}
            Past Interactions: ${JSON.stringify(PastInteractionData)}
            Meta Data: ${JSON.stringify(metaData)}`
        }
      ],
      model: 'llama3-8b-8192',
    });

    const responseData = genericResponse.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ success: true, data: responseData }, { status: 200 });

  } catch (error) {
    console.error('Error processing the query:', error);
    return NextResponse.json({ success: false, error: 'Failed to process query' }, { status: 500 });
  }
};
