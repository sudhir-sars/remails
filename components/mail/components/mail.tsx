'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccountSwitcher } from './account-switcher';
import { MailDisplay } from './mail-display';
import { MailList } from './mail-list';
import { Nav } from './nav';
import { type Mail } from '../data';
import { useMail } from '../use-mail';
import { IThreads, IThread, IEmail } from './IMail';

interface MailProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];

  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Mail({
  accounts,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mails, setMails] = useState<IThreads>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const hasFetchedEmails = useRef(false); // useRef to track if emails have already been fetched
  const [mail, setMail] = useMail();

  const [selectedNavItem, setSelectedNavItem] = useState('Inbox');

  const [mailDisplaySize, setMailDisplaySize] = useState<number>(0);

  useEffect(() => {
    // if (!hasFetchedEmails.current) {
    const fetchEmail = async () => {
      const token = localStorage.getItem('refreshToken');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      setIsFetching(true);
      try {
        const params = new URLSearchParams({ token });

        if (pageToken) {
          params.append('pageToken', pageToken);
        }

        if (lastFetchTime) {
          params.append(
            'lastFetchTime',
            Math.floor(lastFetchTime / 1000).toString()
          );
        }

        const response = await fetch(
          `http://localhost:3000/api/fetchmail/gmail?${params.toString()}`
        );

        if (response.ok) {
          const responseData = await response.json();

          if (responseData.success) {
            const threads: IThreads = responseData.data;
            console.log(threads);

            setMails((prevMails) => {
              const newMails = [...threads, ...prevMails];
              console.log('New mails:', newMails);
              return newMails;
            });

            setPageToken(responseData.nextPageToken || null);
            setLastFetchTime(responseData.currentFetchTime * 1000); // Convert back to milliseconds
          } else {
            console.error('Error fetching emails:', responseData.error);
          }
        } else {
          console.error('Failed to fetch emails:', response.statusText);
        }
      } catch (err) {
        console.error('Error during email fetch:', err);
      } finally {
        setIsFetching(false);
      }
    };
    //   console.log('Component mounted, fetching emails...');
    fetchEmail();
    // hasFetchedEmails.current = true;
    // console.log('Updated mails:', mails); // Log the updated mails state
    // }
  }, [mails, lastFetchTime, pageToken]); // Add mails to the dependency array

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}`;
          setMailDisplaySize(sizes[2]);
          // console.log(mailDisplaySize);
        }}
        className="h-screen items-stretch   "
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onExpand={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed &&
              'min-w-[50px] transition-all duration-300 ease-in-out'
          )}
        >
          <div
            className={cn(
              'flex h-[52px] items-center justify-center',
              isCollapsed ? 'h-[52px]' : 'px-2'
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={25} minSize={6}>
              <Nav
                selectedNavItem={selectedNavItem}
                setSelectedNavItem={setSelectedNavItem}
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: 'Inbox',
                    label: '128',
                    icon: Inbox,
                    variant: 'default',
                  },
                  {
                    title: 'Drafts',
                    label: '9',
                    icon: File,
                    variant: 'ghost',
                  },
                  {
                    title: 'Sent',
                    label: '',
                    icon: Send,
                    variant: 'ghost',
                  },
                  {
                    title: 'Junk',
                    label: '23',
                    icon: ArchiveX,
                    variant: 'ghost',
                  },
                  {
                    title: 'Trash',
                    label: '',
                    icon: Trash2,
                    variant: 'ghost',
                  },
                  {
                    title: 'Archive',
                    label: '',
                    icon: Archive,
                    variant: 'ghost',
                  },
                ]}
              />
              {/* <Separator /> */}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <Nav
                selectedNavItem={selectedNavItem}
                setSelectedNavItem={setSelectedNavItem}
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: 'Social',
                    label: '972',
                    icon: Users2,
                    variant: 'ghost',
                  },
                  {
                    title: 'Updates',
                    label: '342',
                    icon: AlertCircle,
                    variant: 'ghost',
                  },
                  {
                    title: 'Forums',
                    label: '128',
                    icon: MessagesSquare,
                    variant: 'ghost',
                  },
                  {
                    title: 'Shopping',
                    label: '8',
                    icon: ShoppingCart,
                    variant: 'ghost',
                  },
                  {
                    title: 'Promotions',
                    label: '21',
                    icon: Archive,
                    variant: 'ghost',
                  },
                ]}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
                <TabsTrigger
                  value="spam"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Spam
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList mails={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList
                mails={mails
                  .map((thread) => ({
                    ...thread,
                    threads: thread.threads.filter((email) => !email.read),
                  }))
                  .filter((thread) => thread.threads.length > 0)}
              />
            </TabsContent>
            <TabsContent value="spam" className="m-0">
              <MailList
                mails={mails
                  .map((thread) => ({
                    ...thread,
                    threads: thread.threads.filter(
                      (email) => !email.labels.map((label) => label === 'SPAM')
                    ),
                  }))
                  .filter((thread) => thread.threads.length > 0)}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={25}>
          <MailDisplay
            mailDisplaySize={mailDisplaySize}
            mail={
              mails
                .flatMap((thread) => thread.threads)
                .find((email) => email.id === mail.selected) || null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
