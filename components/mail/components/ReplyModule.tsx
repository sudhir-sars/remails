import React, { useEffect, useState, useRef, RefObject } from 'react';
import { format, addDays, addHours, nextSaturday } from 'date-fns';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area';
import PlateEditor from '@/components/plate-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import UploadFileDialog from './UploadFileDialog';
import {
  Paperclip,
  Clock,
  X,
  ReplyAll as ReplyAllIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  ChevronDown,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import Suggester from './search/suggester';

import DateTimePicker from '@/components/ui/timeAndDatePicker';
import { IEmail } from './IMail';
import { Minimize2 } from 'lucide-react';

interface FileObject {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  fileId?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  filename?: string;
}
import {
  createPlateEditor,
  Plate,
  PlateEditor as PlateEditorType,
} from '@udecode/plate-common';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';
import { Maximize2 } from 'lucide-react';
import { IAddress } from './IMail';
interface ReplyModuleProps {
  floatingTempMail: IEmail;
  setFloatingTempMail: (floatingTempMail: IEmail) => void;
  showForward: boolean;
  showReplyAll: boolean;
  showReply: boolean;
  replyState: 'Reply' | 'Forward' | 'Reply All';
  setShowForward: (state: boolean) => void;
  setShowReplyAll: (state: boolean) => void;
  setShowReply: (state: boolean) => void;
  setReplyState: (state: 'Reply' | 'Forward' | 'Reply All') => void;
  dndReplyRef: RefObject<HTMLDivElement>;
  replyModuleVisibility: boolean;
  mail: IEmail;
  triggerGemini: any;
  setTriggerGemini: (value: any) => void;
  setReplyModuleVisibility: (replyModuleVisibility: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  widthRef: RefObject<HTMLDivElement>;
  mailListRef: RefObject<HTMLDivElement>;
  suggestableMails: IAddress[];
  replyModuleTempMail: IEmail;
  setReplyModuleTempMail: (replyModuleTempMail: IEmail) => void;
  unMountreplyModule: boolean;
  setUnMountReplyModule: (isMinimized: boolean) => void;
  setSubject: (subject: string) => void;
  subject: string;
  attachmentFiles: FileObject[];
  setAttachmentFiles: React.Dispatch<React.SetStateAction<FileObject[]>>;
}

export function ReplyModule({
  attachmentFiles,
  setAttachmentFiles,
  floatingTempMail,
  setFloatingTempMail,
  setSubject,
  subject,
  showForward,
  showReplyAll,
  showReply,
  replyState,
  setShowForward,
  setShowReplyAll,
  setShowReply,
  setReplyState,

  unMountreplyModule,
  setUnMountReplyModule,
  setReplyModuleTempMail,
  replyModuleTempMail,
  suggestableMails,
  widthRef,
  replyModuleVisibility,
  mail,
  triggerGemini,
  setTriggerGemini,
  dndReplyRef,
  setReplyModuleVisibility,
  isMinimized,
  setIsMinimized,
  mailListRef,
}: ReplyModuleProps) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [to, setTo] = useState<string>(replyModuleTempMail.reply);
  const [toEmails, setToEmails] = useState<string[]>([]);

  const [cc, setCc] = useState<string>('');
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string>('');
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [html, setHtml] = useState('dummy');
  const [isSending, setIsSending] = useState(false);
  const [date, setDate] = useState<Date>();
  const [seralizedSlateData, setSeralizedSlateData] = useState<string>('');
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const seralizeSlateDataRef = useRef<HTMLButtonElement>(null);

  const [width, setWidth] = useState(widthRef.current?.clientWidth);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    setTo(replyModuleTempMail.email);
  }, [replyModuleTempMail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mailListElement = mailListRef.current;
      if (mailListElement && mailListElement.contains(event.target as Node)) {
        setFloatingTempMail(replyModuleTempMail);
        setReplyModuleVisibility(false);
      }
    };

    if (replyModuleVisibility && !isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [replyModuleVisibility, isMinimized]);

  useEffect(() => {
    if (widthRef.current) {
      const updateWidth = () => setWidth(widthRef.current?.clientWidth || 0);
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [widthRef]);

  const handleAddAttachmentButtonClick = () => {
    if (uploadButtonRef.current) {
      uploadButtonRef.current.click();
    }
  };
  const [fromName, setFromName] = useState<string>('');
  const [fromEmail, setFromEmail] = useState<string>('');
  const fetchUserInfo = async () => {
    const userId = localStorage.getItem('userId')!;

    try {
      const response = await fetch('/api/userData/fetchData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const res = await response.json();
        const userData = res.data;
        console.log(userData);
        setFromName(userData.name);
        setFromEmail(userData.email);
      } else {
        console.error('Failed to update user data');
      }
    } catch (err) {
      console.error('Error occurred while updating user data:', err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const sendEmail = async () => {
    if (toEmails.length < 1) {
      toast.error('Please add at least one recipient', {
        position: 'top-right',
        closeButton: true,
      });
      return;
    }
    if (!subject) {
      toast.error('Please add a subject to the email', {
        position: 'top-right',
        closeButton: true,
      });
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('to', toEmails.join(','));
      formData.append('fromName', fromName);
      formData.append('fromEmail', fromEmail);
      formData.append('subject', subject);
      formData.append('html', seralizedSlateData);

      const fileIdsArray: string[] = []; // Initialize as an empty array of strings

      // Collect file IDs
      attachmentFiles.forEach((fileObj) => {
        if (fileObj.fileId) {
          fileIdsArray.push(fileObj.fileId);
        }
      });

      // Create a comma-separated string of file IDs
      const fileIdsString = fileIdsArray.join(',');

      // Append the comma-separated string to formData
      formData.append('fileIds', fileIdsString);

      if (cc) formData.append('cc', ccEmails.join(','));
      if (bcc) formData.append('bcc', bccEmails.join(','));

      const response = await fetch('/api/send/gmail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
        },
        body: formData,
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success('Email sent successfully', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred while sending the email', {
        duration: 5000,
        position: 'top-right',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setPlateData(undefined);
    setUnMountReplyModule(true);
    setReplyModuleVisibility(false);
    setToEmails([]);
    setSubject('');
    setCc('');
    setCcEmails([]);
    setBcc('');
    setBccEmails([]);
    setHtml('');
    setSeralizedSlateData('');
  };

  const formatEmail = (email: string) => {
    const regex = /^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/;
    const match = email.match(regex);
    if (match) {
      const displayName = match[1] || '';
      const emailAddress = match[2] || '';
      return { displayName, emailAddress };
    }
    return { displayName: '', emailAddress: email };
  };

  useEffect(() => {
    const emailName = formatEmail(replyModuleTempMail.reply).emailAddress;
    if (emailName.length > 5) {
      setTo(emailName);
    }
    setTo(replyModuleTempMail.email);
  }, []);

  const [plateData, setPlateData] = useState<PlateEditorType>();
  const [uploadedFilesSet, setUploadedFilesSet] = useState<Set<string>>(
    new Set()
  );

  return (
    <>
      {isMaximized ? (
        <Dialog open={isMaximized} onOpenChange={setIsMaximized}>
          <DialogContent className="h-[85vh] w-[85vw] pt-3  ">
            <div className="reltive">
              <div className="flex items-center pt-2 space-x-4  ">
                <Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center ">
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {showReply && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7 "
                            >
                              <ReplyIcon size={17} />
                            </Button>
                          )}
                          {showReplyAll && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7"
                            >
                              <ReplyAllIcon size={17} />
                            </Button>
                          )}
                          {showForward && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7"
                            >
                              <ForwardIcon size={17} />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            className="rounded-full rounded-l-none ml-[0.045rem] px-[0.35rem] h-7"
                          >
                            <ChevronDown size={12} />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{replyState}</p>
                      </TooltipContent>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setShowReply(true);
                          setSubject('Re: ' + mail.subject);
                          setShowForward(false);
                          setShowReplyAll(false);
                          setReplyState('Reply');
                        }}
                      >
                        <div>Reply</div>
                        <ReplyIcon size={14} className="ml-[2.15rem]" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setShowReplyAll(true);
                          setSubject('Re: ' + mail.subject);
                          setShowForward(false);
                          setShowReply(false);
                          setReplyState('Reply All');
                        }}
                      >
                        <div>Reply All</div>
                        <ReplyAllIcon size={14} className="ml-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSubject('Fwd: ' + mail.subject);
                          setShowForward(true);
                          setShowReply(false);
                          setShowReplyAll(false);
                          setReplyState('Forward');
                        }}
                      >
                        <div>Forward</div>
                        <ForwardIcon size={14} className="ml-5" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>

                <Button
                  size="xs"
                  variant="link"
                  className=""
                  onClick={() => setIsMaximized(false)}
                >
                  <Minimize2 size={15} className="hover:text-blue-600" />
                </Button>
              </div>
              <div className="px-4  pt-2">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-2 flex-grow">
                    <Label htmlFor="email" className="text-xs w-[1.66rem]">
                      To
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setToEmails}
                        validEmails={toEmails}
                        setInPutData={setTo}
                        inputData={to}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="link"
                      onClick={() => setShowCc(!showCc)}
                      className={`text-muted ${showCc ? 'text-primary underline' : 'text-muted-foreground'}`}
                    >
                      Cc
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setShowBcc(!showBcc)}
                      className={`text-muted ${showBcc ? 'text-primary underline' : 'text-muted-foreground'}`}
                    >
                      Bcc
                    </Button>
                  </div>
                </div>

                {showCc && (
                  <div className="flex items-center space-x-2 w-full mt-2">
                    <Label htmlFor="cc" className="text-xs w-[1.66rem]">
                      Cc
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted  rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setCcEmails}
                        validEmails={ccEmails}
                        setInPutData={setCc}
                        inputData={cc}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                )}

                {showBcc && (
                  <div className="flex items-center space-x-2 w-full mt-2">
                    <Label htmlFor="bcc" className="text-xs w-[1.66rem]">
                      Bcc
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setBccEmails}
                        validEmails={bccEmails}
                        setInPutData={setBcc}
                        inputData={bcc}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 w-full mt-2 mb-4">
                  <Label htmlFor="subject" className="text-xs w-[1.66rem]">
                    Sub
                  </Label>
                  <Separator
                    orientation="vertical"
                    className="h-5 bg-muted rounded-full"
                  />
                  <div className="flex-grow">
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Subject"
                      className="border-none shadow-none w-full px-2 py-1 caret-black"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      autoComplete="off"
                      aria-autocomplete="none"
                    />
                  </div>
                </div>
              </div>
              <ScrollArea
                className={`h-[57vh]
                ${showBcc ? 'h-[47vh]' : ''}
                `}
              >
                <ScrollAreaViewport className="w-full   shadow-inner">
                  <PlateEditor
                    suggestableMails={suggestableMails}
                    setPlateData={setPlateData}
                    plateData={plateData}
                    isMaximized={isMaximized}
                    setSeralizedSlateData={setSeralizedSlateData}
                    seralizeSlateDataRef={seralizeSlateDataRef}
                    mail={mail}
                    triggerGemini={triggerGemini}
                    setTriggerGemini={setTriggerGemini}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="space-x-4 flex  justify-start mr-6 items-center">
                <Button
                  size="xs"
                  variant={'outline'}
                  className="rounded-lg ml-3 px-4 h-7 "
                  onClick={async () => {
                    await new Promise((resolve) => {
                      seralizeSlateDataRef.current?.click();
                      setTimeout(resolve, 0);
                    });
                    sendEmail();
                  }}
                  disabled={isSending}
                >
                  Send
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddAttachmentButtonClick}
                      size="xs"
                      variant="outline"
                      className="py-0 outline-none border-none shadow-none bg-transparent"
                    >
                      <Paperclip size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach Files</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <Popover>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-none py-0 outline-none shadow-none bg-transparent"
                          disabled={!mail}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <PopoverContent
                      className="flex w-auto p-0 px-1"
                      side="top"
                      align="start"
                    >
                      <div className="flex flex-col gap-2 border-r px-2 py-4">
                        <div className="px-4 text-xs font-medium">
                          Schedule To
                        </div>
                        <div className="grid min-w-[240px] gap-1">
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addHours(new Date(), 4))}
                          >
                            Later today
                            <span className="ml-auto text-muted-foreground">
                              {format(addHours(new Date(), 4), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addDays(new Date(), 1))}
                          >
                            Tomorrow
                            <span className="ml-auto text-muted-foreground">
                              {format(addDays(new Date(), 1), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(nextSaturday(new Date()))}
                          >
                            This weekend
                            <span className="ml-auto text-muted-foreground">
                              {format(nextSaturday(new Date()), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addDays(new Date(), 7))}
                          >
                            Next week
                            <span className="ml-auto text-muted-foreground">
                              {format(addDays(new Date(), 7), 'E, h:m b')}
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="p-2">
                        <DateTimePicker date={date} setDate={setDate} />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <TooltipContent>Schedule Send</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <UploadFileDialog
              unMountreplyModule={unMountreplyModule}
              uploadedFilesSet={uploadedFilesSet}
              setUploadedFilesSet={setUploadedFilesSet}
              uploadButtonRef={uploadButtonRef}
              files={attachmentFiles}
              setFiles={setAttachmentFiles}
            />
          </DialogContent>
        </Dialog>
      ) : (
        replyModuleVisibility && (
          <div className="flex items-center justify-center">
            <div
              id="reply-module"
              style={{ width: `calc(100% - 30px)` }}
              className="border-2 py-4 pt-[0.6rem] pl-2  bg-background rounded-xl absolute bottom-0 z-10"
            >
              <div className="flex items-center pb-2 ml-1 space-x-2 mt-2 mb-2">
                <Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center">
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {showReply && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7"
                            >
                              <ReplyIcon size={17} />
                            </Button>
                          )}
                          {showReplyAll && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7"
                            >
                              <ReplyAllIcon size={17} />
                            </Button>
                          )}
                          {showForward && (
                            <Button
                              variant="outline"
                              size="xs"
                              className="rounded-2xl rounded-r-none px-3 h-7"
                            >
                              <ForwardIcon size={17} />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            className="rounded-full rounded-l-none ml-[0.045rem] px-[0.35rem] h-7"
                          >
                            <ChevronDown size={12} />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{replyState}</p>
                      </TooltipContent>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setShowReply(true);
                          setSubject('Re: ' + mail.subject);
                          setShowForward(false);
                          setShowReplyAll(false);
                          setReplyState('Reply');
                        }}
                      >
                        <div>Reply</div>
                        <ReplyIcon size={14} className="ml-[2.15rem]" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setShowReplyAll(true);
                          setSubject('Re: ' + mail.subject);
                          setShowForward(false);
                          setShowReply(false);
                          setReplyState('Reply All');
                        }}
                      >
                        <div>Reply All</div>
                        <ReplyAllIcon size={14} className="ml-4" />
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSubject('Fwd: ' + mail.subject);
                          setShowForward(true);
                          setShowReply(false);
                          setShowReplyAll(false);
                          setReplyState('Forward');
                        }}
                      >
                        <div>Forward</div>
                        <ForwardIcon size={14} className="ml-5" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>

                <Button
                  size="xs"
                  variant="link"
                  className="py-0"
                  onClick={() => setIsMaximized(true)}
                >
                  <Maximize2 size={15} className="hover:text-blue-600" />
                </Button>
                <Button
                  size="xs"
                  variant="link"
                  className="py-0"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4 hover:text-red-500" />
                </Button>
              </div>
              <div className="px-4 ">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-2 flex-grow">
                    <Label htmlFor="email" className="text-xs w-[1.66rem]">
                      To
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setToEmails}
                        validEmails={toEmails}
                        setInPutData={setTo}
                        inputData={to}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="link"
                      onClick={() => setShowCc(!showCc)}
                      className={`text-muted ${showCc ? 'text-primary underline' : 'text-muted-foreground'}`}
                    >
                      Cc
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => setShowBcc(!showBcc)}
                      className={`text-muted ${showBcc ? 'text-primary underline' : 'text-muted-foreground'}`}
                    >
                      Bcc
                    </Button>
                  </div>
                </div>

                {showCc && (
                  <div className="flex items-center space-x-2 w-full mt-2">
                    <Label htmlFor="cc" className="text-xs w-[1.66rem]">
                      Cc
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setCcEmails}
                        validEmails={ccEmails}
                        setInPutData={setCc}
                        inputData={cc}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                )}

                {showBcc && (
                  <div className="flex items-center space-x-2 w-full mt-2">
                    <Label htmlFor="bcc" className="text-xs w-[1.66rem]">
                      Bcc
                    </Label>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-muted rounded-full"
                    />
                    <div className="flex-grow">
                      <Suggester
                        unMountreplyModule={unMountreplyModule}
                        setValidEmails={setBccEmails}
                        validEmails={bccEmails}
                        setInPutData={setBcc}
                        inputData={bcc}
                        suggestableMails={suggestableMails}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 w-full mt-2">
                  <Label htmlFor="subject" className="text-xs w-[1.66rem]">
                    Sub
                  </Label>
                  <Separator
                    orientation="vertical"
                    className="h-5 bg-muted rounded-full"
                  />
                  <div className="flex-grow">
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Subject"
                      className="border-none shadow-none w-full px-2 py-1 caret-black"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      autoComplete="off"
                      aria-autocomplete="none"
                    />
                  </div>
                </div>
              </div>
              <ScrollArea className="h-[40vh]">
                <ScrollAreaViewport className="w-full bg-background shadow-inner">
                  <PlateEditor
                    suggestableMails={suggestableMails}
                    setPlateData={setPlateData}
                    plateData={plateData}
                    setSeralizedSlateData={setSeralizedSlateData}
                    seralizeSlateDataRef={seralizeSlateDataRef}
                    mail={mail}
                    triggerGemini={triggerGemini}
                    setTriggerGemini={setTriggerGemini}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
              <div className="space-x-2 flex items-center">
                <Button
                  size="xs"
                  variant={'outline'}
                  className="rounded-lg ml-3 px-4 h-7 "
                  onClick={async () => {
                    await new Promise((resolve) => {
                      seralizeSlateDataRef.current?.click();
                      setTimeout(resolve, 0);
                    });
                    sendEmail();
                  }}
                  disabled={isSending}
                >
                  Send
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddAttachmentButtonClick}
                      size="xs"
                      variant="outline"
                      className="py-0 outline-none border-none shadow-none bg-transparent"
                    >
                      <Paperclip size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach Files</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <Popover>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-none py-0 outline-none shadow-none bg-transparent"
                          disabled={!mail}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-auto p-0 px-1">
                      <div className="flex flex-col gap-2 border-r px-2 py-4">
                        <div className="px-4 text-xs font-medium">
                          Schedule To
                        </div>
                        <div className="grid min-w-[240px] gap-1">
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addHours(new Date(), 4))}
                          >
                            Later today
                            <span className="ml-auto text-muted-foreground">
                              {format(addHours(new Date(), 4), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addDays(new Date(), 1))}
                          >
                            Tomorrow
                            <span className="ml-auto text-muted-foreground">
                              {format(addDays(new Date(), 1), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(nextSaturday(new Date()))}
                          >
                            This weekend
                            <span className="ml-auto text-muted-foreground">
                              {format(nextSaturday(new Date()), 'E, h:m b')}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            className="justify-start text-xs font-normal"
                            onClick={() => setDate(addDays(new Date(), 7))}
                          >
                            Next week
                            <span className="ml-auto text-muted-foreground">
                              {format(addDays(new Date(), 7), 'E, h:m b')}
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="p-2">
                        <DateTimePicker date={date} setDate={setDate} />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <TooltipContent>Schedule Send</TooltipContent>
                </Tooltip>
              </div>
              <UploadFileDialog
                unMountreplyModule={unMountreplyModule}
                uploadedFilesSet={uploadedFilesSet}
                setUploadedFilesSet={setUploadedFilesSet}
                uploadButtonRef={uploadButtonRef}
                files={attachmentFiles}
                setFiles={setAttachmentFiles}
              />
            </div>
          </div>
        )
      )}
    </>
  );
}
