import React, { useRef, SetStateAction, Dispatch, useCallback } from 'react';
import {
  addToLabel,
  removeFromLabel,
  markAsRead,
  archiveMessages,
  deleteMessages,
} from '@/utils/mail/operation';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from '@/components/ui/scroll-area';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ReadReceipts from './ReadReceipts';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { IEmail, IEmailsObject, IMailsWithFilter } from './IMail';

import { labelIconsMapping } from '@/lib/labelIconsMapping';

import { IUserLabels } from '@/utils/mail/types';

import { IFetchDataHistory } from '@/utils/mail/types';

interface MailListProps {
  triggerForcedPagination: boolean;
  setTriggerForcedPagination: Dispatch<SetStateAction<boolean>>;
  setFetchDataHistory: Dispatch<SetStateAction<IFetchDataHistory>>;
  mailListLabel: string;
  fetchDataHistory: IFetchDataHistory;
  mailsBigData: IMailsWithFilter;
  setMailsBigData: (mailsBigData: IMailsWithFilter) => void;
  setShowAddBuckerDialog: (showAddBuckerDialog: boolean) => void;
  showAddBuckerDialog: boolean;
  viewInFullModeRef: React.RefObject<HTMLDivElement>;
  mails: IEmailsObject;
  setMail: Dispatch<SetStateAction<IEmail>>;
  mail: IEmail;
  isFetching: boolean;
  userLabels: IUserLabels[];
  checkForNewMail: boolean;
  setCheckForNewMail: (checkForNewMail: boolean) => void;
  checkForOldMail: boolean;
  setCheckForOldMail: (checkForOldMail: boolean) => void;
  setReplyModuleVisibility: (replyModuleVisibility: boolean) => void;
  replyModuleVisibility: boolean;
  setUnMountReplyModule: (unMountReplyModule: boolean) => void;
  criticalLabelsIdMapping: {
    [key: string]: string;
  };
  unMountreplyModule: boolean;
  mailListRef: React.RefObject<HTMLDivElement>;
  setReplyModuleTempMail: (replyModuleTempMail: IEmail) => void;
  replyModuleTempMail: IEmail;
}
import { CheckCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Button } from '@/components/ui/button';

