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
import { AccountSwitcher } from './AccountSwitcher';
import { MailDisplay } from './MailDisplay';
import { MailList } from './MailList';
import { Nav } from './nav';
import { type Mail } from '../data';

import { IThreads, IThread, IEmail } from './IMail';
import { LucideIcon } from 'lucide-react';
import { dummyEmail } from '@/constants/dummyMail';

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

interface CustomLabel {
  title: string;
  label: number;
  icon: LucideIcon;
  variant: 'ghost';
}
interface NavLabelCount {
  name: string;
  messagesTotal: number;
}

type CustomLabels = CustomLabel[];
type NavLabelCounts = NavLabelCount[];
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
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const hasFetchedEmails = useRef(false); // useRef to track if emails have already been fetched
  const [mail, setMail] = useState<IEmail>(dummyEmail);
  const [mailListLabel, setMailListLabel] = useState<string>('INBOX');
  const [selectedNavItem, setSelectedNavItem] = useState('Inbox');
  const [mailDisplaySize, setMailDisplaySize] = useState<number>(0);
  const [customLabels, setCustomLabels] = useState<CustomLabels[]>([]);
  const [navLabelCount, setNavLabelCount] = useState<NavLabelCounts>([]);
  const [fetchMore, setFetchMore] = useState<boolean>(true);

  const handleMailListChange = async (label: string) => {
    const item = label.toUpperCase();
    setMailListLabel(item);
  };

  const fetchEmail = async () => {
    if (!fetchMore) {
      return;
    }
    setFetchMore(false);

    const token = localStorage.getItem('refreshToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    try {
      const params = new URLSearchParams({ token });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      // if (lastFetchTime) {
      //   params.append(
      //     'lastFetchTime',
      //     Math.floor(lastFetchTime / 1000).toString()
      //   );
      // }

      const response = await fetch(`api/fetchmail/gmail?${params.toString()}`);

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success) {
          const resThreads: IThreads = responseData.data;
          setNavLabelCount(responseData.labels);

          const combinedThreads = [...resThreads, ...mails];
          const threads = combinedThreads.map((thread) => {
            const sortedEmails = thread.emails.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return { threadId: thread.threadId, emails: sortedEmails };
          });

          setMails(threads);
          localStorage.setItem('nextPageToken', responseData.nextPageToken);
          setPageToken(responseData.nextPageToken || null);
          setLastFetchTime(responseData.currentFetchTime * 1000); // Convert back to milliseconds
          setIsFetching(false);
        } else {
          console.error('Error fetching emails:', responseData.error);
        }
      } else {
        console.error('Failed to fetch emails:', response.statusText);
      }
    } catch (err) {
      console.error('Error during email fetch:', err);
    }
  };
  fetchEmail();

  useEffect(() => {});
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
            <ResizablePanel defaultSize={25} minSize={7}>
              <Nav
                navLabelCount={navLabelCount}
                handleMailListChange={handleMailListChange}
                selectedNavItem={selectedNavItem}
                setSelectedNavItem={setSelectedNavItem}
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: 'Inbox',
                    icon: Inbox,
                    variant: 'default',
                  },
                  {
                    title: 'Drafts',

                    icon: File,
                    variant: 'ghost',
                  },
                  {
                    title: 'Sent',

                    icon: Send,
                    variant: 'ghost',
                  },
                  {
                    title: 'Junk',

                    icon: ArchiveX,
                    variant: 'ghost',
                  },
                  {
                    title: 'Trash',

                    icon: Trash2,
                    variant: 'ghost',
                  },
                  {
                    title: 'Archive',

                    icon: Archive,
                    variant: 'ghost',
                  },
                ]}
              />
              {/* <Separator /> */}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel></ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs
            defaultValue="INBOX"
            onValueChange={(value) => {
              handleMailListChange(value);
            }}
          >
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="INBOX"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="UNREAD"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
                <TabsTrigger
                  value="SPAM"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Spam
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
          </Tabs>
          <div className="mt-2"></div>
          <MailList
            mails={mails.map((thread) => ({
              threadId: thread.threadId,
              emails: thread.emails.filter((email) =>
                email.labels.includes(mailListLabel)
              ),
            }))}
            setFetchMore={setFetchMore}
            setMail={setMail}
            isFetching={isFetching}
            mail={mail}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={35}>
          <MailDisplay mailDisplaySize={mailDisplaySize} mail={mail} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
