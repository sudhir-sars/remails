'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { SquarePlus } from 'lucide-react';

import { markAsRead } from '@/utils/mail/operation';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface NavLabelCount {
  name: string;
  count: number;
}
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { IconType } from 'react-icons/lib';
type NavLabelCounts = NavLabelCount[];
import { Building2 } from 'lucide-react';
import { UserRoundPlus } from 'lucide-react';
import { IAddress, IMailsWithFilter } from './IMail';
import { IFetchDataHistory } from '@/utils/mail/types';
interface NavProps {
  suggestableMails: IAddress[];
  showDialog: boolean;
  setShowDialog: (showDialog: boolean) => void;
  setFetchDataHistory: (fetchDataHistory: IFetchDataHistory) => void;
  fetchDataHistory: IFetchDataHistory;
  mailsWithFilter: IMailsWithFilter;
  setMailsWithFilter: (mailsWithFilter: IMailsWithFilter) => void;
  navLabelCount: NavLabelCounts;
  isCollapsed: boolean;
  links?: {
    title: string;
    label: string;
    icon: LucideIcon | IconType;
    variant: 'default' | 'ghost';
  }[];
  userLabels?: IUserLabels[];
  setSelectedNavItem: (item: string) => void;
  setUserLabels: React.Dispatch<React.SetStateAction<IUserLabels[]>>;
  mailListLabel: string;
  selectedNavItem: string;
  handleMailListChange: (
    labelName: string,
    labelId: string,
    userLabelFlag: boolean,
    emailAddress?: string
  ) => void;
}
import { GalleryVerticalEnd } from 'lucide-react';
import Suggester from '@/components/mail/components/search/suggester';
import { Pencil } from 'lucide-react';
import { Delete } from 'lucide-react';
import { MailCheck } from 'lucide-react';
import { IUserLabels } from '@/utils/mail/types';
import { toast } from 'sonner';
import { Tags } from 'lucide-react';

import { useRef } from 'react';

import {
  userLabelDelete,
  userLabelSave,
  userLabelEdit,
} from '@/utils/mail/userLabelOperations/operations';
import DomainAvatars from './DomainAvatars';

