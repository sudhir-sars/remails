// app/api/semantic-search/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize GoogleGenerativeAI with the API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);

// Function to interpret results with Gemini
async function interpretResultsWithGemini(originalQuery: string, gmailApiData: any, metadata: any,pastInteractions:string) {
  console.log(originalQuery,pastInteractions)

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
            
          You are an Synaptics. Your goal is to interpret the user's original query using the provided email data,user past interaction history and metadata. Provide a direct and friendly response that addresses the user's needs.
        
          Guidelines:
       
          - Focus strictly on addressing the user's request.
          - Focus on the user's original question or request
          - Do not mention yourself, the AI's name, or include any sign-offs like "Best regards" or similar.
          - Avoid mentioning any technical details, such as Gmail services, APIs, or the search process or processes..
          - Ensure the response is .
       
          
          - Make the response concise,, helpful and conversational, as if talking directly to the user.
        
          Important: Ensure the response is natural and user-friendly. Do not include any system-related explanations or any information.
          

            User's original query: "${originalQuery}"

            Context about the user:
            ${JSON.stringify(metadata)}
            User Past interaction History :
            ${JSON.stringify(pastInteractions)}

            email data:
            ${JSON.stringify(gmailApiData)}
            `;

  try {
    const result = await model.generateContent(prompt);
    const interpretation = result.response.text();

    if (!interpretation) {
      throw new Error('No valid interpretation from Gemini');
    }

    return interpretation;
  } catch (error) {
    console.error('Error interpreting results with Gemini:', error);
    throw new Error('Failed to interpret results with Gemini');
  }
}

// API route handler
export const POST = async (req: NextRequest) => {
  try {
    const { originalQuery, gmailApiData, metadata,pastInteractions } = await req.json();

    // Interpret results with Gemini
    const interpretation = await interpretResultsWithGemini(originalQuery, gmailApiData, metadata,pastInteractions);

    return NextResponse.json({ success: true, data: interpretation, message: "Summarization success" }, { status: 200 });

  } catch (error) {
    console.error('Error in semantic search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};
