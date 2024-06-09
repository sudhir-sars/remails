'use client';
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { useSearchParams } from 'next/navigation';
import { createTempSession, verifySessionId } from '@/utils/session';
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { NavComponentKeys } from './mailList';

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
interface DecodedToken {
  sessionId: string;
  token_gen_code: string;
  refresh_token: string;
  access_token: string;
  expiry_date: number;
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
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET!) as DecodedToken;

        localStorage.setItem('jwt_token', token);
        const {
          sessionId,
          token_gen_code,
          refresh_token,
          access_token,
          expiry_date,
        } = decoded;
        // Convert expiry_date to a Unix timestamp in seconds
        const expiryTimestamp: number = Math.floor(
          expiry_date - Date.now() / 1000
        );

        // Generate token for sessionId with a 6-month expiration
        const sessionToken = jwt.sign(
          { sessionId },
          JWT_SECRET!,
          { expiresIn: '6m' } // 6 months
        );

        // Generate token for token_gen_code with no expiration
        const tokenGenCodeToken = jwt.sign(
          { token_gen_code },
          JWT_SECRET!,
          { noTimestamp: true } // No expiration
        );

        // Generate token for refresh_token with expiry_date
        const refreshToken = jwt.sign({ refresh_token }, JWT_SECRET!, {
          expiresIn: expiryTimestamp,
        });

        // Generate token for access_token with expiry_date
        const accessToken = jwt.sign({ access_token }, JWT_SECRET!, {
          expiresIn: expiryTimestamp,
        });
        localStorage.setItem('sessionToken', sessionToken);
        localStorage.setItem('tokenGenCodeToken', tokenGenCodeToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessToken', accessToken);
        console.log('all token set');
        router.replace('http://localhost:3000/');
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('tokenGenCodeToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        window.location.href = '/signup';
      }
    } else {
      const local_token = localStorage.getItem('jwt_token');
      if (local_token) {
        try {
          const decoded = jwt.verify(local_token, JWT_SECRET!) as DecodedToken;
          router.replace('http://localhost:3000/');
        } catch (error) {
          console.log('tamered token');
          localStorage.clear();
          router.push('/signup');
        }
      } else {
        window.location.href = '/signup';
      }
    }
  }, [router, searchParams]);

  return (
    <>
      <div className="w-full flex justify-between px-4">
        <span className="font-bold text-xl">{'Inbox'}</span>
        <Tabs defaultValue="Inbox" className="">
          <TabsList>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Inbox')}
              value="Inbox"
            >
              All Mail
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Unread')}
              value="Unread"
            >
              Unread
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Sent')}
              value="Sent"
            >
              Sent
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setNavSelectedItem('Spam')}
              value="Spam"
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
