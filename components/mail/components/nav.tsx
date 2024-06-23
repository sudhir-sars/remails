'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { SquarePlus } from 'lucide-react';
import { BriefcaseBusiness } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { SquareUserRound } from 'lucide-react';
import { MdOutlineFamilyRestroom } from 'react-icons/md';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
import { IEmail } from './IMail';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { PiBuildingOfficeLight } from 'react-icons/pi';

interface NavLabelCount {
  name: string;
  messagesTotal: number;
}

type NavLabelCounts = NavLabelCount[];

interface NavProps {
  navLabelCount: NavLabelCounts;
  isCollapsed: boolean;
  links?: {
    title: string;

    icon: LucideIcon;
    variant: 'default' | 'ghost';
  }[];
  userLabels?: IUserLabels[];
  setSelectedNavItem: (item: string) => void;
  setUserLabels: React.Dispatch<React.SetStateAction<IUserLabels[]>>;

  selectedNavItem: string;
  handleMailListChange: (label: string) => void;
}
interface IUserLabels {
  title: string;
  personal: boolean;
  labelColor: string;
  domain: boolean;
  personalEmails: string[]; // Make these properties optional
  domainEmails: string[]; // Make these properties optional
  category: string;
}

interface ILabelData {
  userId: string;
  label: IUserLabels;
}

