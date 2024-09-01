import { NextRequest, NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  GenerationConfig,
  ChatSession,
} from '@google/generative-ai';

// Ensure the API key is defined
const apiKey: string | undefined = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('API key is not defined in the environment variables');
}

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

// Define the model with the system instructions
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

// Define the generation configuration
const generationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 100,
  responseMimeType: 'application/json',
};

export const POST = async (req: NextRequest) => {
  try {
    const unSummarizedEmails = await req.json();

    // Check if unSummarizedEmails is valid
    if (!unSummarizedEmails) {
      return NextResponse.json(
        { error: 'No email data provided' },
        { status: 400 }
      );
    }

    // Start a new chat session with the model
    const chatSession: ChatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send a message to the model with the unsummarized emails
    const result = await chatSession.sendMessage(
      JSON.stringify(unSummarizedEmails)
    );

    // Parse the response from the model
    const response = result.response.text();
    const summarizedEmails = JSON.parse(response); // Ensure response is parsed properly

    // Return the summarized emails in JSON format
    // Return the summarized emails in JSON format
    return NextResponse.json({ data: summarizedEmails });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
