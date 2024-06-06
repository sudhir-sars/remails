'use client';

import React, { useEffect, useState } from 'react';
import Inbox from '../sub/Inbox';
import {
  NavComponents,
  NavComponentKeys,
  defaultMailItem,
} from '../sub/mailList';
import { Separator } from '@/components/ui/separator';
import MailView from '../sub/MailView';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Inbox as InboxIcon,
  Send,
  File,
  ArchiveX,
  ArchiveRestore,
  Trash2,
  Slice,
} from 'lucide-react';

const NavItems: { icon: JSX.Element; label: NavComponentKeys }[] = [
  { icon: <InboxIcon size={18} />, label: 'Inbox' },
  { icon: <Send size={18} />, label: 'Sent' },
  { icon: <File size={18} />, label: 'Drafts' },
  { icon: <ArchiveX size={18} />, label: 'Junk' },
  { icon: <Trash2 size={18} />, label: 'Trash' },
  { icon: <ArchiveRestore size={18} />, label: 'Archive' },
];

interface MailProps {
  id: string;
  sender: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
  tag: string;
}

interface IHomeProps {}

const Home: React.FunctionComponent<IHomeProps> = (props) => {
  const [selectedNavItem, setNavSelectedItem] =
    useState<NavComponentKeys>('Inbox');

  const [selectedMailItem, setSelectedMailItem] = useState<MailProps | null>(
    defaultMailItem
  );

  const handleClickNavItem = (item: NavComponentKeys) => {
    setNavSelectedItem(item);
  };
  const handleClickMailItem = (item: MailProps) => {
    setSelectedMailItem(item);
  };

  useEffect(() => {
    setNavSelectedItem('Inbox');
  }, []);

  return (
    <>
      <div className="mt-11 w-full flex justify-center h-[91vh]">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border h-full max-h-[800px]"
        >
          <ResizablePanel defaultSize={21} minSize={15} maxSize={17}>
            <div className="p-2">
              <Select>
                <SelectTrigger className="flex w-full">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <ResizablePanelGroup
              direction="vertical"
              className="rounded-lg border h-full max-h-[800px]"
            >
              <ResizablePanel defaultSize={31} minSize={8}>
                <div className="flex-col space-y-1 justify-start p-2 w-full">
                  {NavItems.map((item) => (
                    <Button
                      variant="ghost"
                      key={item.label}
                      onClick={() => handleClickNavItem(item.label)}
                      className={`rounded-md flex w-full justify-start border ${
                        selectedNavItem == item.label
                      }?" bg-black": "bg-black"`}
                    >
                      <div className="flex items-center">
                        <span>{item.icon}</span>
                        <span className="ml-[0.65rem]">{item.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={15}>
                <div className="flex-col space-y-1 justify-start p-2 w-full">
                  <ul>
                    {NavItems.map((item) => (
                      <Button
                        variant="ghost"
                        key={item.label}
                        onClick={() => handleClickNavItem(item.label)}
                        className={`rounded-md flex w-full justify-start ${
                          selectedNavItem == item.label
                        }?""`}
                      >
                        <div className="flex items-center">
                          <span>{item.icon}</span>
                          <span className="ml-[0.65rem]">{item.label}</span>
                        </div>
                      </Button>
                    ))}
                  </ul>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="flex justify-center py-2 w-full h-full">
              <span className="w-full h-full font-semibold px-0">
                <Inbox
                  mailList={NavComponents[selectedNavItem]}
                  setSelectedMailItem={setSelectedMailItem}
                  selectedMailItem={selectedMailItem ?? null}
                  setNavSelectedItem={setNavSelectedItem}
                />
              </span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50}>
            <div className="flex justify-center  w-full h-full">
              <span className="w-full h-full font-semibold px-0">
                <MailView selectedMailItem={selectedMailItem ?? null} />
              </span>
            </div>
            <Separator />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default Home;
