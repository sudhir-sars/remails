import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { pastInteractions } = await req.json();

    const groqResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
          You are an AI assistant tasked with summarizing past email interactions. Your summary should:
          - Retain essential context and key points
          - Highlight important details and patterns
          - Reduce overall size while maintaining coherence
          - Focus on information likely to be relevant for future interactions

          Provide the summary in a concise, structured format that's easy for both humans and AI to understand.
          `
        },
        {
          role: "user",
          content: `Past Interactions: ${JSON.stringify(pastInteractions)}`
        }
      ],
      model: "llama3-8b-8192",
    });

    const responseContent = groqResponse.choices[0]?.message?.content;
    return NextResponse.json({ success: true, summary: responseContent }, { status: 200 });
  } catch (error) {
    console.error('Error summarizing interactions:', error);
    return NextResponse.json({ success: false, error: 'Failed to summarize interactions' }, { status: 500 });
  }
};