export function Nav({
  suggestableMails,
  setFetchDataHistory,
  fetchDataHistory,
  navLabelCount,
  handleMailListChange,
  links,
  mailsWithFilter,
  userLabels,
  isCollapsed,
  setSelectedNavItem,
  selectedNavItem,
  showDialog,
  setShowDialog,
  setMailsWithFilter,
  mailListLabel,
  setUserLabels,
}: NavProps) {
  const [bucketTitle, setBucketTitle] = useState('');
  const [bucketLabelId, setBucketLabelId] = useState('');
  const [bucketPersonalEmails, setBucketPersonalEmails] = useState<string[]>(
    []
  );

  const [editDialogOpenClose, setEditDialogOpenClose] = useState(false);
  const [bucketDomainEmails, setBucketDomainEmails] = useState<string[]>([]);

  const [bucketPersonalEmailInputValue, setBucketPersonalEmailInputValue] =
    useState<string>('');
  const [bucketDomainEmailInputValue, setBucketDomainEmailInputValue] =
    useState<string>('');

  const handleClearValues = () => {
    setBucketDomainEmailInputValue('');
    setBucketPersonalEmailInputValue('');
    setBucketDomainEmails([]);
    setBucketPersonalEmails([]);
    setBucketIcon('');
    setBucketIconState('icon');
    setBucketTitle('');
  };
  const handleSetEditValues = (label: IUserLabels) => {
    setBucketLabelId(label.labelId);
    setSelectedUserLabelData(label);
    setEditUserLabelItem(label);
    setBucketDomainEmailInputValue('');
    setBucketPersonalEmailInputValue('');
    setBucketDomainEmails(label.domainEmails);
    setBucketPersonalEmails(label.personalEmails);
    setBucketIcon(label.icon);
    setBucketIconState(label.icon.length > 1 ? 'icon' : 'fallback');
    setBucketTitle(label.title);
    if (editRef && editRef.current) {
      editRef.current.click();
    }
  };

  const [isClicked, setIsClicked] = useState(false);

  const editRef = useRef<HTMLDivElement>(null);
  const addBucketRef = useRef<HTMLDivElement>(null);

  const [editUserLabelItem, setEditUserLabelItem] =
    useState<IUserLabels | null>(null);

  const handleClick = (label: IUserLabels) => {
    setSelectedUserLabelData(label);
    setEditUserLabelItem(label);
    setBucketTitle(label.title);

    if (editRef && editRef.current) {
      editRef.current.click();
    }
  };
  const handleSubmit = async () => {
    try {
      const isDuplicate = userLabels?.some(
        (label) => label.title === bucketTitle
      );

      if (!bucketTitle) {
        toast.error('Please enter a bucket title.', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }

      if (bucketDomainEmails.length + bucketPersonalEmails.length < 1) {
        toast.error('Please add at least one email address.', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }

      if (!bucketIcon) {
        toast.error('Please select a bucket icon.', {
          duration: 3000,
          position: 'top-right',
        });
        return;
      }

      if (isDuplicate) {
        toast.error(`The label "${bucketTitle}" already exists.`, {
          description: 'Please choose a different title.',
          duration: 5000,
          position: 'top-right',
        });
        return;
      }

      handleClearValues();

      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID is not found in local storage');

      const labelData: IUserLabels = {
        labelId: Date.now().toString(),
        title: bucketTitle,
        icon: bucketIcon,
        personalEmails: bucketPersonalEmails,
        domainEmails: bucketDomainEmails,
        fallback: bucketIconState === 'fallback',
      };

      setUserLabels((prev) => [...prev, labelData]);

      const updatedFetchDataHistory = { ...fetchDataHistory };
      updatedFetchDataHistory[bucketTitle] = {
        labelId: bucketTitle,
        pageToken: undefined,
        initialFetched: 'notFetched',
        lastFetchedPage: 0,
        totalEmails: 999999999,
      };
      setFetchDataHistory(updatedFetchDataHistory);

      const response = await fetch(`/api/userData/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, label: labelData }),
      });

      if (!response.ok) throw new Error('Failed to add label');

      const data = await response.json();

      toast.success('Label added successfully!', {
        duration: 3000,
        position: 'top-right',
      });
      setShowDialog(false);
    } catch (err) {
      console.error('Error adding label:', err);
      toast.error('Failed to add label. Please try again later.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUserLabelDelete = async (labelId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID is not found in local storage');

      const response = await fetch(`/api/userData/labels`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, labelId }),
      });

      if (!response.ok) throw new Error('Failed to delete label');

      const data = await response.json();

      setUserLabels((prevLabels) =>
        prevLabels.filter((storedLabel) => storedLabel.labelId !== labelId)
      );
      setEditDialogOpenClose(false);

      toast.success('Label deleted successfully!', {
        duration: 3000,
        position: 'top-right',
      });
    } catch (err) {
      console.error('Error deleting label:', err);
      toast.error('Failed to delete label. Please try again later.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleUserLabelEdit = async () => {
    try {
      const labelData: IUserLabels = {
        labelId: bucketLabelId,
        title: bucketTitle,
        icon: bucketIcon,
        personalEmails: bucketPersonalEmails,
        domainEmails: bucketDomainEmails,
        fallback: bucketIconState === 'fallback',
      };

      setUserLabels((prevLabels) => {
        const filteredLabels = prevLabels.filter(
          (storedLabel) => storedLabel.labelId !== bucketLabelId
        );
        return [...filteredLabels, labelData];
      });

      const updatedFetchDataHistory = { ...fetchDataHistory };
      updatedFetchDataHistory[bucketTitle] = {
        labelId: bucketTitle,
        pageToken: undefined,
        initialFetched: 'notFetched',
        lastFetchedPage: 0,
        totalEmails: 999999999,
      };
      setFetchDataHistory(updatedFetchDataHistory);

      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User ID is not found in local storage');

      const response = await fetch(`/api/userData/labels`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, label: labelData }),
      });

      if (!response.ok) throw new Error('Failed to update label');

      const data = await response.json();

      toast.success('Label Updated successfully!', {
        duration: 3000,
        position: 'top-right',
      });
      setEditDialogOpenClose(false);
    } catch (err) {
      console.error('Error editing label:', err);
      toast.error('Failed to edit label. Please try again later.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const [selectedUserLabelData, setSelectedUserLabelData] =
    useState<IUserLabels>();

  const [bucketIcon, setBucketIcon] = useState<string>('');
  const [bucketIconState, setBucketIconState] = useState<'icon' | 'fallback'>(
    'icon'
  );

  // Handle avatar click
  const handleAvatarClick = (
    src: string,

    isImage: boolean
  ) => {
    setBucketIcon(src);
    if (isImage) {
      setBucketIconState('icon');
    } else {
      setBucketIconState('fallback');
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className={`group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 ${!isCollapsed ? 'mt-2' : ''}`}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links &&
          links.map((link, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={400}>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      key={index}
                      variant={'ghost'}
                      className={`flex  p-3 justify-center items-center hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  text-left text-sm transition-all '
                ${
                  mailListLabel == link.label &&
                  'bg-border  text-primary     dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                      onClick={() => {
                        handleMailListChange(link.label, link.label, false);
                      }}
                    >
                      {/* <span className="sr-only">{link.title}</span> */}
                      <link.icon
                        className={` h-4 w-4
                        ${mailListLabel === link.label ? 'text-blue-600' : ''}
                        ${mailListLabel === link.label && link.title === 'Spam' ? 'text-red-600 ' : ''}
                        ${mailListLabel === link.label && link.title === 'Trash' ? 'text-red-600 ' : ''}
                        ${mailListLabel === link.label && link.title === 'Sent' ? 'text-green-600 ' : ''}
                      `}
                      />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  <span className="ml-auto text-muted-foreground dark:text-white text-black">
                    {navLabelCount &&
                      (() => {
                        const matchingItem = navLabelCount.find(
                          (item) => item.name === link.label
                        );
                        return matchingItem ? matchingItem.count : '';
                      })()}
                  </span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={index}
                size={'sideNavBar'}
                variant={'ghost'}
                className={`flex text-xs  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 py-0 text-left  transition-all '
                ${
                  mailListLabel == link.label &&
                  'bg-border  text-primary  hover:text-preim   dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                onClick={() => {
                  handleMailListChange(link.label, link.label, false);
                }}
              >
                <link.icon
                  className={`mr-1 h-[1rem] w-[1rem] 
                  ${mailListLabel === link.label ? 'text-blue-600' : ''}
                  ${mailListLabel === link.label && link.title === 'Spam' ? 'text-red-600 ' : ''}
                  ${mailListLabel === link.label && link.title === 'Trash' ? 'text-red-600 ' : ''}
                   ${mailListLabel === link.label && link.title === 'Sent' ? 'text-green-600 ' : ''}
                   ${mailListLabel === link.label && link.title === 'Starred' ? 'text-yellow-500  ' : ''}
                `}
                />

                {link.title}
                {navLabelCount &&
                  navLabelCount
                    .filter((item) => item.name === link.label)
                    .map((item) => (
                      <div
                        key={item.name}
                        // className={`ml-auto text-xs ${
                        //   item.count > 100 ? '' : 'mr-2'
                        // } ${item.count == 0 ? 'hidden' : ''}`}
                        className={`ml-auto text-xs mr-2 ${
                          item.count > 100 ? '' : 'mr-2'
                        } ${item.count == 0 ? 'hidden' : ''}`}
                      >
                        {item.count}
                      </div>
                    ))}
              </Button>
            )
          )}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="flex justify-start hover:bg-border gap-2 hover:text-primary dark:text-muted-foreground dark:hover:bg-muted rounded-lg p-3 text-left text-sm transition-all"
              >
                <Tags className="h-4 w-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent
              side="left"
              className="flex items-center  font-normal space-x-2 px-4"
            >
              <div
                onClick={() =>
                  handleMailListChange(
                    'Critical',
                    fetchDataHistory['Critical'].labelId!,
                    false
                  )
                }
                className=" m-1 cursor-pointer w-[1rem] h-[1rem] bg-red-500 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted"
                style={{ boxShadow: '0 4px 4px rgba(255, 0, 0, 0.5)' }}
              />
              <div
                onClick={() =>
                  handleMailListChange(
                    'Urgent',
                    fetchDataHistory['Urgent'].labelId!,
                    false
                  )
                }
                className=" m-1 cursor-pointer w-[1rem] h-[1rem] bg-green-500 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted"
                style={{ boxShadow: '0 4px 4px rgba(0, 255, 0, 0.5)' }}
              />
              <div
                onClick={() =>
                  handleMailListChange(
                    'Routinal',
                    fetchDataHistory['Routinal'].labelId!,
                    false
                  )
                }
                className=" m-1 cursor-pointer w-[1rem] h-[1rem] bg-orange-500 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted"
                style={{ boxShadow: '0 4px 4px rgba(255, 165, 0, 0.5)' }}
              />
              <div
                onClick={() =>
                  handleMailListChange(
                    'Hold',
                    fetchDataHistory['Hold'].labelId!,
                    false
                  )
                }
                className=" m-1 cursor-pointer w-[1rem] h-[1rem] bg-yellow-500 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted"
                style={{ boxShadow: '0 4px 4px rgba(255, 255, 0, 0.5)' }}
              />
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            key={'index'}
            size={'sideNavBar'}
            variant={'ghost'}
            className={`flex text-xs  justify-start hover:bg-border  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  gap-2  p-3 py-0 text-left  transition-all '
          `}
          >
            <Tags className="mr-1 h-[1.1rem] p w-[1.1rem]" />
            <div className="flex justify-start space-x-2">
              <Tooltip key={'red'} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() =>
                      handleMailListChange(
                        'Critical',
                        fetchDataHistory['Critical'].labelId!,
                        false
                      )
                    }
                    className="rounded-full border border-red-500 "
                  >
                    <div
                      className=" m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-red-500 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted "
                      style={{ boxShadow: '0 4px 4px rgba(255, 0, 0, 0.5)' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="flex items-center text-red-700 "
                >
                  Critical
                </TooltipContent>
              </Tooltip>
              <Tooltip key={'green'} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() =>
                      handleMailListChange(
                        'Urgent',
                        fetchDataHistory['Urgent'].labelId!,
                        false
                      )
                    }
                    className="rounded-full border border-orange-400 "
                  >
                    <div
                      className=" m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-orange-400 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted "
                      style={{ boxShadow: '0 4px 4px rgba(255, 165, 0, 0.5)' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="flex items-center text-orange-400 "
                >
                  Urgent
                </TooltipContent>
              </Tooltip>
              <Tooltip key={'orange'} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() =>
                      handleMailListChange(
                        'Routinal',
                        fetchDataHistory['Routinal'].labelId!,
                        false
                      )
                    }
                    className="rounded-full border border-green-400 "
                  >
                    <div
                      className=" m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-green-400 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted "
                      style={{ boxShadow: '0 4px 4px rgba(0, 255, 0, 0.5)' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="flex items-center text-green-400 "
                >
                  Routinal
                </TooltipContent>
              </Tooltip>

              <Tooltip key={'yellow'} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() =>
                      handleMailListChange(
                        'Hold',
                        fetchDataHistory['Hold'].labelId!,
                        false
                      )
                    }
                    className="rounded-full border border-indigo-400 "
                  >
                    <div
                      className=" m-[0.1rem] w-[0.8rem] h-[0.8rem] bg-indigo-400 rounded-full   hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted "
                      style={{ boxShadow: '0 4px 4px rgba(0, 0, 225, 0.2)' }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="flex items-center text-indigo-400 "
                >
                  Hold
                </TooltipContent>
              </Tooltip>
            </div>
          </Button>
        )}
        <div className="flex justify-center w-full">
          <Separator className="w-[80%]" />
        </div>
        {userLabels &&
          userLabels.map((label, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={400}>
                <TooltipTrigger asChild>
                  <div>
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <Button
                          key={index}
                          variant={'ghost'}
                          className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-2 text-left text-sm transition-all '
                ${
                  mailListLabel == label.title &&
                  // 'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                  'bg-border  text-primary     dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                          // onClick={() => {
                          //   handleMailListChange(label.title, true);
                          // }}
                          onClick={() => {
                            handleMailListChange(
                              label.title,
                              [
                                ...label.personalEmails,
                                ...label.domainEmails,
                              ].join(','),
                              true,
                              [
                                ...label.personalEmails,
                                ...label.domainEmails,
                              ].join(',')
                            );
                          }}
                        >
                          <div className=" flex items-center justify-center ">
                            <Avatar className="w-5 h-5 ">
                              <AvatarImage
                                className=" rounded-full"
                                src={label.fallback ? '' : `${label.icon}`}
                                alt="@shadcn"
                              />
                              <AvatarFallback className=" text-sm ">
                                <div className="flex items-center justify-center">
                                  {label.icon.charAt(0)}
                                </div>
                              </AvatarFallback>
                            </Avatar>
                            {/* <img
                              src={label.icon}
                              alt=""
                              className="w-5 h-5 rounded-full "
                            /> */}
                          </div>
                          {/* <span className={`sr-only`}></span> */}
                        </Button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className=" ">
                        <ContextMenuItem
                          onClick={() => handleSetEditValues(label)}
                          className="pl-3 pr-10 flex justify-start space-x-2 items-center"
                        >
                          <Pencil className="w-[0.85rem] h-[0.85rem] mr-1" />
                          <div>Update Title</div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleSetEditValues(label)}
                          className="pl-3 flex justify-start space-x-2 items-center"
                        >
                          <UserRoundPlus className="w-[0.95rem] h-[0.95rem] mr-[0.2rem]" />{' '}
                          <div>Add Emails </div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleSetEditValues(label)}
                          className="pl-3 flex justify-start space-x-2 items-center"
                        >
                          <Building2 className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                          <div>Add Domains</div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => handleSetEditValues(label)}
                          className="pl-3 flex justify-start space-x-2 items-center"
                        >
                          <GalleryVerticalEnd className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                          <div>change Icon</div>
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            handleUserLabelDelete(label.labelId);
                          }}
                          className="pl-3 flex justify-start space-x-2 items-center"
                        >
                          <MailCheck className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                          <div>Delete</div>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {label.title}
                  <span className="ml-auto text-muted-foreground dark:text-white text-black">
                    {navLabelCount &&
                      (() => {
                        const matchingItem = navLabelCount.find((item) => {
                          // console.log(navLabelCount);
                          item.name === label.title;
                        });
                        return matchingItem ? matchingItem.count : '';
                      })()}
                  </span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <ContextMenu key={index}>
                <ContextMenuTrigger className="w-full">
                  <Button
                    key={index}
                    variant={'ghost'}
                    size={'sideNavBar'}
                    className={`flex text-xs w-full  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 py-0 text-left  transition-all '
                ${
                  mailListLabel == label.title &&
                  // 'bg-primary  text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                  'bg-border  text-primary     dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                    // onClick={() => {
                    //   handleMailListChange(label.title, true);
                    // }}
                    onClick={() => {
                      handleMailListChange(
                        label.title,
                        [...label.personalEmails, ...label.domainEmails].join(
                          ','
                        ),
                        true,
                        [...label.personalEmails, ...label.domainEmails].join(
                          ','
                        )
                      );
                    }}
                  >
                    <div className=" flex items-center justify-center ">
                      <Avatar className="w-5 h-5 ">
                        <AvatarImage
                          className=" rounded-full"
                          src={label.fallback ? '' : `${label.icon}`}
                          alt="@shadcn"
                        />
                        <AvatarFallback className=" text-sm ">
                          <div className="flex items-center justify-center">
                            {label.icon.charAt(0)}
                          </div>
                        </AvatarFallback>
                      </Avatar>
                      {/* <img
                              src={label.icon}
                              alt=""
                              className="w-5 h-5 rounded-full "
                            /> */}
                    </div>
                    {/* <img
                      src={label.icon}
                      alt=""
                      className=" mr-1   w-4 rounded-full"
                    /> */}

                    {label.title}

                    {navLabelCount &&
                      navLabelCount
                        .filter((item) => item.name === label.title)
                        .map((item) => (
                          <span key={item.name} className="ml-auto ">
                            {item.count}
                          </span>
                        ))}
                  </Button>
                </ContextMenuTrigger>
                <ContextMenuContent className="">
                  <ContextMenuItem
                    onClick={() => handleSetEditValues(label)}
                    className="pl-3 pr-10 flex justify-start space-x-2 items-center"
                  >
                    <Pencil className="w-[0.85rem] h-[0.85rem] mr-1" />
                    <div>Update Title</div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleSetEditValues(label)}
                    className="pl-3 flex justify-start space-x-2 items-center"
                  >
                    <UserRoundPlus className="w-[0.95rem] h-[0.95rem] mr-[0.2rem]" />{' '}
                    <div>Add Emails </div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleSetEditValues(label)}
                    className="pl-3 flex justify-start space-x-2 items-center"
                  >
                    <Building2 className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                    <div>Add Domains</div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleSetEditValues(label)}
                    className="pl-3 flex justify-start space-x-2 items-center"
                  >
                    <GalleryVerticalEnd className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                    <div>change Icon</div>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => {
                      handleUserLabelDelete(label.labelId);
                    }}
                    className="pl-3 flex justify-start space-x-2 items-center"
                  >
                    <MailCheck className="w-[0.85rem] h-[0.85rem] mr-[0.2rem]" />
                    <div>Delete</div>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          )}
        {userLabels &&
          (isCollapsed ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    // size={'icon'}
                    disabled={userLabels.length >= 5}
                    variant={'ghost'}
                    className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
               `}
                    onClick={() => {
                      handleClearValues();
                      addBucketRef?.current?.click();
                    }}
                  >
                    <SquarePlus className="h-4 w-4" />

                    {/* <span className="sr-only">{link.title}</span> */}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {'Add Bucket'}
                <span className="ml-auto text-muted-foreground"></span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              disabled={userLabels.length >= 5}
              size={'sideNavBar'}
              variant={'ghost'}
              className={`flex text-xs  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 pl-1 text-left  transition-all '
            `}
              onClick={() => {
                handleClearValues();
                addBucketRef?.current?.click();
              }}
            >
              <SquarePlus className=" h-4 w-4 mr-1 ml-2 " />
              Add Bucket
            </Button>
          ))}
      </nav>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <div className="hidden" ref={addBucketRef}></div>
        </DialogTrigger>
        <DialogContent className="w-[45vw] h-[60vh] p-8">
          <DialogHeader>
            <DialogTitle>Add Bucket</DialogTitle>
            <DialogDescription className="text-xs">
              Effortlessly organize your inbox with Bucketing - categorize
              emails by sender or domain for a clutter-free experience.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-5 py-4 w-full">
            <div className="flex items-center">
              <div className="flex items-center">
                <Label className="text-right w-32">Title</Label>
                <Separator
                  orientation="vertical"
                  className="ml-4 h-6 border-gray-300"
                />
              </div>
              <Input
                id="title"
                value={bucketTitle}
                onChange={(e) => setBucketTitle(e.target.value)}
                placeholder="Enter bucket title"
                className="shadow-none border-none flex-grow ml-4"
              />
            </div>

            <div className="flex items-center">
              <div className="flex items-center ">
                <Label className="text-right w-32">Emails</Label>
                <Separator orientation="vertical" className="ml-4 h-6 " />
              </div>
              <div className=" w-full">
                <Suggester
                  inputData={bucketPersonalEmailInputValue}
                  setInPutData={setBucketPersonalEmailInputValue}
                  setValidEmails={setBucketPersonalEmails}
                  suggestableMails={suggestableMails}
                  validEmails={bucketPersonalEmails}
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <Label className="text-right w-32">Domains</Label>
                <Separator
                  orientation="vertical"
                  className="ml-4 h-6 border-gray-300"
                />
              </div>
              <Suggester
                domainFlag={true}
                inputData={bucketDomainEmailInputValue}
                setInPutData={setBucketDomainEmailInputValue}
                setValidEmails={setBucketDomainEmails}
                suggestableMails={suggestableMails}
                validEmails={bucketDomainEmails}
              />
            </div>

            <Separator />
            <div className="flex items-center">
              <div className="flex items-center">
                <Label className="text-right w-32">Icons</Label>
                <Separator
                  orientation="vertical"
                  className="ml-4 h-6 border-gray-300"
                />
                <DomainAvatars
                  bucketDomainEmails={bucketDomainEmails}
                  bucketPersonalEmails={bucketPersonalEmails}
                  handleAvatarClick={handleAvatarClick}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button
              // disabled={bucketTitle.trim() === ''}
              type="button" // Change type to "button" as it's not inside a <form>
              onClick={() => {
                handleSubmit(); // Call your submit function
                // setShowDialog(false); // Close the dialog after submitting
              }}
            >
              Add Bucket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpenClose} onOpenChange={setEditDialogOpenClose}>
        <DialogTrigger asChild>
          <div className="hidden" ref={editRef}></div>
        </DialogTrigger>
        <DialogContent className=" w-[45vw] h-[60vh] p-8">
          <DialogHeader>
            <DialogTitle>Edit Bucket</DialogTitle>
            <DialogDescription>
              Effortlessly organize your inbox with Bucketing - categorize
              emails by sender or domain for a clutter-free experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={bucketTitle}
                onChange={(e) => setBucketTitle(e.target.value)}
                placeholder=""
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="optional-email"
                className="text-right flex flex-col"
              >
                <span> Email</span>
              </Label>
              <Suggester
                inputData={bucketPersonalEmailInputValue}
                setInPutData={setBucketPersonalEmailInputValue}
                setValidEmails={setBucketPersonalEmails}
                suggestableMails={suggestableMails}
                validEmails={bucketPersonalEmails}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="optional-domain" className="text-right">
                Domain
              </Label>
              <Suggester
                domainFlag={true}
                inputData={bucketDomainEmailInputValue}
                setInPutData={setBucketDomainEmailInputValue}
                setValidEmails={setBucketDomainEmails}
                suggestableMails={suggestableMails}
                validEmails={bucketDomainEmails}
              />
            </div>

            <Separator />
            <div className="flex items-center">
              <div className="flex items-center">
                <Label className="text-right w-32">Icons</Label>
                <Separator
                  orientation="vertical"
                  className="ml-4 h-6 border-gray-300"
                />
                <DomainAvatars
                  bucketDomainEmails={bucketDomainEmails}
                  bucketPersonalEmails={bucketPersonalEmails}
                  handleAvatarClick={handleAvatarClick}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="">
            <Button
              size={'sm'}
              variant={'destructive'}
              type="button" // Change type to "button" as it's not inside a <form>
              onClick={() => {
                handleUserLabelDelete(bucketLabelId);
              }}
            >
              Delete
            </Button>
            <Button
              size={'sm'}
              type="button" // Change type to "button" as it's not inside a <form>
              onClick={() => {
                // Close the dialog after submitting
                handleUserLabelEdit();
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
