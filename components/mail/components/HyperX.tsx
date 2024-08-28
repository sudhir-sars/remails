'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, CrossIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
interface AIResponse {
  content: string;
}
import { IEmails, IEmail } from './IMail';

import { Badge } from '@/components/ui/badge';
import { Cross2Icon } from '@radix-ui/react-icons';
import { dummyEmail } from '@/constants/dummyMail';
import { useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import AiLogo from '@/constants/AiLogo.png';
import ViewInFullMode from './ViewInFullMode';

import { IHyperxMessage, IMailsWithFilter } from './IMail';

interface IHyperX {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: IHyperxMessage[];
  setMessages: React.Dispatch<React.SetStateAction<IHyperxMessage[]>>;
  mailsBigData: IMailsWithFilter;
  setMailsBigData: (mailsBigData: IMailsWithFilter) => void;
}

export default function HyperX({
  isOpen,
  setIsOpen,
  messages,
  setMessages,
  mailsBigData,
  setMailsBigData,
}: IHyperX) {
  const [query, setQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const maxWords = 30;
  const wordLengthLimit = 8;
  const chunkLength = 30;

  const getISTDate = () => {
    const utcDate = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    return new Date(utcDate.getTime() + offset).toISOString();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataFromLocalStorage = JSON.parse(
          localStorage.getItem('userName') || 'null'
        );
        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error('User ID is not available in local storage');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_HOST}/api/hyperx/grok/databaseOperations/fecthUserAddress`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user address');
        }

        const { data: fetchedUserAddress } = await response.json();
        const firstName =
          (userDataFromLocalStorage &&
            userDataFromLocalStorage.split(' ')[0]) ||
          'User';

        setUserData({
          name: firstName,
          currentTime: getISTDate(),
          'user Has Sent Mails To': fetchedUserAddress.fromAddresses,
          'user Has Received Mails From': fetchedUserAddress.toAddresses,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const sendQuery = async () => {
    if (!query.trim()) return;
    setQuery('');

    setIsLoading(true);
    setIsDisabled(true);
    const token = localStorage.getItem('refreshToken')!;
    if (!token) {
      console.error('Token is not available in local storage');
      return;
    }
    const userId = localStorage.getItem('userId');

    if (!userId) {
      console.error('User ID is not available in local storage');
      return;
    }

    try {
      setMessages((prev) => [...prev, { type: 'user', content: query }]);

      const response = await fetch('/api/hyperx/grok/initialCategorization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, token, metaData: userData, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const { data } = await response.json();
      console.log(data);
      const { finalResponse, fullEmailBody, result } = data;
      // console.log(fullEmailBody);
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          content: finalResponse,
          ...(result.type === 'emailQuery' && {
            queryType: result.type,
            emailData: fullEmailBody.emails,
          }),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'ai', content: 'Sorry, I encountered an error.' },
      ]);
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  const countWords = (text: string): number => {
    return text.split(/\s+/).reduce((count, word) => {
      const length = word.length;
      const chunks = Math.ceil(length / wordLengthLimit);
      return count + chunks;
    }, 0);
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

  const splitLongWords = (text: string | undefined | null): string => {
    if (typeof text !== 'string') {
      return '';
    }

    const words = text.split(' ');
    return words
      .map((word) => {
        if (word.length > chunkLength) {
          const chunks = word.match(new RegExp(`.{1,${chunkLength}}`, 'g'));
          return chunks?.join(' ') || word;
        }
        return word;
      })
      .join(' ');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const wordCount = countWords(text);

    if (wordCount <= maxWords) {
      setQuery(text);
    }
  };

  const wordCount = countWords(query);
  const viewInFullModeRef = useRef<HTMLDivElement>(null);
  const [selectedMail, setSelectedMail] = useState<IEmail>(dummyEmail);
  const handleMailClick = () => {
    if (viewInFullModeRef && viewInFullModeRef.current) {
      viewInFullModeRef.current.click();
    }
  };

  return (
    <>
      <ViewInFullMode
        mailsBigData={mailsBigData}
        setMailsBigData={setMailsBigData}
        viewInFullModeRef={viewInFullModeRef}
        mail={selectedMail}
      />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button onClick={() => setIsOpen(true)} className="hidden">
          Open
        </Button>
        <DialogContent className="w-[75vw] h-[95vh] flex flex-col  pt-12 pb-0">
          <div className="flex items-start p-4 py-4 pt-4 z-10 absolute top-0 right-0 w-full shadow-lg px-4 rounded-xl border-border/40 bg-background/95">
            <div className="flex items-start gap-4 text-sm w-full pl-7">
              <div className="flex items-center justify-center">
                <Avatar className="rounded-none">
                  <AvatarImage
                    height={20}
                    width={20}
                    src={AiLogo.src}
                    alt="AI Assistant"
                    className="rounded-none"
                  />
                  <AvatarFallback className="w-full">SY</AvatarFallback>
                </Avatar>
              </div>
              <div className="grid w-full">
                <span className="flex justify-between w-full">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="font-semibold">Synaptics</div>

                    <div className="rounded-full w-2 h-2 bg-green-500 "></div>
                  </div>
                  <DialogClose asChild>
                    <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                      <Cross2Icon className="h-4 w-4 cursor-pointer hover:text-red-500" />
                      <span className="sr-only">Close</span>
                    </div>
                  </DialogClose>
                </span>
                <span className="flex justify-between">
                  <span className="">
                    <div className="line-clamp-1 text-xs">
                      Your personal AI assistant
                    </div>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-full w-full flex justify-center overflow-hidden mt-16">
            <ScrollArea className="w-[60vw]">
              <div className="p-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.type === 'user'
                          ? 'bg-blue-200 text-right p-4 py-0 pt-2  dark:bg-background border'
                          : 'bg-gray-200 text-left p-4 py-0  pt-2 dark:bg-background border'
                      }  rounded-xl`}
                    >
                      <ReactMarkdown className="">
                        {typeof message.content === 'string'
                          ? splitLongWords(message.content)
                          : ''}
                      </ReactMarkdown>
                      {message.queryType == 'emailQuery' &&
                        message.emailData?.map((email, index) => (
                          <button
                            key={index}
                            onDoubleClick={handleMailClick}
                            className={cn(
                              'flex flex-col mx-[0.35rem] my-4 pt-[0.35rem] bg-[#ffffff] hover:shadow-all-sides dark:hover:bg-muted dark:bg-background border-t-0 border-l-0 border-r-0 w-full items-start gap-1 rounded-xl p-5 pl-0 text-left text-sm transition-all',
                              selectedMail.id === email.id
                                ? 'shadow-all-sides dark:bg-muted hover:bg-white'
                                : 'shadow-sm',
                              index === 0 && 'mt-16'
                            )}
                            onClick={() => {
                              setSelectedMail(email);
                              handleMailClick();
                            }}
                          >
                            <div className="flex space-x-2 w-full">
                              <span
                                className={`${
                                  selectedMail?.id == email.id
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
                                      <div className="font-semibold ">
                                        <div className="flex space-x-1 justify-center items-center">
                                          <div className="flex items-center justify-center text-sm">
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
                                                    <div className="rounded-full  flex items-center justify-center gap-4  p-1 bg-muted w-full">
                                                      {email.name
                                                        .split(' ')
                                                        .map(
                                                          (chunk) => chunk[0]
                                                        )
                                                        .join('')
                                                        .toUpperCase()}
                                                    </div>
                                                  </AvatarFallback>
                                                </Avatar>
                                              );
                                            })()}
                                          </div>
                                          <div className="pl-2">
                                            {email.name}
                                          </div>
                                        </div>
                                      </div>
                                      {!email.read && (
                                        <div className="flex h-4 dark:font-bold text-[0.6rem] px-[0.4rem] text-blue-700 rounded-md bg-[#d9e5fe]">
                                          New
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      className={cn(
                                        'ml-auto text-[0.65rem]',
                                        selectedMail?.id === email.id
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      {formatDistanceToNow(
                                        new Date(email.date),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex w-full mt-1">
                                  <div className="flex-col w-full">
                                    <div className="text-[0.79rem] font-medium">
                                      {email.subject}
                                    </div>
                                    <div className="line-clamp-1 text-xs text-muted-foreground my-2">
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
                                              backgroundColor:
                                                getBackgroundColor(
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
                        ))}
                    </div>
                  </div>
                ))}
                {isLoading && <SkeletonLoader />}
              </div>
            </ScrollArea>
          </div>
          <div className="flex items-baseline justify-center p-4 border-t">
            <div className="w-[40vw] relative">
              <Textarea
                value={query}
                onChange={handleTextareaChange}
                placeholder="Type your query here..."
                className="h-[50px] border-2 rounded-xl p-4 pr-14 outline-none"
                style={{
                  height: 'auto',
                  overflow: 'hidden',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery();
                  }
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {wordCount} / {maxWords}
                </span>
                <Button
                  variant={'ghost'}
                  className="rounded-full px-3 py-6 hover:text-green-700"
                  onClick={sendQuery}
                  disabled={isLoading}
                >
                  <Send className="" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Define Skeleton component if not already defined
const Skeletoncomp = ({ className }: { className: string }) => (
  <Skeleton className={` ${className}`} />
);

const SkeletonLoader: React.FC = () => {
  const [visibleSkeletons, setVisibleSkeletons] = useState<number[]>([]);

  useEffect(() => {
    const timerIds: NodeJS.Timeout[] = [];

    // Show each skeleton after a delay
    const showSkeletons = () => {
      const skeletons = [250, 300, 350, 300, 350, 300, 350]; // widths or IDs
      skeletons.forEach((_, index) => {
        timerIds.push(
          setTimeout(() => {
            setVisibleSkeletons((prev) => [...prev, index]);
          }, index * 1000) // Delay each skeleton by 1 second times its index
        );
      });
    };

    showSkeletons();

    // Cleanup timers on unmount
    return () => {
      timerIds.forEach((id) => clearTimeout(id));
    };
  }, []);

  const skeletons = [
    { height: 'h-3', width: 'w-[250px]' },
    { height: 'h-3', width: 'w-[300px]' },
    { height: 'h-3', width: 'w-[350px]' },
    { height: 'h-3', width: 'w-[300px]' },
    { height: 'h-3', width: 'w-[350px]' },
    { height: 'h-3', width: 'w-[300px]' },
    { height: 'h-3', width: 'w-[350px]' },
  ];

  return (
    <div className="space-y-2">
      {skeletons.map((skeleton, index) => (
        <div
          key={index}
          className={visibleSkeletons.includes(index) ? '' : 'hidden'}
        >
          <Skeleton className={`${skeleton.height} ${skeleton.width}`} />
        </div>
      ))}
    </div>
  );
};
