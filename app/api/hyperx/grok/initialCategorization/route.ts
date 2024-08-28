import { NextResponse, NextRequest } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fetch past interactions
async function fetchPastInteractions(userId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/hyperx/grok/databaseOperations/interactionData/pastInteractionData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch past interactions');
  }

  const { data } = await response.json();
  return data;
}

// Handle and categorize query
async function handleAndCategorizeQuery(query: string, pastInteractions: any, metaData: any) {
  const messages: { role: string; content: string }[] = [
    {
      role: 'system',
      content: `
       You are an AI assistant tasked with responding to user queries in a natural and engaging way.

        - **For an "emailQuery"**:
          - Formulate a Gmail search query using Gmail search syntax.
          - Use the metadata to add contextual relevance to the query.
          - Enclose the Gmail query between "QUERY_START" and "QUERY_END" to indicate it's a Gmail query.

        - **For a "generic" query**:
          - Craft a response that is friendly and conversational.
          - Ensure the response flows naturally within the context of the ongoing conversation.
          - Avoid referencing past interactions or metadata directly.

        **Current Conversation Context:**
        - **User Query**: ${query}
        - **Past Interactions**: ${JSON.stringify(pastInteractions)}
        
        Generate a response based on the type of query.
      
      `
    },  
    {
      role: 'user',
      content: `Query: ${query}`
      // content: `Query: ${query}\nPast Interactions: ${JSON.stringify(pastInteractions)}\nMeta Data: ${JSON.stringify(metaData)}`
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Ensure the model name is correct
      messages: messages as any,  // Cast to 'any' if needed to bypass type issues
      max_tokens: 2000  // Limit output length
    });

    const responseText = response.choices[0].message?.content?.trim();
    // console.log(responseText)

    // Determine if it's an email query based on the presence of QUERY_START and QUERY_END
    const isEmailQuery = responseText?.toLowerCase().includes('query_start');

    if (isEmailQuery) {
      const match = responseText?.match(/QUERY_START\s*(.*?)\s*QUERY_END/);
      const queryString = match ? match[1].trim() : '';
      return { type: 'emailQuery', data: queryString };
    } else {
      return { type: 'generic', data: responseText };
    }
  } catch (error) {
    console.error('Error handling and categorizing query:', error);
    throw error;
  }
}

// Search Gmail API with the formulated query
interface FullEmail {
  id: string;
  threadId: string;
  htmlBody: string;
  [key: string]: any; // Allow for other properties
}

interface ApiResponse {
  fullEmailBody: {
    emails: FullEmail[];
    nextPageToken: string | null;
    currentFetchTime: number;
  };
}

async function searchGmailAPI(query: string, token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/hyperx/grok/search?token=${token}&query=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Failed to search Gmail API');
  }

  const { fullEmailBody }: ApiResponse = await response.json();
  const data = fullEmailBody.emails.map((email: FullEmail) => {
    const {
      id,
      threadId,
      htmlBody,
      ...rest
    } = email;
  
    return rest;
  });
  return { data,  allEmails:fullEmailBody };
}

// Interpret Gmail search results using GPT
async function interpretSearchResults(query: string, pastInteractions: any, searchResult: any, metaData: any) {
  const messages: { role: string; content: string }[] = [
    {
      role: 'system',
      content: `
        You are an AI tasked with interpreting Gmail search results. 
        - Provide a direct, concise, and user-friendly response based on the original query and search results.
        - Avoid mentioning technical details, APIs, or processes.
        - Use the metadata and past interactions to add relevant context and make the response more personalized.
        Gmail Search Results: ${JSON.stringify(searchResult)}
        Past Interactions: ${JSON.stringify(pastInteractions)}
        `
        // Meta Data: ${JSON.stringify(metaData)}
    },
    {
      role: 'user',
      content: `
        Original Query: ${query}
        
       
      `
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  
      messages: messages as any,  // Cast to 'any' if needed to bypass type issues
      max_tokens: 2000  // Limit output length
    });

    return response.choices[0].message?.content?.trim();
  } catch (error) {
    console.error('Error interpreting search results:', error);
    throw error;
  }
}

// Update interaction data
async function updateInteractionData(userId: string, originalQuery: string, classification: string, genericQueryResponse?: string, gmailDataSummary?: string, gmailQueryFinalResponse?: string,formattedGmailApiQuery?:string) {
  const newInteraction = {
    interactionTime: new Date().toISOString(),
    originalQuery,
    classification,
    genericQueryResponse,
    gmailDataSummary,
    gmailQueryResponse:  gmailQueryFinalResponse,
    formattedGmailApiQuery,
  };
  // console.log(newInteraction)

  const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/hyperx/grok/databaseOperations/interactionData/updateData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newInteraction })
  });

  if (!response.ok) {
    throw new Error('Failed to update interaction data');
  }
}

// Handle POST requests
export const POST = async (req: NextRequest) => {
  try {
    const { query, metaData, userId, token } = await req.json();

    const pastInteractions = await fetchPastInteractions(userId);

    // Handle and categorize the query
    const result = await handleAndCategorizeQuery(query, pastInteractions, metaData);

    let finalResponse;
    let gmailDataSummary;
    let gmailQueryFinalResponse;
    let fullEmailBody;

    if (result.type === 'emailQuery') {
      // Search Gmail API with the formulated query
      const { data:searchResult, allEmails} = await searchGmailAPI(result.data!, token);
     
      fullEmailBody=allEmails
      
      
      

      // Interpret the search results
      gmailQueryFinalResponse = await interpretSearchResults(query, pastInteractions, searchResult, metaData);

      // Store results in the response
      gmailDataSummary = JSON.stringify(searchResult);
      finalResponse = gmailQueryFinalResponse;

      // Update interaction data for email queries
      await updateInteractionData(userId, query, result.type, undefined, gmailDataSummary, gmailQueryFinalResponse,result.data!);
    } else {
      finalResponse = result.data;
      // Update interaction data for generic queries
      await updateInteractionData(userId, query, result.type, finalResponse, undefined, undefined);
    }
  
  

    return NextResponse.json({ success: true, data: {finalResponse,fullEmailBody,result},  message: 'Resolved successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ success: false, error: 'Failed to process query' }, { status: 500 });
  }
};
