import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IoDocumentAttach } from 'react-icons/io5';
import { FiAlignCenter } from 'react-icons/fi';
import { PiTextAlignLeftBold, PiTextAlignRightBold } from 'react-icons/pi';
import { FaBold, FaItalic, FaUnderline, FaLink } from 'react-icons/fa';
import { GoListOrdered, GoListUnordered } from 'react-icons/go';
import { MdImage } from 'react-icons/md';

interface ITextEditor {
  editorRef: any;
  handleEditorInput: any;
  handleButtonClick: any;
  handleEmbedLink: any;
  handleImageUpload: any;
  handleAddAttachment: any;
}

const TextEditor = ({
  editorRef,
  handleEditorInput,
  handleButtonClick,
  handleEmbedLink,
  handleImageUpload,
  handleAddAttachment,
}) => {
  return (
    <span>
      <div className="bg-white text-base caret-fuchsia-500 h-[66.5%] overflow-hidden mt-[0.1rem]">
        <span>
          <div className="text-editor w-full h-full">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="editor w-full h-full px-4 py-2 mt-2 outline-none text-base overflow-y-scroll"
            />
          </div>
        </span>
      </div>

      <div className="bg-white overflow-hidden mt-[0.1rem]">
        <span className="h-full">
          <div className="controls w-full h-full flex flex-wrap my-2 mx-3 space-x-1">
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

            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />

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
            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />

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
            <Separator
              orientation="vertical"
              className="h-7 w-[0.1rem] rounded-full"
            />
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
