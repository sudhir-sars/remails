// File: /components/TextEditor.tsx
import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IoDocumentAttach } from 'react-icons/io5';
import { FiAlignCenter } from 'react-icons/fi';
import { PiTextAlignLeftBold, PiTextAlignRightBold } from 'react-icons/pi';
import { FaBold, FaItalic, FaUnderline, FaLink } from 'react-icons/fa';
import { GoListOrdered, GoListUnordered } from 'react-icons/go';
import { MdImage } from 'react-icons/md';

const TextEditor = ({
  setEditorHtml,
  editorRef,
  handleToolBarButtonClick,
  editorHtml,
  resetStylesToDefault,
}) => {
  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditorHtml(editorRef.current.innerHTML);
      const editorContent = editorRef.current.innerHTML.trim();
      if (editorContent === '' || editorContent === '<br>') {
        resetStylesToDefault();
      }
      console.log(editorHtml);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (editorRef.current) {
          const img = document.createElement('img');
          img.src = reader.result as string;
          editorRef.current.appendChild(img);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmbedLink = () => {
    const url = prompt('Enter the URL');
    if (url) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const link = document.createElement('a');
      link.href = url;
      link.appendChild(range.extractContents());
      range.insertNode(link);
    }
  };

  const handleAddAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const link = URL.createObjectURL(file);
      if (editorRef.current) {
        editorRef.current.innerHTML += `<a href="${link}" download="${file.name}">${file.name}</a>`;
        setEditorHtml(editorRef.current.innerHTML);
      }
    }
  };

  return (
    <span>
      <div className="bg-white text-base caret-fuchsia-500  h-[26.5rem]  w-[31.1rem] overflow-hidden mt-[0.1rem]">
        <div className="text-editor w-full">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="editor w-full h-full px-4 py-2 mt-2 outline-none overflow-y-scroll"
          />
        </div>
      </div>

      <div className="bg-white overflow-hidden mt-[0.1rem]">
        <span className="h-full">
          <div className="controls w-full h-full flex flex-wrap my-2 mx-3 space-x-1">
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('bold')}
            >
              <FaBold />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('italic')}
            >
              <FaItalic />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('underline')}
            >
              <FaUnderline />
            </Button>

            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />

            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('justifyLeft')}
            >
              <PiTextAlignLeftBold />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('justifyCenter')}
            >
              <FiAlignCenter />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('justifyRight')}
            >
              <PiTextAlignRightBold />
            </Button>
            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />

            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('insertOrderedList')}
            >
              <GoListOrdered />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={() => handleToolBarButtonClick('insertUnorderedList')}
            >
              <GoListUnordered />
            </Button>
            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
              onClick={handleEmbedLink}
            >
              <FaLink />
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
            >
              <label>
                <MdImage />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </Button>
            <Button
              variant="ghost"
              size="toolBar"
              className="rounded-sm text-base"
            >
              <label>
                <IoDocumentAttach />
                <input
                  type="file"
                  onChange={handleAddAttachment}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </span>
      </div>
    </span>
  );
};

export default TextEditor;
