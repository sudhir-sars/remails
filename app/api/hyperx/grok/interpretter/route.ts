import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { originalQuery, geminiResponseData,pastInteractions, metadata } = await req.json();
    

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
          You are an Synaptics. Your goal is to interpret the user's query using the provided summary and metadata. Provide a direct and friendly response that addresses the user's needs.
        
          Guidelines:
       
          - Focus strictly on addressing the user's request.
          - Focus on the user's original question or request
          - Do not mention yourself, the AI's name, or include any sign-offs like "Best regards" or similar.
          - Avoid mentioning any technical details, such as Gmail services, APIs, or the search process or processes..
          - Ensure the response is .
       
          
          - Make the response concise,, helpful and conversational, as if talking directly to the user.
        
          Important: Ensure the response is natural and user-friendly. Do not include any system-related explanations or any information.
          `
        },
        {
          role: "user",
          content: `
          Original Query: ${originalQuery}
          Summarized Information: ${geminiResponseData}
          Past Interaction Data: ${pastInteractions}
          Metadata: ${JSON.stringify(metadata)}
          `
        }
      ],
      model: "llama3-8b-8192",
    });

    const interpretedResponse = groqResponse.choices[0]?.message?.content?.trim();


    return NextResponse.json({ success: true, data: interpretedResponse }, { status: 200 });
  } catch (error) {
    console.error('Error interpreting query', error);
    return NextResponse.json({ success: false, error: 'Failed to interpret query' }, { status: 500 });
  }
};
