// File: MailDisplay.tsx

'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useRef, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Archive, Forward, ReplyAll, Star, Trash2 } from 'lucide-react';
import AiLogo from '@/public/AiLogo.png';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PlateEditor from '@/components/plate-editor';
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from '@/components/ui/scroll-area';
import { ReplyModule } from './ReplyModule';
import DynamicLogo1 from '@/constants/DynamicLogo1.png';

import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { IEmail } from './IMail';
import { RefObject } from 'react';
import React from 'react';
import { IMailsWithFilter } from './IMail';
interface Attachment {
  filename: string;
  mimeType: string;
  data: string;
  size: number;
  extension: string;
}
import { handleDeleteFromDrive } from '@/utils/drive/functors';

interface AttachmentIconProps {
  extension: string;
}
import { getFileIcon } from '@/utils/attachmentThumbnails';
import { IAddress } from './IMail';
interface MailDisplayProps {
  floatingTempMail: IEmail;
  setFloatingTempMail: (floatingTempMail: IEmail) => void;
  mailsBigData: IMailsWithFilter;
  setMailsBigData: (mailsBigData: IMailsWithFilter) => void;
  setReplyModuleTempMail: (replyModuleTempMail: IEmail) => void;
  replyModuleTempMail: IEmail;
  mail: IEmail;
  dndReplyRef: RefObject<HTMLDivElement>;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  mailListRef: React.RefObject<HTMLDivElement>;
  suggestableMails: IAddress[];
  replyModuleVisibility: boolean;
  setReplyModuleVisibility: (isMinimized: boolean) => void;
  unMountreplyModule: boolean;
  setUnMountReplyModule: (isMinimized: boolean) => void;
}
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
  deleteMessages,
  archiveMessages,
  addToLabel,
  createLabel,
  deleteLabel,
  handleEmailOperation,
  markAsRead,
  removeFromLabel,
} from '@/utils/mail/operation';
import AttachmentViewer from './AttachmentViewer';

