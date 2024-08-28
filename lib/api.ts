const GEMINI_API_URL = 'https://api.gemini.com/v1/chat/completions';
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export async function queryGemini(message: string, context: any): Promise<string> {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gemini-pro',
        messages: [
          { role: 'system', content: 'You are an email assistant. Respond casually.' },
          { role: 'user', content: JSON.stringify(context) },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Gemini:', error);
    throw error;
  }
}

export async function fetchGmailData(query: string): Promise<any> {
  try {
    const response = await fetch(`${GMAIL_API_URL}/${query}`, {
      headers: {
        'Authorization': `Bearer ${await getGmailAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching Gmail data:', error);
    throw error;
  }
}

export async function sendEmail(emailContent: string): Promise<void> {
  try {
    const response = await fetch(`${GMAIL_API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getGmailAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: btoa(emailContent)
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function getUserData(): Promise<any> {
  try {
    const response = await fetch(`${GMAIL_API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${await getGmailAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      emailAddress: data.emailAddress,
      // Add more user data as needed
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

async function getGmailAccessToken(): Promise<string> {
  // Implement your OAuth 2.0 flow here to get a valid access token
  // This is a placeholder implementation
  return 'your_access_token_here';
}