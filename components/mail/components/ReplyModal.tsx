'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

import { IoIosClose } from 'react-icons/io';

import AddPeople from './compose mail/AddPeople';
import FloatingToolBar from './compose mail/FloatingToolBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaAngleDown } from 'react-icons/fa';
import { addMinutes, addDays, format } from 'date-fns';
import React, { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IEmail } from './IMail';
import { IoClose } from 'react-icons/io5';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import TextEditor from './TextEditor';

interface MailDisplayProps {
  mail: IEmail;
  setReply: (item: boolean) => void;
}

export function ReplyModal({ mail, setReply }: MailDisplayProps) {
  const [recipient, setRecipient] = useState('');

  const [addCc, setAddCc] = useState(false);
  const [ccInputValue, setCcInputValue] = useState('');
  const [ccList, setCcList] = useState<string[]>([]);

  const [addBcc, setAddBcc] = useState(false);
  const [bccList, setBccList] = useState<string[]>([]);
  const [bccInputValue, setBccInputValue] = useState('');

  const [addSubject, setAddSubject] = useState(false);
  const [subject, setSubject] = useState('This is subject');
  const [subjectInputValue, setSubjectInputValue] = useState('');

  const [addTo, setAddTo] = useState(false);
  const [to, setTo] = useState('sudhir');
  const [toInputValue, setToInputValue] = useState('');

  const [message, setMessage] = useState('');

  const [isSendButtonActive, setIsSendButtonActive] = useState(false);

  const [editorHtml, setEditorHtml] = useState('');
  const [scheduleTime, setScheduleTime] = useState<Date | null>(null);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);

  const replyName = mail.reply.match(/^[^@]+/);
  console.log(replyName);

  const handleSchedule = (
    option: '5min' | '30min' | '60min' | '1day' | null
  ) => {
    let timeToSchedule: Date | null = null;
    switch (option) {
      case '5min':
        timeToSchedule = addMinutes(new Date(), 5);
        break;
      case '30min':
        timeToSchedule = addMinutes(new Date(), 30);
        break;
      case '60min':
        timeToSchedule = addMinutes(new Date(), 60);
        break;
      case '1day':
        timeToSchedule = addDays(new Date(), 1);
        break;
      default:
        timeToSchedule = null;
    }
    setIsScheduled(true);
    setScheduleTime(timeToSchedule);
  };

  const handleSend = async () => {
    const token = localStorage.getItem('refreshToken');
    const response = await fetch('/api/send/gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: 'recipient@example.com',
        subject: 'Your Email Subject',
        html: editorHtml,
      }),
    });

    if (response.ok) {
      alert('Email sent successfully');
    } else {
      alert('Failed to send email');
    }

    if (scheduleTime) {
      alert(`Email scheduled to be sent on ${format(scheduleTime, 'PPpp')}`);
    } else {
      alert('Email sent immediately');
    }
  };

  useEffect(() => {
    setIsSendButtonActive(!!recipient && !!subject && !!message);
  }, [recipient, subject, message]);

  const handleAddPeople = (action: string) => {
    if (action === 'cc') {
      setCcList([...ccList, ccInputValue]);
      setCcInputValue('');
    }
    if (action === 'bcc') {
      setBccList([...bccList, bccInputValue]);
      setBccInputValue('');
    }
  };
  const handleKeyDownCcList = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && toInputValue != '') {
      e.preventDefault();
      setTo(toInputValue);
      setAddTo(false);
      setToInputValue('');
    }
    if (e.key === 'Enter' && subjectInputValue != '') {
      e.preventDefault();
      setSubject(subjectInputValue);
      setAddSubject(false);
      setSubjectInputValue('');
    }
    if (e.key === 'Enter' && bccInputValue != '') {
      e.preventDefault();
      handleAddPeople('bcc');
      setCcInputValue('');
    }
  };

  const editorRef = useRef<HTMLDivElement>(null);

  const applyStyle = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement(tag);
    span.appendChild(range.extractContents());
    range.insertNode(span);
  };

  const handleButtonClick = (command: string) => {
    switch (command) {
      case 'bold':
        applyStyle('b');
        break;
      case 'italic':
        applyStyle('i');
        break;
      case 'underline':
        applyStyle('u');
        break;
      case 'justifyLeft':
        document.execCommand('justifyLeft');
        break;
      case 'justifyCenter':
        document.execCommand('justifyCenter');
        break;
      case 'justifyRight':
        document.execCommand('justifyRight');
        break;
      case 'insertOrderedList':
        document.execCommand('insertOrderedList');
        break;
      case 'insertUnorderedList':
        document.execCommand('insertUnorderedList');
        break;
      default:
        break;
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditorHtml(editorRef.current.innerHTML);
      console.log(editorRef.current.innerHTML);
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
    <div className="overflow-hidden  fixed inset-0 bg-[#ebecef]/50 backdrop-blur-xl rounded-lg  z-50 space-x-4 space-y-4 flex justify-center items-center">
      <span className="border flex w-auto p-4 space-x-7 pl-28">
        <div className=" border-2 border-white py-4 px-[0.35rem] h-[90vh] shadow-lg w-[33vw] bg-[#f1f2f4] rounded-xl">
          <span className="font-semibold text-lg pl-3 ">New Message</span>
          <div className="bg-white mt-4 rounded-xl rounded-b-none px-4 pt-2">
            <span>
              <span className="w-full flex justify-start">
                <span className="flex space-x-2 w-full py-1 h-9 rounded-lg text-sm items-center ">
                  <span className="text-gray-700 mr-[0.3rem] text-xs font-semibold">
                    To:
                  </span>
                  {!addTo && (
                    <span className="flex">
                      <span className="ml-1">
                        <span className="text-sm cursor-default border shadow-sm rounded-full w-auto flex flex-row pl-1 pr-1 space-x-2 items-center">
                          <span>
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                              />
                              <AvatarFallback className="text-xs p-1">
                                CN
                              </AvatarFallback>
                            </Avatar>
                          </span>
                          <span className="mb-1">{to}</span>
                          <span className="pr-1">
                            <IoClose
                              onClick={() => {
                                setAddTo(true);
                              }}
                              className="text-xs text-white bg-gray-400 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
                            />
                          </span>
                        </span>
                      </span>
                    </span>
                  )}
                  {addTo && (
                    <input
                      type="text"
                      value={toInputValue}
                      onChange={(e) => setToInputValue(e.target.value)}
                      onKeyDown={handleKeyDownCcList}
                      className="w-full outline-none caret-purple-600 bg-transparent placeholder:text-xs"
                      placeholder=""
                    />
                  )}
                </span>
              </span>
            </span>
          </div>

          <div className="bg-white px-4 mt-[0.08rem]">
            <span>
              <span className="w-full flex justify-start">
                <span className="flex space-x-2 w-full py-1 h-9 rounded-lg text-sm items-center">
                  <span className="text-gray-700 mr-[0.3rem] text-xs font-semibold">
                    Subject:
                  </span>

                  {!addSubject && (
                    <span className="flex justify-between w-full">
                      <span className="font-semibold">{subject}</span>
                      <span>
                        <MdOutlineModeEditOutline
                          onClick={() => {
                            setAddSubject(true);
                          }}
                          className="text-2xl p-1 hover:bg-black rounded-full hover:text-white hover:dark:text-muted-foreground"
                        />
                      </span>
                    </span>
                  )}
                  {addSubject && (
                    <input
                      type="text"
                      value={subjectInputValue}
                      onChange={(e) => setSubjectInputValue(e.target.value)}
                      onKeyDown={handleKeyDownCcList}
                      className="w-full outline-none caret-purple-600 bg-transparent placeholder:text-xs"
                      placeholder=""
                    />
                  )}
                </span>
              </span>
            </span>
          </div>

          <div>
            <TextEditor
              editorRef={editorRef}
              handleEditorInput={handleEditorInput}
              handleButtonClick={handleButtonClick}
              handleEmbedLink={handleEmbedLink}
              handleImageUpload={handleImageUpload}
              handleAddAttachment={handleAddAttachment}
            />
          </div>

          <div className="bg-white text-base rounded-b-lg overflow-hidden mt-[0.1rem]">
            <span className="flex items-center justify-between">
              <Button
                size={'toolBar'}
                variant={'outline'}
                className="flex items-center ml-2"
                onClick={handleSend}
              >
                <span className="">Save as Drafts</span>
              </Button>
              <span className="flex justify-end items-center mr-2 my-2">
                {isScheduled && (
                  <span className="pl-1 py-[0.15rem] text-muted-foreground mr-2 text-xs cursor-default bg-muted rounded-full w-auto shadow-md flex pr-4 space-x-2 items-center">
                    <span className="pl-3">
                      Scheduled at {format(scheduleTime, 'MMM d, yyyy, h:mm a')}
                    </span>
                    <span>
                      <IoIosClose
                        onClick={() => {
                          setIsScheduled(false);
                          setScheduleTime(null);
                        }}
                        className="text-base hover:bg-primary rounded-full hover:text-white hover:dark:text-black"
                      />
                    </span>
                  </span>
                )}
                <Button
                  size={'toolBar'}
                  className="flex items-center rounded-r-none"
                  onClick={handleSend}
                >
                  <span className="pl-2">Send</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      size={'toolBar'}
                      className="ml-[0.08rem] flex items-center rounded-l-none"
                    >
                      <FaAngleDown className="text-md" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Schedule Email</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSchedule('5min')}>
                      Send after 5 Min
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSchedule('30min')}>
                      Send after 30 Min
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSchedule('60min')}>
                      Send after 60 Min
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSchedule('1day')}>
                      Schedule for 1 day later
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </span>
          </div>
        </div>

        <div className=" h-full w-[18vw]   space-y-10">
          <div className=" h-[40vh] w-full   ">
            <AddPeople setBccList={setBccList} setCcList={setCcList} />
          </div>
          <div className="h-[40vh] w-full  ">
            <FloatingToolBar />
          </div>
        </div>
      </span>
    </div>
  );
}
