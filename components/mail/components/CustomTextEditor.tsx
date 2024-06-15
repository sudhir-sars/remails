// File: CustomTextEditorWithControls.tsx

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FiAlignCenter } from 'react-icons/fi';
import { PiTextAlignLeftBold, PiTextAlignRightBold } from 'react-icons/pi';
import { FaBold, FaItalic, FaUnderline, FaLink } from 'react-icons/fa';
import { GoListOrdered, GoListUnordered, GoFile } from 'react-icons/go';
import { MdImage } from 'react-icons/md';

const CustomTextEditor = () => {
  const [content, setContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = (command: string) => {
    document.execCommand(command, false, '');
  };

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (editorRef.current) {
          document.execCommand('insertImage', false, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmbedLink = () => {
    const url = prompt('Enter the URL');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const handleAddAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const link = URL.createObjectURL(file);
      if (editorRef.current) {
        editorRef.current.innerHTML += `<a href="${link}" download="${file.name}">${file.name}</a>`;
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  return (
 
      <div className="text-editor w-full">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="editor w-full p-4 min-h-52 max-h-[450px] mt-2 rounded-md outline-none text-base overflow-y-scroll"
        />
      </div>
      <div className="controls w-full flex flex-wrap mt-2">
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('bold')}
          value="bold"
        >
          <FaBold />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('italic')}
          value="italic"
        >
          <FaItalic />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('underline')}
          value="underline"
        >
          <FaUnderline />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('justifyLeft')}
          value="justifyLeft"
        >
          <PiTextAlignLeftBold />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('justifyCenter')}
          value="justifyCenter"
        >
          <FiAlignCenter />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('justifyRight')}
          value="justifyRight"
        >
          <PiTextAlignRightBold />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('insertOrderedList')}
          value="insertOrderedList"
        >
          <GoListOrdered />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={() => handleButtonClick('insertUnorderedList')}
          value="insertUnorderedList"
        >
          <GoListUnordered />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          onClick={handleEmbedLink}
          value="embedLink"
        >
          <FaLink />
        </Button>
        <Button
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          value="uploadImage"
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
          variant={'ghost'}
          size={'toolBar'}
          className="rounded-sm text-base"
          value="addAttachment"
        >
          <label>
            <GoFile />
            <input
              type="file"
              onChange={handleAddAttachment}
              className="hidden"
            />
          </label>
        </Button>
      </div>

  );
};

export default CustomTextEditor;
