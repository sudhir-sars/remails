// MailList.tsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { IThread, IEmail, IThreads } from './IMail';
// import CreateBucket from './dialogs/CreateBucket';
import { GraduationCap } from 'lucide-react';
import { SquareUserRound } from 'lucide-react';
import { MdOutlineFamilyRestroom } from 'react-icons/md';
import { PiBuildingOfficeLight } from 'react-icons/pi';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface IUserLabels {
  title: string;
  personal: boolean;
  labelColor: string;
  domain: boolean;
  personalEmails: string[];
  domainEmails: string[];
  category: string;
}

interface MailListProps {
  mails: IThreads;
  setMail: (mail: IEmail) => void;
  mail: IEmail;
  setFetchMore: (fetchMore: boolean) => void;
  isFetching: boolean;
  userLabels: IUserLabels[];
}

export function MailList({
  mails,
  setMail,
  isFetching,
  mail,
  setFetchMore,
  userLabels,
}: MailListProps) {
  const [addToBucketDialogOpen, setAddToBucketDialogOpen] = useState(false);

  return (
    <>
      <ScrollArea className="h-[82.5vh] w-full ">
        {/* {addToBucketDialogOpen && <CreateBucket />} */}
        <div className="flex flex-col gap-2 p-4 pt-0">
          {isFetching && (
            <div className="flex-col items-center space-y-10">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="space-y-2" key={index}>
                  <Skeleton className="h-2 w-[50%]" />
                  <Skeleton className="h-2 w-[65%]" />
                  <Skeleton className="h-2 w-[80%]" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          )}
          {!isFetching &&
            mails.map((thread: IThread) => {
              const email = thread.emails[0];

              if (!email) {
                // Skip rendering this thread if the first email is undefined
                return null;
              }

              return (
                <Dialog>
                  <ContextMenu key={email.id}>
                    <ContextMenuTrigger className="flex items-center justify-center rounded-md text-sm">
                      <button
                        className={cn(
                          'flex flex-col w-full items-start gap-2 rounded-lg p-3 pb-5 text-left text-sm transition-all hover:bg-accent',
                          mail.id === email.id && 'bg-muted'
                        )}
                        onClick={() => setMail(email)}
                      >
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex items-center">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold">{email.name}</div>
                              {!email.read && (
                                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div
                              className={cn(
                                'ml-auto text-xs',
                                mail.id === email.id
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {formatDistanceToNow(new Date(email.date), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row w-full">
                          <div className="flex-col w-full">
                            <div className="text-xs font-medium">
                              {email.subject}
                            </div>
                            <div className="line-clamp-3 text-xs text-muted-foreground mb-3">
                              <span>{email.snippet.substring(0, 400)}</span>
                            </div>
                            {email.labels.length ? (
                              <div className="flex items-center gap-2">
                                {email.labels
                                  .filter(
                                    (label) =>
                                      !['CATEGORY_UPDATES'].includes(label)
                                  )
                                  .map((label) => (
                                    <Badge
                                      key={label}
                                      variant={getBadgeVariantFromLabel(label)}
                                    >
                                      {label}
                                    </Badge>
                                  ))}
                              </div>
                            ) : null}
                          </div>
                          {thread.emails.length > 1 && (
                            <div className="flex items-center flex-col p-2 pb-0 pt-1 ">
                              <span className="flex justify-center text-xs items-center dark:bg-muted bg-[#f6e1fe] h-6 w-6 dark:text-white text-[#c666ec] font-semibold rounded-full px-[0.3rem]">
                                <span>{thread.emails.length}</span>
                              </span>
                              <span className="h-5 w-[0.2rem] rounded-full rounded-t-none bg-[#c666ec]" />
                              <span className="h-[0.2rem] w-[0.2rem] my-[0.15rem] rounded-full bg-[#c666ec]" />
                              <span className="h-[0.2rem] w-[0.2rem] mb-[0.15rem] rounded-full bg-[#c666ec]" />
                              <span className="h-[0.2rem] w-[0.2rem] rounded-full bg-[#c666ec]" />
                            </div>
                          )}
                        </div>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-64">
                      <ContextMenuItem inset>
                        View in Full Screen
                        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset>
                        Reply
                        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset>
                        Forward
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset>
                        Delete
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem inset>
                        Archive
                        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger
                          inset
                          disabled={userLabels.length < 1}
                          className={`${
                            userLabels.length < 1
                              ? 'text-muted-foreground '
                              : ''
                          }`}
                        >
                          <span>Add to Bucket</span>
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          {userLabels.map((label, index) => (
                            <ContextMenuItem key={index} className="flex">
                              {label.category === 'Work' && (
                                <PiBuildingOfficeLight className=" mr-1 h-4 w-4" />
                              )}
                              {label.category === 'College' && (
                                <GraduationCap className="mr-1 h-4 w-4" />
                              )}
                              {label.category === 'Family' && (
                                <MdOutlineFamilyRestroom className=" mr-1 h-4 w-4" />
                              )}
                              {label.category === 'Personal' && (
                                <SquareUserRound className=" mr-1 h-4 w-4" />
                              )}
                              {/* <span
                                className={`${label.labelColor} w-[0.5rem] h-7 rounded-xl`}
                              ></span> */}
                              <span className="ml-2">{label.title}</span>
                            </ContextMenuItem>
                          ))}
                          {/* <ContextMenuSeparator />

                          <ContextMenuItem>Create Bucket</ContextMenuItem> */}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger inset>
                          More Tools
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <ContextMenuItem>
                            Save Page As...
                            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem>Create Shortcut...</ContextMenuItem>
                          <ContextMenuItem>Name Window...</ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem>Developer Tools</ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSeparator />
                      <ContextMenuLabel inset>Priority</ContextMenuLabel>
                      <TooltipProvider>
                        <div className="flex pl-8 space-x-2 py-2">
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                              <Button
                                size="label"
                                className="rounded-full bg-red-500 shadow-lg shadow-red-500 hover:bg-red-500"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              className="bg-red-500"
                            >
                              <p>Urgent</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                              <Button
                                size="label"
                                className="rounded-full bg-orange-500 shadow-lg shadow-orange-500 hover:bg-orange-500"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              className="bg-orange-500"
                            >
                              <p>High</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                              <Button
                                size="label"
                                className="rounded-full bg-amber-400 shadow-lg shadow-amber-400 hover:bg-amber-400"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              className="bg-yellow-500"
                            >
                              <p>Medium</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                              <Button
                                size="label"
                                className="rounded-full bg-green-500 shadow-lg shadow-green-500 hover:bg-green-500"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              className="bg-green-500"
                              side="bottom"
                            >
                              <p>Low</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={250}>
                            <TooltipTrigger>
                              <Button
                                size="label"
                                className="rounded-full bg-purple-500 shadow-lg shadow-purple-500 hover:bg-purple-500"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              className="bg-purple-500"
                              side="bottom"
                            >
                              <p>Personal</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </ContextMenuContent>
                  </ContextMenu>
                </Dialog>
              );
            })}
        </div>
      </ScrollArea>
    </>
  );
}

function getBadgeVariantFromLabel(label: string) {
  if (['work'].includes(label.toLowerCase())) {
    return 'default';
  }

  if (['personal'].includes(label.toLowerCase())) {
    return 'outline';
  }

  return 'secondary';
}

export default MailList;
