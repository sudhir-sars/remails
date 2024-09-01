'use client';

import React, { useRef, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cn } from '@udecode/cn';
import { CommentsProvider } from '@udecode/plate-comments';
import {
  createPlateEditor,
  Plate,
  PlateEditor as PlateEditorType,
} from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { deserializeMd } from '@udecode/plate-serializer-md';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { IAddress } from './mail/components/IMail';
import { commentsUsers, myUserId } from '@/lib/plate/comments';
// import { MENTIONABLES } from '@/lib/plate/mentionables';
import { plugins } from '@/lib/plate/plate-plugins';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { Editor } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyAbVxRpz9HOKCGynbdz9SlVLvSpTfbBAug');

type EmailContent = any; // Replace with your actual EmailContent type

async function generateEmailWithGemini(mail: any): Promise<string> {
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
import { serializeHtml } from '@udecode/plate-serializer-html';
import { PlateController } from '@udecode/plate-common';
import { useEditorState } from '@udecode/plate-common';
import { useEditorMounted } from '@udecode/plate-common';
import { useEffect } from 'react';

const Toolbar = ({
  suggestableMails,
  setPlateData,
  plateData,
  isMaximized,
  triggerGemini,
  setTriggerGemini,
  mail,
  seralizeSlateDataRef,
  setSeralizedSlateData,
}: {
  setPlateData: React.Dispatch<
    React.SetStateAction<PlateEditorType | undefined>
  >;
  suggestableMails: IAddress[];
  plateData: PlateEditorType | undefined;
  isMaximized?: boolean;
  mail: any;
  triggerGemini: boolean;
  setTriggerGemini: (value: boolean) => void;
  setSeralizedSlateData: (value: string) => void;
  seralizeSlateDataRef: React.RefObject<HTMLButtonElement>;
}) => {
  const editor = useEditorState(); // Returns the active editor (or a fallback editor)
  const MENTIONABLES: TComboboxItem[] = suggestableMails.map(
    (address, index) => ({
      key: index.toString(), // Use a unique key if available
      text: address.name,
    })
  );

  const handleGenerateEmail = async () => {
    try {
      const response = await generateEmailWithGemini(mail);

      editor.reset();
      editor.children = deserializeMd(editor, response);

      console.log(editor);
    } catch (error) {
      console.error('Error generating email:', error);
    }
  };

  const containerRef = useRef(null);

  const initialValue = [
    {
      id: '1',
      type: 'p',
      children: [{ text: 'Hello, World!' }],
    },
  ];
  useEffect(() => {
    if (triggerGemini) {
      handleGenerateEmail();
      setTriggerGemini(false); // Reset the trigger
    }
  }, [triggerGemini, handleGenerateEmail, setTriggerGemini]);

  useEffect(() => {
    if (editor) {
      setPlateData(editor);
      console.log(plateData);
    }
  }, [editor.children]);

  const serializeData = () => {
    if (editor && editor.children) {
      const excludedSelectionPlugin = plugins?.filter(
        (plugin) => plugin?.key !== 'blockSelection'
      );
      // const html = serializeHtml(editor, {
      //   nodes: editor.children,
      //   dndWrapper: (props) => (
      //     <DndProvider backend={HTML5Backend} {...props} />
      //   ),
      // });
      const html = serializeHtml(
        createPlateEditor({ plugins: excludedSelectionPlugin }),
        {
          nodes: editor.children,
          dndWrapper: (props) => (
            <DndProvider backend={HTML5Backend} {...props} />
          ),
        }
      );
      setSeralizedSlateData(html);

      console.log(html);
    }
  };

  return (
    <>
      <Plate plugins={plugins} initialValue={plateData?.children}>
        <Editor
          className={` px-6 text-xs min-h-[40vh] mt-5  bg-background 
            ${isMaximized ? 'pt-14 flex-grow' : ''}
            `}
          autoFocus
          focusRing={false}
          variant="ghost"
          size="md"
        />
        {!isMaximized && (
          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
        )}
        <MentionCombobox items={MENTIONABLES} />
        <CommentsPopover />
        <CursorOverlay containerRef={containerRef} />
      </Plate>

      <button
        ref={seralizeSlateDataRef}
        onClick={serializeData}
        style={{ display: 'none' }}
      />
    </>
  );
};

import { TComboboxItem } from '@udecode/plate-combobox';

export default function PlateEditor({
  suggestableMails,
  setPlateData,
  plateData,
  mail,
  isMaximized,
  triggerGemini,
  setTriggerGemini,
  setSeralizedSlateData,
  seralizeSlateDataRef,
}: {
  setPlateData: React.Dispatch<
    React.SetStateAction<PlateEditorType | undefined>
  >;
  suggestableMails: IAddress[];
  plateData: PlateEditorType | undefined;
  isMaximized?: boolean;
  mail: any; // Changed from 'mail: any' to 'mail,'
  triggerGemini: boolean;
  setTriggerGemini: (value: boolean) => void;
  setSeralizedSlateData: (value: string) => void;
  seralizeSlateDataRef: React.RefObject<HTMLButtonElement>;
}) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CommentsProvider users={commentsUsers} myUserId={myUserId}>
        <PlateController>
          {isMaximized && (
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
          )}
          <Toolbar
            suggestableMails={suggestableMails}
            setPlateData={setPlateData}
            plateData={plateData}
            isMaximized={isMaximized}
            seralizeSlateDataRef={seralizeSlateDataRef}
            triggerGemini={triggerGemini}
            setTriggerGemini={setTriggerGemini}
            mail={mail}
            setSeralizedSlateData={setSeralizedSlateData}
          />
        </PlateController>
      </CommentsProvider>
    </DndProvider>
  );
}
