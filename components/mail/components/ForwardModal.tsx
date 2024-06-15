'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TextEditor from './TextEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MailDisplayFull } from './MailDisplyFull';
import { IEmail, IThread } from './IMail';

interface MailDisplayProps {
  mail: IEmail;
  // thread?: IThread;
  setForward: (item: boolean) => void;
}

const thread = [
  { emails: ['email1@example.com', 'email2@example.com'] },
  { emails: ['email3@example.com', 'email4@example.com'] },
  { emails: ['email5@example.com', 'email6@example.com'] },
  { emails: ['email7@example.com', 'email8@example.com'] },
];
export function ForwardModal({ mail, setForward }: MailDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [addCc, setAddCc] = useState(false);
  const [addBcc, setAddBcc] = useState(false);
  const [ccInputValue, setCcInputValue] = useState('');
  const [bccInputValue, setBccInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [ccList, setCcList] = useState<string[]>([]);
  const [bccList, setBccList] = useState<string[]>([]);
  const [isSendButtonActive, setIsSendButtonActive] = useState(false);
  const replyName = mail.reply.match(/^[^@]+/);
  console.log(replyName);

  useEffect(() => {
    setIsOpen(true);
    setIsSendButtonActive(!!recipient && !!subject && !!message);
  }, [recipient, subject, message]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setForward(false); // Reset the reply state when the modal is closed
    }
  };

  const handleSend = () => {
    alert(
      `Email sent to: ${recipient}\nSubject: ${subject}\nMessage: ${message}`
    );
    setRecipient('');
    setSubject('');
    setMessage('');
  };
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
    if (e.key === 'Enter' && ccInputValue != '') {
      e.preventDefault();
      handleAddPeople('cc');
      setCcInputValue('');
    }
    if (e.key === 'Enter' && bccInputValue != '') {
      e.preventDefault();
      handleAddPeople('bcc');
      setCcInputValue('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col  ">
        <span className="w-full p-4 h-full">
          <ScrollArea className="h-full w-full rounded-md border p-4">
            <span className="">
              <MailDisplayFull mail={mail} />
            </span>
            <Separator className="h-1 mt-5 rounded-full mb-10" />

            <span className="space-y-1">
              <span className="h-[4vh] mx-3  flex justify-start items-center space-x-2  my-2">
                <span className="text-xs">Reply to:</span>
                <span className="text-sm cursor-default bg-muted rounded-full w-auto shadow-md flex flex-row pl-1 pr-4 py-[0.15rem] space-x-2 items-center">
                  <span>
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </span>
                  <span className="mb-1">{replyName}</span>
                </span>

                <span
                  onClick={() => setAddCc(!addCc)}
                  className={`ml-2 cursor-pointer border dark:hover:bg-muted rounded-full px-3 text-xs py-1 ${
                    addCc ? 'bg-black text-white' : ''
                  }`}
                >
                  Cc
                </span>
                <span
                  onClick={() => setAddBcc(!addBcc)}
                  className={`ml-2 cursor-pointer border dark:hover:bg-muted rounded-full px-3 text-xs py-1 ${
                    addBcc ? 'bg-black text-white' : ''
                  }`}
                >
                  Bcc
                </span>
              </span>

              {addCc && (
                <span className=" w-full flex justify-start px-3">
                  <span className="flex space-x-2 w-full py-1 h-9 rounded-lg text-sm px-3 items-center">
                    <span className="text-muted-foreground mr-[0.3rem]">
                      Cc
                    </span>
                    <Separator orientation="vertical" />
                    {ccList.length > 0 &&
                      ccList.map((item, index) => (
                        <span key={index} className="ml-1">
                          <span className="text-sm cursor-default bg-muted rounded-full w-auto  flex flex-row pl-1 pr-4 py-[0.15rem] space-x-2 items-center">
                            <span>
                              <Avatar className="w-6 h-6">
                                <AvatarImage
                                  src="https://github.com/shadcn.png"
                                  alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                            </span>
                            <span className="mb-1">{item}</span>
                          </span>
                        </span>
                      ))}
                    <input
                      type="text"
                      value={ccInputValue}
                      onChange={(e) => setCcInputValue(e.target.value)}
                      onKeyDown={handleKeyDownCcList}
                      className="w-full outline-none bg-transparent placeholder:text-xs"
                      placeholder=""
                    />
                  </span>
                </span>
              )}
              {addBcc && (
                <span className=" w-full flex justify-start px-3 ">
                  <span className="flex space-x-2 w-full py-1 h-9 rounded-lg  text-sm px-3 items-center">
                    <span className="text-muted-foreground">Bcc</span>
                    <Separator orientation="vertical" />
                    {bccList.length > 0 &&
                      bccList.map((item, index) => (
                        <span key={index} className="ml-1">
                          <span className="text-sm cursor-default bg-muted rounded-full w-auto  flex flex-row pl-1 pr-4 py-[0.15rem] space-x-2 items-center">
                            <span>
                              <Avatar className="w-6 h-6">
                                <AvatarImage
                                  src="https://github.com/shadcn.png"
                                  alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                            </span>
                            <span className="mb-1">{item}</span>
                          </span>
                        </span>
                      ))}
                    <input
                      type="text"
                      value={bccInputValue}
                      onChange={(e) => setBccInputValue(e.target.value)}
                      onKeyDown={handleKeyDownCcList}
                      className="w-full outline-none bg-transparent placeholder:text-xs"
                      placeholder=""
                    />
                  </span>
                </span>
              )}

              <TextEditor />
            </span>
          </ScrollArea>
        </span>
      </DialogContent>
    </Dialog>
  );
}
