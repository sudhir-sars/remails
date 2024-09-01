'use client';
import { format } from 'date-fns';
import { useRef, useEffect, useState } from 'react';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { deleteMessages, archiveMessages } from '@/utils/mail/operation';
import AiLogo from '@/public/AiLogo.png';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IEmail } from './IMail';
import DOMPurify from 'dompurify';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import AttachmentViewer from './AttachmentViewer';
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ScaledApp from '@/components/Scaler';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Archive, Forward, ReplyAll, Star, Trash2 } from 'lucide-react';
import { IMailsWithFilter } from './IMail';
interface IViewInFullMode {
  mail: IEmail;
  viewInFullModeRef: React.RefObject<HTMLDivElement>;
  mailsBigData: IMailsWithFilter;
  setMailsBigData: (mailsBigData: IMailsWithFilter) => void;
}
import { addToLabel, removeFromLabel } from '@/utils/mail/operation';

export default function ViewInFullMode({
  mailsBigData,
  setMailsBigData,
  mail,
  viewInFullModeRef,
}: IViewInFullMode) {
  const [isOpen, setIsOpen] = useState(false);
  const clickTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clickTriggerRef.current) {
      clickTriggerRef.current.click();
    }
  }, []);
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
            email.labels = email.labels.filter((label) => label !== 'STARRED');
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
  return (
    <>
      <TooltipProvider>
        <div className="w-screen">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="hidden" ref={viewInFullModeRef}>
                View In Full Mode
              </div>
            </DialogTrigger>
            <DialogContent className=" w-[75vw] h-[95vh] p-0  border">
              <div className="flex flex-col  relative">
                <div className=" w-full  ">
                  <div className="flex items-start p-4 py-0 pt-4 z-10 absolute w-full shadow-lg px-4 rounded-xl border-border/40 bg-background/95">
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
                          return (
                            <Avatar className="border ">
                              <AvatarImage
                                height={20}
                                width={20}
                                src={`https://logo.clearbit.com/${validDomain}`}
                                alt={mail.name}
                                className="rounded-full  "
                              />
                              <AvatarFallback className=" w-full">
                                {mail.name
                                  .split(' ')
                                  .map((chunk) => chunk[0])
                                  .join('')}
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
                          <DialogClose asChild>
                            <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                              <Cross2Icon className="h-4 w-4 cursor-pointer" />
                              <span className="sr-only">Close</span>
                            </div>
                          </DialogClose>
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
                                <Tooltip defaultOpen={false}>
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
                                      <span className="sr-only">Favourite</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    defaultChecked={false}
                                    side="bottom"
                                  >
                                    Favourite
                                  </TooltipContent>
                                </Tooltip>
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
                                      <span className="sr-only">
                                        Move to trash
                                      </span>
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
                              <div className="ml-auto flex items-center gap-[0.1rem]"></div>
                            </div>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div ref={clickTriggerRef} className="hidden" />
                  {/* <ScrollArea className="w-[74.8vw] p-4  h-[90vh] whitespace-nowrap rounded-md "> */}
                  <ScrollArea className="w-full h-[90vh] p-4 rounded-md">
                    <div className="bg-transparent h-20"></div>
                    <div className="h-28" />

                    <div className="flex items-start px-12">
                      {mail &&
                        mail.attachments &&
                        mail.attachments.length > 0 && (
                          <div className="mb-7">
                            <AttachmentViewer
                              messageId={mail.id}
                              attachmentMetaData={mail.attachments}
                            />
                          </div>
                        )}
                    </div>
                    {/* <div
                      style={{
                        transform: 'scale(0.9)',
                        width: '70vw',
                        margin: '0 auto', // This centers the content horizontally
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(mail.htmlBody),
                      }}
                    /> */}
                    <div className="flex justify-center">
                      <div
                        className="w-full max-w-[70vw]"
                        style={{
                          transform: 'scale(0.9)',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(mail.htmlBody),
                        }}
                      />
                    </div>
                    <ScrollBar />
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
                {/* <ScrollArea className=" ">
                <div>
                  <div className="bg-transparent h-14"></div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(mail.htmlBody),
                    }}
                  />
                </div>

                <ScrollBar />
                <ScrollBar orientation="horizontal" />
              </ScrollArea> */}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </>
  );
}
