import { NextResponse, NextRequest } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const { query, PastInteractionData, metaData } = await req.json();

    // Generate Gmail query
    const gmailQueryResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            You are an AI that converts natural language queries into valid Gmail search queries. Follow these guidelines:
           
            - Follow these rules strictly:
              - **Output only the query string**: No extra text, explanations, or formatting.
              - **Format**: Use only the format "QUERY_START [query] QUERY_END".
              - **Example**: For a search of "emails from LinkedIn", output should be: QUERY_START from:linkedin QUERY_END

            - Make sure:
              - The query is valid and conforms to Gmail search syntax.
              - There are no additional explanations, descriptions, or extraneous characters.
            **General Principles**:
            - Gmail searches the entire email content by default when no specific field is specified.
            - Use quotation marks for exact phrases.
            - Combine queries using AND, OR, or - (negation).

            **Date Queries**:
            - Use \`newer_than:\`, \`older_than:\` with time units \`d\` (days), \`m\` (months), \`y\` (years).
            - Example: \`newer_than:1d\` for emails from the last day.

            **Sender Queries**:
            - Use \`from:\` with email or domain.
            - Example: \`from:user@example.com\` or \`from:@example.com\`.

            **Recipient Queries**:
            - Use \`to:\` for specific recipients.
            - Example: \`to:recipient@example.com\`.

            **Subject Queries**:
            - Use \`subject:\` only when specifically searching in the subject line.
            - Example: \`subject:"meeting agenda"\`.

            **Content Queries**:
            - For searching in both subject and body, use quotation marks without a prefix.
            - Example: \`"important project"\` searches for this phrase in the entire email.

            **Attachment Queries**:
            - Use \`has:attachment\` and specify file type if needed.
            - Example: \`has:attachment filename:pdf\`.

            **Other Filters**:
            - Use \`has:\` for various attributes: \`has:link\`, \`has:image\`, \`has:document\`.
            - Use \`is:\` for email status: \`is:unread\`, \`is:starred\`, \`is:important\`.

            **Label Queries**:
            - Use \`label:\` to filter by label.
            - Example: \`label:important\`.

            **Size Queries**:
            - Use \`size:\` with suffixes \`MB\` or \`KB\`.
            - Example: \`size:larger_than:5M\`.

            **Combining Queries**:
            - Use AND (or space), OR, - (negation) to combine or exclude terms.
            - Example: \`from:boss@example.com AND "project update"\`.

            **Important Notes**:
            1. Always consider the user's intent to search in both subject and body unless explicitly stated otherwise.
            2. Prioritize accuracy and comprehensiveness in query formulation.
            3. Use parentheses to group complex queries for clarity.
            4. Correct obvious spelling mistakes in the user's query.
            5. If the user's intent is ambiguous, opt for a broader search to ensure relevant results are included.
            
            - Follow these rules strictly:
              - **Output only the query string**: No extra text, explanations, or formatting.
              - **Format**: Use only the format "QUERY_START [query] QUERY_END".
              - **Example**: For a query of "emails from LinkedIn", output should be: QUERY_START from:linkedin QUERY_END
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

    // Retrieve and clean the response text
    const responseText = gmailQueryResponse.choices[0]?.message?.content?.trim() || '';
    console.log('Raw response:', responseText);

    // Extract the query string using regex
    const match = responseText.match(/QUERY_START\s*(.*?)\s*QUERY_END/);
    const queryString = match ? match[1].trim() : '';

    return NextResponse.json({ success: true, data: queryString }, { status: 200 });

  } catch (error) {
    console.error('Error processing the query:', error);
    return NextResponse.json({ success: false, error: 'Failed to process query' }, { status: 500 });
  }
};