export function Nav({
  navLabelCount,
  handleMailListChange,
  links,
  userLabels,
  isCollapsed,
  setSelectedNavItem,
  selectedNavItem,
  setUserLabels,
}: NavProps) {
  const handleNavButtonClick = (title: string) => {
    setSelectedNavItem(title);
  };
  const [bucketType, setBucketType] = useState('Personal'); // State to manage radio button selection
  const [bucketTitle, setBucketTitle] = useState('');
  const [optionalInput, setOptionalInput] = useState(''); // State to manage the optional input
  const [bucketLabel, setBucketLabel] = useState('Work'); // State to manage priority selection
  const [showDialog, setShowDialog] = useState(false);

  const handleValueChange = (label: any, key: string) => {
    if (key === 'rd') {
      setBucketType(label);
      console.log(bucketType);
    } else if (key === 'Label') {
      setBucketLabel(label);
      console.log(bucketLabel);
    } else if (key == 'Title') {
      setBucketTitle(label);
      console.log(bucketTitle);
    }
  };
  const getLabelColor = (category: string) => {
    switch (category) {
      case 'Work':
        return 'bg-teal-500';
      case 'College':
        return 'bg-cyan-500';
      case 'Personal':
        return 'bg-orange-500';
      case 'Family':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500'; // Default color if category doesn't match
    }
  };
  const handleSubmit = async () => {
    console.log('here');
    try {
      const userId = localStorage.getItem('userId');

      const labelData: IUserLabels = {
        title: bucketTitle,
        personal: bucketType === 'Personal',
        // labelColor: getLabelColor(bucketCategory), // Replace with appropriate logic
        domain: bucketType === 'Domain',
        personalEmails: [],
        domainEmails: [],
        category: bucketLabel,
        labelColor: getLabelColor(bucketLabel),
      };

      // Include domainEmails if optionalInput is provided and bucketType is Domain
      if (optionalInput && bucketType === 'Domain') {
        labelData.domainEmails = [optionalInput];
      }

      // Include personalEmails if optionalInput is provided and bucketType is Personal
      if (optionalInput && bucketType === 'Personal') {
        labelData.personalEmails = [optionalInput];
      }
      setUserLabels((pre) => [...pre, labelData]);

      setShowDialog(false);
      const labelBody: ILabelData = {
        userId: userId!,
        label: labelData,
      };

      const response = await fetch(`/api/userData/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labelBody),
      });

      if (!response.ok) {
        throw new Error('Failed to add label');
      }

      const data = await response.json();
      console.log('Label added successfully:', data);
    } catch (err) {
      console.error('Error adding label:', err);
      // Handle error appropriately
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links &&
          links.map((link, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={400}>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      // size={'icon'}
                      key={index}
                      variant={'ghost'}
                      className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
                ${
                  selectedNavItem == link.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                      onClick={() => {
                        handleMailListChange(link.title);
                        handleNavButtonClick(link.title);
                      }}
                    >
                      <link.icon className="h-4 w-4" />
                      {/* <span className="sr-only">{link.title}</span> */}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  <span className="ml-auto text-muted-foreground">
                    {navLabelCount &&
                      (() => {
                        const matchingItem = navLabelCount.find(
                          (item) =>
                            item.name.toUpperCase() === link.title.toUpperCase()
                        );
                        return matchingItem ? matchingItem.messagesTotal : '';
                      })()}
                  </span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={index}
                variant={'ghost'}
                className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
                ${
                  selectedNavItem == link.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                onClick={() => {
                  handleMailListChange(link.title);
                  handleNavButtonClick(link.title);
                }}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.title}
                {navLabelCount &&
                  navLabelCount
                    .filter(
                      (item) =>
                        item.name.toUpperCase() === link.title.toUpperCase()
                    )
                    .map((item) => (
                      <span key={item.name} className="ml-auto ">
                        {item.messagesTotal}
                      </span>
                    ))}
              </Button>
            )
          )}
        {userLabels &&
          userLabels.map((label, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={400}>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      // size={'icon'}
                      key={index}
                      variant={'ghost'}
                      className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
                ${
                  selectedNavItem == label.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                      onClick={() => {
                        handleMailListChange(label.title);
                        handleNavButtonClick(label.title);
                      }}
                    >
                      {label.category === 'Work' && (
                        <PiBuildingOfficeLight className=" mr-1 h-5 w-5" />
                      )}
                      {label.category === 'College' && (
                        <GraduationCap className="mr-1 h-5 w-5" />
                      )}
                      {label.category === 'Family' && (
                        <MdOutlineFamilyRestroom className=" mr-1 h-4 w-4" />
                      )}
                      {label.category === 'Personal' && (
                        <SquareUserRound className=" mr-1 h-4 w-4" />
                      )}
                      {/* <span className="sr-only">{link.title}</span> */}
                      <span className={`sr-only`}></span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {label.title}
                  <span className="ml-auto text-muted-foreground">
                    {navLabelCount &&
                      (() => {
                        const matchingItem = navLabelCount.find(
                          (item) =>
                            item.name.toUpperCase() ===
                            label.title.toUpperCase()
                        );
                        return matchingItem ? matchingItem.messagesTotal : '';
                      })()}
                  </span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={index}
                variant={'ghost'}
                className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 pl-1 text-left text-sm transition-all '
                ${
                  selectedNavItem == label.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                onClick={() => {
                  handleMailListChange(label.title);
                  handleNavButtonClick(label.title);
                }}
              >
                <span
                  className={` ${label.labelColor}   w-[0.35rem] h-7 rounded-xl`}
                ></span>

                {label.category === 'Work' && (
                  <PiBuildingOfficeLight className=" mr-1 h-5 w-5" />
                )}
                {label.category === 'College' && (
                  <GraduationCap className="mr-1 h-5 w-5" />
                )}
                {label.category === 'Family' && (
                  <MdOutlineFamilyRestroom className=" mr-1 h-4 w-4" />
                )}
                {label.category === 'Personal' && (
                  <SquareUserRound className=" mr-1 h-4 w-4" />
                )}

                {label.title}

                {navLabelCount &&
                  navLabelCount
                    .filter(
                      (item) =>
                        item.name.toUpperCase() === label.title.toUpperCase()
                    )
                    .map((item) => (
                      <span key={item.name} className="ml-auto ">
                        {item.messagesTotal}
                      </span>
                    ))}
              </Button>
            )
          )}

        {userLabels &&
          (isCollapsed ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        // size={'icon'}

                        variant={'ghost'}
                        className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
               `}
                      >
                        <SquarePlus className="h-4 w-4" />
                        {/* <span className="sr-only">{link.title}</span> */}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className=" w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Add Bucket</DialogTitle>
                        <DialogDescription>
                          Effortlessly organize your inbox with Bucketing -
                          categorize emails by sender or domain for a
                          clutter-free experience.
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
                            onChange={(e) =>
                              handleValueChange(e.target.value, 'Title')
                            }
                            placeholder="Enter bucket title"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right">Type</Label>
                          <div className="col-span-3">
                            <RadioGroup
                              defaultValue="Personal"
                              className="flex"
                              // onValueChange={handleOp}
                              onValueChange={(label) =>
                                handleValueChange(label, 'rd')
                              }
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Personal" id="r1" />
                                <Label htmlFor="r1">Personal</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Domain" id="r2" />
                                <Label htmlFor="r2">Domain</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                        {bucketType === 'Personal' && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="optional-email"
                              className="text-right flex flex-col"
                            >
                              <span> Email</span>
                            </Label>
                            <Input
                              id="optional-email"
                              placeholder="lex<ops@gmail.com"
                              value={optionalInput}
                              onChange={(e) => setOptionalInput(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        )}
                        {bucketType === 'Domain' && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="optional-domain"
                              className="text-right"
                            >
                              Domain
                            </Label>
                            <Input
                              id="optional-domain"
                              placeholder=" Altassian.com or lpu.in  "
                              value={optionalInput}
                              onChange={(e) => setOptionalInput(e.target.value)}
                              className="col-span-3"
                            />
                          </div>
                        )}
                        <Separator />
                        <div className="flex ml-8 items-center">
                          <Label className="text-right ml-9 ">Label</Label>
                          <Separator orientation="vertical" className="ml-4" />
                          <div className="flex pl-6 space-x-3 pt-2  w-full">
                            {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-blue-500 shadow-lg shadow-blue-500 hover:bg-blue-600 ${
                              bucketLabel === 'Orders'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Orders', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-blue-500">
                          <p>Orders</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-purple-500 shadow-lg shadow-purple-500 hover:bg-purple-600 ${
                              bucketLabel === 'Travel'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Travel', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-purple-500">
                          <p>Travel</p>
                        </TooltipContent>
                      </Tooltip> */}

                            {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-blue-500 shadow-lg shadow-blue-500 hover:bg-blue-600 ${
                              bucketLabel === 'Transactions'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Transactions', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-blue-500">
                          <p>Banks</p>
                        </TooltipContent>
                      </Tooltip> */}
                            {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-yellow-500 shadow-lg shadow-yellow-500 hover:bg-yellow-600 ${
                              bucketLabel === 'Events'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Events', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-yellow-500">
                          <p>Events</p>
                        </TooltipContent>
                      </Tooltip> */}
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger>
                                <Button
                                  size="label"
                                  className={`rounded-full  border border-transparent bg-teal-500 shadow-lg shadow-teal-500 hover:bg-teal-600 ${
                                    bucketLabel === 'Work' ? 'border-black' : ''
                                  }`}
                                  onClick={() =>
                                    handleValueChange('Work', 'Label')
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-teal-500"
                              >
                                <p>Work</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger>
                                <Button
                                  size="label"
                                  className={`rounded-full bg-cyan-500 shadow-lg shadow-cyan-500 hover:bg-cyan-600 ${
                                    bucketLabel === 'College'
                                      ? 'border-black'
                                      : 'border-transparent'
                                  } border`}
                                  onClick={() =>
                                    handleValueChange('College', 'Label')
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-cyan-500"
                              >
                                <p>College</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger>
                                <Button
                                  size="label"
                                  className={`rounded-full bg-orange-500 shadow-lg shadow-orange-500 hover:bg-orange-600 ${
                                    bucketLabel === 'Personal'
                                      ? 'border-black'
                                      : 'border-transparent'
                                  } border`}
                                  onClick={() =>
                                    handleValueChange('Personal', 'Label')
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-orange-500"
                              >
                                <p>Personal</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip delayDuration={250}>
                              <TooltipTrigger>
                                <Button
                                  size="label"
                                  className={`rounded-full bg-indigo-500 shadow-lg shadow-indigo-500 hover:bg-indigo-600 ${
                                    bucketLabel === 'Family'
                                      ? 'border-black'
                                      : 'border-transparent'
                                  } border`}
                                  onClick={() =>
                                    handleValueChange('Family', 'Label')
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="bg-indigo-500"
                              >
                                <p>Family</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          disabled={
                            bucketTitle.trim() === '' ||
                            bucketLabel.trim() === ''
                          }
                          type="button" // Change type to "button" as it's not inside a <form>
                          onClick={() => {
                            handleSubmit(); // Call your submit function
                            setShowDialog(false); // Close the dialog after submitting
                          }}
                        >
                          Add Bucket
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {'Add Bucket'}
                <span className="ml-auto text-muted-foreground"></span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button
                  variant={'ghost'}
                  className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 pl-1 text-left text-sm transition-all '
            `}
                >
                  <SquarePlus className=" h-4 w-4 mr-1 ml-2 " />
                  {'Add Bucket'}
                </Button>
              </DialogTrigger>
              <DialogContent className=" w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Bucket</DialogTitle>
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
                      onChange={(e) =>
                        handleValueChange(e.target.value, 'Title')
                      }
                      placeholder="Enter bucket title"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Type</Label>
                    <div className="col-span-3">
                      <RadioGroup
                        defaultValue="Personal"
                        className="flex"
                        // onValueChange={handleOp}
                        onValueChange={(label) =>
                          handleValueChange(label, 'rd')
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Personal" id="r1" />
                          <Label htmlFor="r1">Personal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Domain" id="r2" />
                          <Label htmlFor="r2">Domain</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  {bucketType === 'Personal' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="optional-email"
                        className="text-right flex flex-col"
                      >
                        <span> Email</span>
                      </Label>
                      <Input
                        id="optional-email"
                        placeholder="lex<ops@gmail.com"
                        value={optionalInput}
                        onChange={(e) => setOptionalInput(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  {bucketType === 'Domain' && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="optional-domain" className="text-right">
                        Domain
                      </Label>
                      <Input
                        id="optional-domain"
                        placeholder=" Altassian.com or lpu.in  "
                        value={optionalInput}
                        onChange={(e) => setOptionalInput(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <Separator />
                  <div className="flex ml-8 items-center">
                    <Label className="text-right ml-9 ">Label</Label>
                    <Separator orientation="vertical" className="ml-4" />
                    <div className="flex pl-6 space-x-3 pt-2  w-full">
                      {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-blue-500 shadow-lg shadow-blue-500 hover:bg-blue-600 ${
                              bucketLabel === 'Orders'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Orders', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-blue-500">
                          <p>Orders</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-purple-500 shadow-lg shadow-purple-500 hover:bg-purple-600 ${
                              bucketLabel === 'Travel'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Travel', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-purple-500">
                          <p>Travel</p>
                        </TooltipContent>
                      </Tooltip> */}

                      {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-blue-500 shadow-lg shadow-blue-500 hover:bg-blue-600 ${
                              bucketLabel === 'Transactions'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Transactions', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-blue-500">
                          <p>Banks</p>
                        </TooltipContent>
                      </Tooltip> */}
                      {/* <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-yellow-500 shadow-lg shadow-yellow-500 hover:bg-yellow-600 ${
                              bucketLabel === 'Events'
                                ? 'border-black'
                                : 'border-transparent'
                            } border-2`}
                            onClick={() =>
                              handleValueChange('Events', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-yellow-500">
                          <p>Events</p>
                        </TooltipContent>
                      </Tooltip> */}
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full  border border-transparent bg-teal-500 shadow-lg shadow-teal-500 hover:bg-teal-600 ${
                              bucketLabel === 'Work' ? 'border-black' : ''
                            }`}
                            onClick={() => handleValueChange('Work', 'Label')}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-teal-500">
                          <p>Work</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-cyan-500 shadow-lg shadow-cyan-500 hover:bg-cyan-600 ${
                              bucketLabel === 'College'
                                ? 'border-black'
                                : 'border-transparent'
                            } border`}
                            onClick={() =>
                              handleValueChange('College', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-cyan-500">
                          <p>College</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-orange-500 shadow-lg shadow-orange-500 hover:bg-orange-600 ${
                              bucketLabel === 'Personal'
                                ? 'border-black'
                                : 'border-transparent'
                            } border`}
                            onClick={() =>
                              handleValueChange('Personal', 'Label')
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-orange-500">
                          <p>Personal</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip delayDuration={250}>
                        <TooltipTrigger>
                          <Button
                            size="label"
                            className={`rounded-full bg-indigo-500 shadow-lg shadow-indigo-500 hover:bg-indigo-600 ${
                              bucketLabel === 'Family'
                                ? 'border-black'
                                : 'border-transparent'
                            } border`}
                            onClick={() => handleValueChange('Family', 'Label')}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-indigo-500">
                          <p>Family</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    disabled={
                      bucketTitle.trim() === '' || bucketLabel.trim() === ''
                    }
                    type="button" // Change type to "button" as it's not inside a <form>
                    onClick={() => {
                      handleSubmit(); // Call your submit function
                      setShowDialog(false); // Close the dialog after submitting
                    }}
                  >
                    Add Bucket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
      </nav>
    </div>
  );
}