const MailDisplay = React.memo(
  ({
    floatingTempMail,
    setFloatingTempMail,
    mailsBigData,
    setMailsBigData,
    unMountreplyModule,
    setUnMountReplyModule,
    setReplyModuleTempMail,
    replyModuleTempMail,
    mail,
    dndReplyRef,
    isMinimized,
    setIsMinimized,
    replyModuleVisibility,
    setReplyModuleVisibility,
    mailListRef,
    suggestableMails,
  }: MailDisplayProps) => {
    const sanitizedHTML = mail && DOMPurify.sanitize(mail.htmlBody);

    const [forward, setForward] = useState<boolean>(false);
    const [fullView, setFullView] = useState(true);
    const [triggerSmartReply, setTriggerSmartReply] = useState(false);
    const [triggerGemini, setTriggerGemini] = useState(false);

    const widthRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (unMountreplyModule) {
        const fileIds = attachmentFiles
          .map((fileObj) => fileObj.fileId!)
          .filter((id) => id !== undefined) as string[];
        console.log('cleaning Up' + fileIds);
        if (fileIds.length > 0) {
          handleDeleteFromDrive(fileIds);
        }

        setAttachmentFiles([]);
      }
    }, [unMountreplyModule]);

    const handleDelete = async (emailIds: string[]) => {
      const success = await deleteMessages(emailIds);
      if (success.success) {
        const updatedEmails = { ...mailsBigData };
        Object.keys(updatedEmails).forEach((key) => {
          emailIds.forEach((id) => {
            if (updatedEmails[key][id]) {
              delete updatedEmails[key][id];
            }
          });
        });

        setMailsBigData(updatedEmails);
      }
    };

    const handleArchive = async (emailIds: string[], email: IEmail) => {
      const success = await archiveMessages(emailIds);
      if (success) {
        const updatedEmails = { ...mailsBigData };
        Object.keys(updatedEmails).forEach((key) => {
          emailIds.forEach((id) => {
            const email = updatedEmails[key][id];
            if (email) {
              email.labels.push('ARCHIVED');
            }
          });
        });
        setMailsBigData(updatedEmails);
      }
    };

    const handleStarred = async (emailIds: string[], email: IEmail) => {
      if (email.labels.includes('STARRED')) {
        return;
      }
      const success = await addToLabel(emailIds, 'STARRED');
      if (success) {
        const updatedEmails = { ...mailsBigData };
        Object.keys(updatedEmails).forEach((key) => {
          emailIds.forEach((id) => {
            const email = updatedEmails[key][id];
            if (email) {
              email.labels.push('STARRED');
              updatedEmails[key][id] = email;

              if (updatedEmails['STARRED']) {
                updatedEmails['STARRED'][id] = email;
              }
            }
          });
        });

        setMailsBigData(updatedEmails);
      }
    };
    const handleUnStarred = async (emailIds: string[], email: IEmail) => {
      if (!email.labels.includes('STARRED')) {
        return;
      }
      const success = await removeFromLabel(emailIds, 'STARRED');
      if (success) {
        const updatedEmails = { ...mailsBigData };
        Object.keys(updatedEmails).forEach((key) => {
          emailIds.forEach((id) => {
            const email = updatedEmails[key][id];
            if (email) {
              email.labels = email.labels.filter(
                (label) => label !== 'STARRED'
              );
              updatedEmails[key][id] = email;
            }
            if (updatedEmails['STARRED'] && updatedEmails['STARRED'][id]) {
              delete updatedEmails['STARRED'][id];
            }
          });
        });
        setMailsBigData(updatedEmails);
      }
    };
    const [attachmentFiles, setAttachmentFiles] = useState<FileObject[]>([]);
    const [showForward, setShowForward] = useState(false);
    const [showReplyAll, setShowReplyAll] = useState(false);
    const [showReply, setShowReply] = useState(true);
    const [replyState, setReplyState] = useState<
      'Reply' | 'Forward' | 'Reply All'
    >('Reply');
    const [subject, setSubject] = useState('Re: ' + mail.subject);

    return (
      <div className="flex h-full flex-col    ">
        {mail ? (
          <div className="flex flex-col  relative">
            <div className=" w-full  ">
              <div className="flex items-start p-4 py-0 pt-6 z-10 absolute w-full shadow-lg px-4  rounded-b-xl   border-border/40  bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <div className="flex items-start gap-4 text-sm w-full ">
                  <div className="flex items-center justify-center ">
                    {(() => {
                      const domain =
                        mail.email.split('@').pop() ||
                        mail.reply.split('@').pop() ||
                        mail.name.split('@').pop() ||
                        '';

                      const domainParts = domain.split('.');
                      const validDomain =
                        domainParts.length > 1
                          ? domainParts.slice(-2).join('.')
                          : null;
                      let src = `https://logo.clearbit.com/${validDomain}`;
                      if (mail.email == 'support@remail.com') {
                        src = DynamicLogo1.src;
                      }
                      return (
                        <Avatar className="border aspect- ">
                          <AvatarImage
                            height={20}
                            width={20}
                            src={src}
                            alt={mail.name}
                            className="rounded-full  "
                          />
                          <AvatarFallback className=" w-full">
                            {mail.name
                              .split(' ')
                              .map((chunk) => chunk[0])
                              .join('')
                              .replace(/[^A-Za-z]/g, '') // Remove all non-alphabet characters
                              .toUpperCase()
                              .slice(0, 2)}{' '}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })()}
                  </div>
                  <div className="grid   w-full ">
                    <span className="flex justify-between w-full">
                      <div className="font-semibold">{mail.name}</div>
                      {mail.date && (
                        <div className="ml-auto  pr-10 text-[0.65rem] text-muted-foreground">
                          {format(new Date(mail.date), 'PPpp')}
                        </div>
                      )}
                    </span>
                    <span className="flex justify-between">
                      <span className=" ">
                        <div className="line-clamp-1 text-xs">
                          {mail.subject}
                        </div>
                        <div className="line-clamp-1 text-[0.65rem]">
                          <span className="font-medium text-[0.65rem]">
                            Reply-To:
                          </span>{' '}
                          {mail.email}
                        </div>
                      </span>
                      <span>
                        <div className="flex items-center p-2 ">
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => {
                                    setUnMountReplyModule(false);
                                    setReplyModuleVisibility(true);
                                    setTimeout(() => {
                                      setTriggerGemini(true);
                                    }, 100);
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  disabled={!mail}
                                >
                                  <Image
                                    src={AiLogo}
                                    alt=""
                                    className="h-5 w-5"
                                  />
                                  <span className="sr-only"></span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Smart Reply
                              </TooltipContent>
                            </Tooltip>

                            {mail.labels.includes('STARRED') ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!mail}
                                    onClick={() =>
                                      handleUnStarred([mail.id], mail)
                                    }
                                  >
                                    <Star
                                      className="h-4 w-4"
                                      fill={'#FFD700'}
                                    />
                                    <span className="sr-only">
                                      Remove from Fav
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  Unfavourite
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!mail}
                                    onClick={() =>
                                      handleStarred([mail.id], mail)
                                    }
                                  >
                                    <Star className="h-4 w-4" />
                                    <span className="sr-only"></span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  Favourite
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={!mail}
                                  onClick={() => {
                                    handleArchive([mail.id], mail);
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                  <span className="sr-only">Archive</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Archive
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={!mail}
                                  onClick={() => handleDelete([mail.id])}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Move to trash</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Move to trash
                              </TooltipContent>
                            </Tooltip>

                            <Separator
                              orientation="vertical"
                              className="mx-1 h-6"
                            />
                          </div>
                          <div className="ml-auto flex items-center gap-[0.1rem]">
                            <span
                              onClick={() => {
                                setReplyModuleTempMail(mail);
                                setShowReply(true);
                                setShowReplyAll(false);
                                setShowForward(false);
                                setReplyState('Reply');
                                setUnMountReplyModule(false);
                                setReplyModuleVisibility(true);
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!mail}
                                  >
                                    <ReplyAll className="h-4 w-4" />
                                    <span className="sr-only">Reply</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  Reply
                                </TooltipContent>
                              </Tooltip>
                            </span>
                            <span
                              onClick={() => {
                                setSubject(
                                  'Fwd: ' + replyModuleTempMail.subject
                                );
                                setShowReply(false);
                                setShowReplyAll(false);
                                setShowForward(true);
                                setReplyState('Forward');
                                setUnMountReplyModule(false);
                                setReplyModuleVisibility(true);
                              }}
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={!mail}
                                  >
                                    <Forward className="h-4 w-4" />
                                    <span className="sr-only">Forward</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  Forward
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </div>
                        </div>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ScrollArea className="relative px-4">
              <ScrollAreaViewport className="h-[100vh]  bg-[#faf9f8]  dark:bg-background  ">
                <div className="h-28" />

                {!unMountreplyModule && (
                  <ReplyModule
                    floatingTempMail={floatingTempMail}
                    setFloatingTempMail={setFloatingTempMail}
                    attachmentFiles={attachmentFiles}
                    setAttachmentFiles={setAttachmentFiles}
                    setSubject={setSubject}
                    subject={subject}
                    showForward={showForward}
                    showReplyAll={showReplyAll}
                    showReply={showReply}
                    replyState={replyState}
                    setShowForward={setShowForward}
                    setShowReplyAll={setShowReplyAll}
                    setShowReply={setShowReply}
                    setReplyState={setReplyState}
                    setUnMountReplyModule={setUnMountReplyModule}
                    unMountreplyModule={unMountreplyModule}
                    replyModuleTempMail={replyModuleTempMail}
                    setReplyModuleTempMail={setReplyModuleTempMail}
                    suggestableMails={suggestableMails}
                    mailListRef={mailListRef}
                    widthRef={widthRef}
                    isMinimized={isMinimized}
                    setIsMinimized={setIsMinimized}
                    dndReplyRef={dndReplyRef}
                    setReplyModuleVisibility={setReplyModuleVisibility}
                    replyModuleVisibility={replyModuleVisibility}
                    mail={mail}
                    triggerGemini={triggerGemini}
                    setTriggerGemini={setTriggerGemini}
                  />
                )}

                <div className="h-28" />
                {mail && mail.attachments && mail.attachments.length > 0 && (
                  <div className="mb-7">
                    <AttachmentViewer
                      messageId={mail.id}
                      attachmentMetaData={mail.attachments}
                    />
                  </div>
                )}

                {mail.htmlBody !== '' ? (
                  <>
                    <div
                      ref={widthRef}
                      className="flex justify-center items-center min-h-24 border border-border bg-white dark:bg-background rounded-xl p-4"
                      dangerouslySetInnerHTML={{
                        __html: `<div style="transform: scale(0.85);">${sanitizedHTML}</div>`,
                      }}
                    />
                    <div className="h-28" />
                  </>
                ) : (
                  <>
                    <div className="text-wrap p-4 text-gray-900 dark:text-gray-100">
                      {mail.textBody}
                    </div>
                  </>
                )}
                <div className="h-28" />
                <ScrollBar />
                <ScrollBar orientation="horizontal" />
              </ScrollAreaViewport>
            </ScrollArea>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No message selected
          </div>
        )}
      </div>
    );
  }
);

MailDisplay.displayName = 'MailDisplay';

export default MailDisplay;
