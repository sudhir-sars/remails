import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { NavComponentKeys } from '../sub/mailList';

interface MailProps {
  id: string;
  sender: string;
  subject: string;
  content: string;
  date: Date;
  read: boolean;
  tag: string;
}

interface InboxProps {
  mailList: MailProps[];
  setSelectedMailItem: (mail: MailProps) => void;
  selectedMailItem: MailProps | null;
  setNavSelectedItem: (item: NavComponentKeys) => void;
}
const Inbox: React.FC<InboxProps> = ({
  mailList,
  setSelectedMailItem,
  selectedMailItem,
  setNavSelectedItem,
}) => {
  const [selectedMailId, setSelectedMailId] = useState<number | null>(null);

  const handleMailSelect = (index: number, item: MailProps) => {
    setSelectedMailId(index === selectedMailId ? null : index);
    setSelectedMailItem(item);
  };

  return (
    <>
      <div className="w-full flex justify-between px-4">
        <span className="font-bold text-xl">{'Inbox'}</span>
        <Tabs defaultValue="account" className="">
          <TabsList>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Inbox')}
              value="all_mail"
            >
              All Mail
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Unread')}
              value="unread"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Sent')}
              value="sent"
            >
              Sent
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Spam')}
              value="spam"
            >
              Spam
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full border rounded-lg  h-full py-2 px-0 mt-2">
        <div className="w-full p-4 pt-2">
          <div className="search-bar relative w-full rounded-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 text-muted-foreground"
            />
          </div>
        </div>
        <div className="h-full w-full  pb-20">
          <ScrollArea className="h-full w-full flex flex-col gap-2 p-4 pt-0">
            {mailList.map((mail: MailProps, index: number) => (
              <button
                key={index}
                className={cn(
                  'w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all mb-2',
                  selectedMailId === index ? 'bg-muted' : 'hover:bg-accent'
                )}
                onClick={() => handleMailSelect(index, mail)}
              >
                <div className="flex justify-between w-full">
                  <span className=" flex space-x-2 font-bold">
                    <span>{mail.sender}</span>
                    {mail.read ? null : (
                      <span className="flex items-center space-x-2">
                        <span className="flex h-2 mt-1 w-2 rounded-full bg-blue-600" />
                      </span>
                    )}
                  </span>
                  <div className="text-[#a1a1aa] text-xs">
                    <FormattedDate mail={mail} />
                  </div>
                </div>
                <div className="text-sm">{mail.subject}</div>
                <div className="text-[#a1a1aa] text-xs">{mail.content}</div>
              </button>
            ))}
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

const FormattedDate: React.FC<{ mail: MailProps }> = ({ mail }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormattedDate(formatDistanceToNow(mail.date, { addSuffix: true }));
    }
  }, [mail.date]);

  return <>{formattedDate}</>;
};

export default Inbox;
