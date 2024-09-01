import { createPluginFactory } from '@udecode/plate-common';
import { Editor, Transforms, Text, BaseText } from 'slate';
import { PlateEditor } from '@udecode/plate-core';
import React from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RenderLeafProps } from 'slate-react';

// Utility function to fetch suggestions from the Gemini API
async function generateEmailWithGemini(mail: any): Promise<string> {
  const genAI = new GoogleGenerativeAI(
    'AIzaSyAbVxRpz9HOKCGynbdz9SlVLvSpTfbBAug'
  ); // Add your actual API key here
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const originalSubject = mail.subject;
    const replySubject = originalSubject.toLowerCase().startsWith('re:')
      ? originalSubject
      : `Re: ${originalSubject}`;

    const prompt = `
      You are an AI assistant tasked with writing a professional and courteous email reply. Please generate a response to the following email:

      Original Subject: ${originalSubject}
      Suggested Reply Subject: ${replySubject}

      Original Email:
      ${mail.textBody || mail.snippet}

      Please write a reply that:
      1. Addresses the sender by name (${mail.name})
      2. Includes an appropriate subject line (you may modify the suggested subject if necessary)
      3. Acknowledges the main points of the original email
      4. Provides a thoughtful and relevant response
      5. Maintains a professional and friendly tone
      6. Ends with an appropriate closing

      Your response should be in the format of a complete email, ready to be sent. Include the subject line at the beginning of your response.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

async function fetchSuggestionFromGemini(content: string): Promise<string> {
  const mail = {
    subject: 'Example Subject', // Replace with actual subject
    textBody: content,
    name: 'John Doe', // Replace with actual name
    snippet: content,
  };
  const response = await generateEmailWithGemini(mail);
  return response;
}

// ... (keep the existing generateEmailWithGemini and fetchSuggestionFromGemini functions)

interface SuggestionText extends BaseText {
  suggestion?: string;
  color?: string;
}

const createAutoCompleterPlugin = createPluginFactory({
  key: 'autoCompleterPlugin',
  handlers: {
    // @ts-ignore
    onKeyDown: (editor: PlateEditor) => {
      return async (e: React.KeyboardEvent<Element>) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const { selection } = editor;
          if (!selection) return;
// @ts-ignore
          const htmlContent = Editor.string(editor, []);
          const suggestion = await fetchSuggestionFromGemini(htmlContent);

          if (suggestion) {
            // Get the position at the end of the existing content
            // @ts-ignore
            const end = Editor.end(editor, []);

            // Insert the entire suggestion with styling at the end
            const suggestionNode: SuggestionText = {
              text: suggestion,
              suggestion,
              color: '#999', // Grey color for suggestion
            };
            // @ts-ignore
            Transforms.insertNodes(editor, suggestionNode, { at: end });

            // Move cursor back to where it was
            // @ts-ignore
            Transforms.select(editor, selection);
          }
        }
      } 
    },
    // onChange: async (editor: PlateEditor) => {
    //   console.log('here');
    //   const htmlContent = Editor.string(editor, []);
    //   const suggestion = await fetchSuggestionFromGemini(htmlContent);
    //   if (suggestion) {
    //     // Get the position at the end of the existing content
    //     const end = Editor.end(editor, []);
    //     // Remove any existing suggestion nodes
    //     Editor.withoutNormalizing(editor, () => {
    //       for (const [node, path] of Editor.nodes(editor, {
    //         match: (n) => Text.isText(n) && 'suggestion' in n,
    //       })) {
    //         Transforms.removeNodes(editor, { at: path });
    //       }
    //     });
    //     // Insert the entire suggestion with styling at the end
    //     const suggestionNode: SuggestionText = {
    //       text: suggestion,
    //       suggestion,
    //       color: '#999', // Grey color for suggestion
    //     };
    //     Transforms.insertNodes(editor, suggestionNode, { at: end });
    //     // Ensure the cursor stays at its current position
    //     const currentSelection = editor.selection;
    //     if (currentSelection) {
    //       Transforms.select(editor, currentSelection);
    //     }
    //   }
    // },
  },
});

export { createAutoCompleterPlugin };