export default function MailList({
  triggerForcedPagination,
  setTriggerForcedPagination,
  setFetchDataHistory,
  unMountreplyModule,
  setUnMountReplyModule,
  criticalLabelsIdMapping,
  mailListLabel,
  setReplyModuleTempMail,
  replyModuleTempMail,
  fetchDataHistory,
  mailsBigData,
  setMailsBigData,
  setShowAddBuckerDialog,
  showAddBuckerDialog,
  setReplyModuleVisibility,
  replyModuleVisibility,
  mails,
  setMail,
  isFetching,
  mail,
  userLabels,
  viewInFullModeRef,
  checkForNewMail,
  setCheckForNewMail,
  checkForOldMail,
  setCheckForOldMail,
  mailListRef,
}: MailListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleReplySelection = useCallback(
    (email: IEmail) => {
      if (unMountreplyModule === false) {
        setUnMountReplyModule(true);
      }
      setReplyModuleTempMail(email);
      setUnMountReplyModule(false);
      setReplyModuleVisibility(true);
    },
    [unMountreplyModule]
  );

  const handleMarkAsRead = async (emailIds: string[], email: IEmail) => {
    if (!email.labels.includes('UNREAD')) {
      return;
    }
    const success = await markAsRead(emailIds);
    if (success.success) {
      const updatedEmails = { ...mailsBigData };
      Object.keys(updatedEmails).forEach((key) => {
        emailIds.forEach((id) => {
          const email = updatedEmails[key][id];
          if (email) {
            email.read = true;
          }
        });
      });
      setMailsBigData(updatedEmails);
    }
  };

  const handleDelete = async (emailIds: string[]) => {
    const success = await deleteMessages(emailIds);
    if (success.success) {
      let tempFetchDataHistory = fetchDataHistory;
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
    let tempFetchDataHistory = fetchDataHistory;
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

  const handleAddToLabel = async (
    emailIds: string[],
    newLabelId: string,
    newLabelName: string,
    email: IEmail
  ) => {
    if (email.labels.includes(newLabelName)) {
      return;
    }

    const labelsToRemove = email.labels.filter((labelId) =>
      Object.keys(criticalLabelsIdMapping).includes(labelId)
    );

    const removeLabelPromises = labelsToRemove.map((labelId) =>
      removeFromLabel(emailIds, labelId)
    );

    try {
      await Promise.all(removeLabelPromises);
    } catch (error) {
      console.error('Error removing labels:', error);
      return; // Exit if removal fails
    }

    const addSuccess = await addToLabel(emailIds, newLabelId);
    if (addSuccess) {
      const updatedEmails = { ...mailsBigData };
      Object.keys(updatedEmails).forEach((key) => {
        emailIds.forEach((id) => {
          const email = updatedEmails[key][id];
          if (email) {
            email.labels = email.labels.filter(
              (label) => !Object.keys(criticalLabelsIdMapping).includes(label)
            );
            email.labels.push(newLabelId);
          }
        });
      });
      setMailsBigData(updatedEmails);
    } else {
      console.error('Failed to add the new label');
    }
  };
  const truncateFilename = (filename: string, maxLength: number): string => {
    const extension = filename.split('.').pop() || '';
    const nameWithoutExtension = filename.substring(
      0,
      filename.lastIndexOf('.')
    );
    const truncatedName =
      nameWithoutExtension.length > maxLength
        ? nameWithoutExtension.substring(0, maxLength) + '...'
        : nameWithoutExtension;
    return `${truncatedName}.${extension}`;
  };

  const getBackgroundColor = (mimeType: string): string => {
    if (mimeType.includes('word') || mimeType.includes('document'))
      return '#E7F3FF'; // Light blue for Word docs
    if (mimeType.includes('pdf')) return '#FFE2E2'; // Light red for PDFs
    if (mimeType.includes('image')) return '#FFF0E0'; // Light orange for images
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return '#E2FFE2'; // Light green for spreadsheets
    return '#F0F0F0'; // Default light gray
  };

  return (
    <>
      <div ref={mailListRef} className="bg-[#faf9f8] dark:bg-background z-50">
        <ScrollArea>
          <ScrollAreaViewport
            ref={scrollAreaRef}
            className="h-[99.5vh] w-full bg-[#faf9f8] shadow-inner dark:bg-background overflow-y-auto"
          >
            <div className="flex flex-col gap-2 p-2 pt-0">
              {isFetching && (
                <div className="flex-col items-center space-y-10 mt-16 px-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div className="space-y-2" key={index}>
                      <div className="flex items-center space-x-1 w-full">
                        <div>
                          <Skeleton className="h-7 w-7 rounded-full" />
                        </div>
                        <div className="w-full space-y-1">
                          <Skeleton className="h-[0.5rem] w-[30%] rounded-l-none" />
                          <Skeleton className="h-[0.5rem] w-[40%] rounded-l-none" />
                        </div>
                      </div>
                      <Skeleton className="h-[0.4rem] w-[65%]" />
                      <Skeleton className="h-[0.4rem] w-[80%]" />
                      <Skeleton className="h-[0.4rem] w-full" />
                      <Skeleton className="h-[0.4rem] w-full" />
                    </div>
                  ))}
                </div>
              )}

              {!isFetching &&
                mails &&
                Object.values(mails).map((email, index) => {
                  if (!email) {
                    return null;
                  }

                  return (
                    <ContextMenu key={email.id}>
                      <ContextMenuTrigger className="flex items-center justify-center rounded-md text-sm">
                        <button
                          className={cn(
                            'flex flex-col mx-[0.35rem] my-1 pt-[0.35rem] bg-[#ffffff] hover:shadow-all-sides dark:hover:bg-muted dark:bg-background border-t-0 border-l-0 border-r-0 w-full items-start gap-1 rounded-xl p-5 pl-0 text-left text-sm transition-all',
                            mail.id === email.id
                              ? 'shadow-all-sides dark:bg-muted hover:bg-white'
                              : 'shadow-sm',
                            index === 0 && !checkForNewMail && 'mt-16'
                          )}
                          onClick={() => {
                            setReplyModuleTempMail(email);
                            handleMarkAsRead([email.id], email);
                            setMail(email);
                            console.log(email);
                          }}
                        >
                          <div className="flex space-x-2 w-full">
                            <span
                              className={`${
                                mail.id == email.id
                                  ? 'bg-blue-700'
                                  : 'bg-transparent'
                              } w-[4px] min-h-[1rem] flex-shrink-0 rounded-full rounded-l-none inline-block`}
                            >
                              &nbsp;
                            </span>
                            <div className="pl-1 w-full">
                              <div className="flex w-full flex-col">
                                <div className="flex items-center">
                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="font-semibold text-[0.7rem]">
                                      <div className="flex space-x-1 justify-center items-center">
                                        <div className="flex items-center justify-center">
                                          {(() => {
                                            const domain =
                                              email.email.split('@').pop() ||
                                              email.reply.split('@').pop() ||
                                              email.name.split('@').pop() ||
                                              '';

                                            const domainParts =
                                              domain.split('.');
                                            const validDomain =
                                              domainParts.length > 1
                                                ? domainParts
                                                    .slice(-2)
                                                    .join('.')
                                                : null;
                                            return (
                                              <Avatar className="">
                                                <AvatarImage
                                                  loading="lazy"
                                                  src={`https://logo.clearbit.com/${validDomain}`}
                                                  alt={email.name}
                                                  height={23}
                                                  width={23}
                                                  className="rounded-full"
                                                />
                                                <AvatarFallback className="w-full">
                                                  <div className="rounded-full flex text-xs items-center justify-center h-8 w-8 p-1 bg-muted ">
                                                    {email.name
                                                      .split(' ')
                                                      .map((chunk) => chunk[0])
                                                      .join('')
                                                      .replace(/[^A-Za-z]/g, '') // Remove all non-alphabet characters
                                                      .toUpperCase()
                                                      .slice(0, 2)}{' '}
                                                  </div>
                                                </AvatarFallback>
                                              </Avatar>
                                            );
                                          })()}
                                        </div>
                                        <div className="pl-2">{email.name}</div>
                                      </div>
                                    </div>
                                    {!email.read && (
                                      <div className="flex h-4 dark:font-bold text-[0.6rem] px-[0.4rem] text-blue-700 rounded-md bg-[#d9e5fe]">
                                        New
                                      </div>
                                    )}
                                    {email.labels
                                      .filter(
                                        (label) =>
                                          criticalLabelsIdMapping &&
                                          Object.keys(
                                            criticalLabelsIdMapping
                                          ).includes(label)
                                      )
                                      .map((label) => {
                                        const labelName =
                                          criticalLabelsIdMapping[label];
                                        return (
                                          <div
                                            key={label}
                                            className={`flex h-4 dark:font-bold text-[0.6rem] px-[0.4rem]
                                              ${labelName === 'Critical' ? 'text-red-700 rounded-md bg-red-200' : ''}
                                              ${labelName === 'Urgent' ? 'text-orange-600 rounded-md bg-orange-200' : ''}
                                              ${labelName === 'Routinal' ? 'text-green-700 rounded-md bg-green-200' : ''}
                                              ${labelName === 'Hold' ? 'text-indigo-700 rounded-md bg-indigo-200' : ''}
                                            `}
                                          >
                                            {labelName}
                                          </div>
                                        );
                                      })}
                                    <ReadReceipts
                                      email={email}
                                      mailListLabel={mailListLabel}
                                    />
                                    {email.labels.length ? (
                                      <div className="flex items-center gap-1">
                                        {email.labels
                                          .filter((label) =>
                                            Object.keys(
                                              labelIconsMapping
                                            ).includes(label)
                                          )
                                          .map((label) => {
                                            const Icon =
                                              labelIconsMapping[label];
                                            return (
                                              <div
                                                key={label}
                                                className={`flex items-center px-[0.1rem] bg-transparent`}
                                              >
                                                {Icon && (
                                                  <Icon
                                                    className={`
                                                      ${label === 'SENT' ? 'text-green-500' : ''}
                                                      ${label === 'IMPORTANT' ? 'text-blue-700' : ''}
                                                      ${label === 'STARRED' ? 'text-[#FFD700]' : ''}
                                                      ${label === 'CATEGORY_SOCIAL' ? 'text-blue-500' : ''}
                                                      ${label === 'CATEGORY_PROMOTIONS' ? 'text-red-500' : ''}
                                                      ${label === 'CATEGORY_PERSONAL' ? 'text-red-500' : ''}
                                                      ${label === 'CATEGORY_UPDATES' ? 'text-blue-500 rotate-180' : ''}
                                                      h-4 w-4`}
                                                  />
                                                )}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    ) : null}
                                  </div>
                                  <div
                                    className={cn(
                                      'ml-auto text-[0.65rem]',
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
                              <div className="flex w-full mt-1">
                                <div className="flex-col w-full">
                                  <div className="text-[0.79rem] font-medium">
                                    {email.subject}
                                  </div>
                                  <div className="line-clamp-2 text-xs text-muted-foreground my-2">
                                    <div className="text-[0.75rem]">
                                      {email.snippet}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap p-1 m-1 rounded-xl text-xs dark:text-black">
                                    {email.attachments.map(
                                      (attachment, index) => (
                                        <div
                                          key={index}
                                          className="p-1 m-1 rounded-lg px-2 "
                                          style={{
                                            backgroundColor: getBackgroundColor(
                                              attachment.mimeType || ''
                                            ),
                                          }}
                                        >
                                          {truncateFilename(
                                            attachment.filename || '',
                                            15
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56">
                        <ContextMenuItem
                          onClick={() => viewInFullModeRef.current?.click()}
                          inset
                        >
                          View in Full Screen
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleReplySelection(email)}
                          inset
                        >
                          Reply
                        </ContextMenuItem>
                        <ContextMenuItem inset>Forward</ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleDelete([email.id])}
                          inset
                        >
                          Delete
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleArchive([email.id], email)}
                          inset
                        >
                          Archive
                        </ContextMenuItem>
                        {email.labels.includes('STARRED') && (
                          <ContextMenuItem
                            onClick={() => handleUnStarred([email.id], email)}
                            inset
                          >
                            Remove From Starred
                          </ContextMenuItem>
                        )}
                        {!email.labels.includes('STARRED') && (
                          <ContextMenuItem
                            onClick={() => handleStarred([email.id], email)}
                            inset
                          >
                            Add to Starred
                          </ContextMenuItem>
                        )}
                        <ContextMenuSeparator />
                        <ContextMenuItem className="hover:bg-transparent bg-transparent">
                          <TooltipProvider>
                            <div className="flex pl-8 space-x-2 py-2">
                              <Tooltip delayDuration={250}>
                                <TooltipTrigger>
                                  <div
                                    onClick={() =>
                                      handleAddToLabel(
                                        [email.id],
                                        fetchDataHistory['Critical'].labelId!,
                                        'Critical',
                                        email
                                      )
                                    }
                                    className="rounded-full border border-red-500"
                                  >
                                    <div
                                      className="m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-red-500 rounded-full hover:text-primary dark:text-muted-foreground dark:hover:bg-muted"
                                      style={{
                                        boxShadow:
                                          '0 4px 4px rgba(255, 0, 0, 0.5)',
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-red-500"
                                >
                                  <p>Critical</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip delayDuration={250}>
                                <TooltipTrigger>
                                  <div
                                    onClick={() =>
                                      handleAddToLabel(
                                        [email.id],
                                        fetchDataHistory['Urgent'].labelId!,
                                        'Urgent',
                                        email
                                      )
                                    }
                                    className="rounded-full border border-orange-400"
                                  >
                                    <div
                                      className="m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-orange-400 rounded-full hover:text-primary dark:text-muted-foreground dark:hover:bg-muted"
                                      style={{
                                        boxShadow:
                                          '0 4px 4px rgba(255, 165, 0, 0.5)',
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-orange-500"
                                >
                                  <p>Urgent</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip delayDuration={250}>
                                <TooltipTrigger>
                                  <div
                                    onClick={() =>
                                      handleAddToLabel(
                                        [email.id],
                                        fetchDataHistory['Routinal'].labelId!,
                                        'Routinal',
                                        email
                                      )
                                    }
                                    className="rounded-full border border-green-400"
                                  >
                                    <div
                                      className="m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-green-400 rounded-full hover:text-primary dark:text-muted-foreground dark:hover:bg-muted"
                                      style={{
                                        boxShadow:
                                          '0 4px 4px rgba(0, 255, 0, 0.5)',
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-green-400"
                                >
                                  <p>Routinal</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip delayDuration={250}>
                                <TooltipTrigger>
                                  <div
                                    onClick={() =>
                                      handleAddToLabel(
                                        [email.id],
                                        fetchDataHistory['Hold'].labelId!,
                                        'Hold',
                                        email
                                      )
                                    }
                                    className="rounded-full border border-indigo-400"
                                  >
                                    <div
                                      className="m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-indigo-400 rounded-full hover:text-primary dark:text-muted-foreground dark:hover:bg-muted"
                                      style={{
                                        boxShadow:
                                          '0 4px 4px rgba(0, 0, 225, 0.2)',
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  className="bg-indigo-400"
                                  side="top"
                                >
                                  <p>Hold</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
            </div>
          </ScrollAreaViewport>
        </ScrollArea>
      </div>
    </>
  );
}
