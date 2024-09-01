import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { query, PastInteractionData, metaData } = await req.json();

    // Improved classification prompt with instructions on treating "mails" and "emails" as synonymous
    const classificationResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
          You are an AI assistant specializing in understanding and managing email-related queries. Your task is to classify the user's query into one of the following categories:

          Classification Guidelines:
          - Treat the terms "mails" and "emails" as synonymous. If the query mentions "mails", interpret it as referring to "emails".
          - Classify as "emailQuery" if the query involves tasks related to specific emails or mails (e.g., searching, organizing, summarizing).
          - Classify as "emailQuery" if the query involves specific email or mail-related keywords like "inbox", "unread", "new mails", "mails for today", or any other term typically related to email management.
          - Classify as "emailQuery" if the query is a follow-up to a previous email-related conversation or includes email-specific details.
          - Classify as "generic" if the query is not related to emails and involves general assistance or conversations unrelated to emails.
          - If the classification is uncertain, lean towards "emailQuery" if any email-related context exists.

          Examples:
          - "Can you find unread emails from John?" -> emailQuery
          - "What's the weather today?" -> generic
          - "Any emails from LPU?" -> emailQuery
          - "Can you summarize the last email I received?" -> emailQuery
          - "Any mails for today?" -> emailQuery
          - "Any new mails?" -> emailQuery
          `
        },
        {
          role: 'user',
          content: `User Query: ${query}
           Past Interactions: ${JSON.stringify(PastInteractionData)}
           Meta Data: ${JSON.stringify(metaData)}`
        }
      ],
      model: 'llama3-8b-8192',
    });

    // Extract and analyze the classification response
    const responseText = classificationResponse.choices[0]?.message?.content?.trim().toLowerCase() || '';

    const classification =  responseText.toLowerCase().includes('emailquery')
      ? 'emailQuery'
      : 'generic';

    return NextResponse.json({ success: true, data: classification }, { status: 200 });

  } catch (error) {
    console.error('Error classifying the query:', error);
    return NextResponse.json({ success: false, error: 'Failed to classify query' }, { status: 500 });
  }
};
