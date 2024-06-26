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
  MicIcon,
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

interface NavLabelCount {
  name: string;
  messagesTotal: number;
}
interface IUserLabels {
  title: string;
  personal: boolean;
  labelColor: string;
  domain: boolean;
  personalEmails: string[];
  domainEmails: string[];
  category: string;
}
interface IMailsWithFilter {
  [key: string]: IThreads;
}

type NavLabelCounts = NavLabelCount[];
export function Mail({
  accounts,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mails, setMails] = useState<IThreads>([]);
  const [mailsWithFilter, setMailsWithFilter] = useState<IMailsWithFilter>({
    INBOX: [],
  });

  const [mail, setMail] = useState<IThread>(dummyEmail);
  const [mailListLabel, setMailListLabel] = useState<string>('INBOX');
  const [selectedNavItem, setSelectedNavItem] = useState('INBOX');
  const [mailDisplaySize, setMailDisplaySize] = useState<number>(0);

  const [navLabelCount, setNavLabelCount] = useState<NavLabelCounts>([]);

  const userId = localStorage.getItem('userId');
  const [userLabels, setUserLabels] = useState<IUserLabels[]>([]);

  const [checkForNewMail, setCheckForNewMail] = useState(false);
  const [checkForOldMail, setCheckForOldMail] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const handleMailListChange = async (label: string) => {
    const item = label.toUpperCase();
    setMailListLabel(item);
  };
  const [userFilterActive, setUserFilterActive] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [userLabelFilter, setUserLabelFilter] = useState<string[]>([]);

  useEffect(() => {
    const defaultCategories = [
      'INBOX',
      'DRAFTS',
      'SENT',
      'JUNK',
      'TRASH',
      'ARCHIVE',
    ];
    const newMailsWithFilter: IMailsWithFilter = {};

    // Filter for default categories
    defaultCategories.forEach((category) => {
      newMailsWithFilter[category] = mails
        .map((thread) => ({
          threadId: thread.threadId,
          emails: thread.emails.filter((email) =>
            email.labels.includes(category)
          ),
        }))
        .filter((thread) => thread.emails.length > 0); // Only keep threads with emails
    });

    if (userLabels.length > 0) {
      userLabels.forEach((label) => {
        const userLabelFilter = label.personal
          ? label.personalEmails
          : label.domainEmails;
        const category = label.personal ? 'PERSONAL' : 'DOMAIN';

        newMailsWithFilter[label.title.toUpperCase()] = mails
          .map((thread) => ({
            threadId: thread.threadId,
            emails: thread.emails.filter((email) => {
              if (category === 'PERSONAL') {
                return userLabelFilter.includes(email.email);
              } else if (category === 'DOMAIN') {
                const domain = (email.email.match(
                  /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
                ) || [''])[0].substring(1);
                return userLabelFilter.includes(domain);
              }
              return false;
            }),
          }))
          .filter((thread) => thread.emails.length > 0); // Only keep threads with emails
      });
    }

    setMailsWithFilter(newMailsWithFilter);
  }, [mails]);

  function sortMails(threads: IThreads): IThreads {
    // Sort emails within each thread by date descending
    threads.forEach((thread) => {
      thread.emails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    // Sort threads by the highest date within each thread
    threads.sort((a, b) => {
      const dateA = new Date(a.emails[0].date).getTime();
      const dateB = new Date(b.emails[0].date).getTime();
      return dateB - dateA;
    });

    return threads;
  }

  const fetchEmail = async () => {
    console.log('old: ' + checkForOldMail);
    console.log('new: ' + checkForNewMail);
    if (checkForNewMail) {
      console.log('fetching for New');
    }
    if (checkForOldMail) {
      console.log('fetching for Old');
    }

    const token = localStorage.getItem('refreshToken');

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    try {
      const params = new URLSearchParams({ token });

      if (checkForOldMail) {
        const nextPageToken = localStorage.getItem('nextPageToken');
        if (nextPageToken) {
          params.append('pageToken', nextPageToken);
        } else {
          console.log('no page token found aborting fetch Old');
          return;
        }
      } else if (checkForNewMail) {
        const lastFetchTime = localStorage.getItem('lastFetchTime');

        if (lastFetchTime) {
          params.append(
            'lastFetchTime',
            Math.floor(parseInt(lastFetchTime) / 1000).toString()
          );
        } else {
          console.log('no lastFetchTime found aborting fetch New');
          return;
        }
      }

      console.log(params);

      const response = await fetch(`api/fetchmail/gmail?${params.toString()}`);

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success) {
          const resThreads: IThreads = responseData.data;

          setNavLabelCount(responseData.labels);

          const sortedMails = sortMails([...mails, ...resThreads]);

          setMails(sortedMails);

          if (!checkForNewMail) {
            localStorage.setItem('nextPageToken', responseData.nextPageToken);
          }
          if (!checkForOldMail) {
            if (
              mails.length > 0 &&
              mails[0].emails.length > 0 &&
              mails[0].emails[0].date
            ) {
              const isoString: string = mails[0].emails[0].date;
              const date: Date = new Date(isoString);
              const milliseconds: number = date.getTime();
              localStorage.setItem('lastFetchTime', `${milliseconds}`);
              console.log(milliseconds);
            }
          }

          if (!checkForNewMail && !checkForOldMail) {
            localStorage.setItem('nextPageToken', responseData.nextPageToken);
            localStorage.setItem(
              'lastFetchTime',
              `${responseData.currentFetchTime * 1000}`
            );
          }

          setIsFetching(false);
          if (checkForNewMail) {
            setCheckForNewMail(false);
          } else if (checkForOldMail) {
            setCheckForOldMail(false);
          }
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

  const fetchUserLabels = async () => {
    try {
      const response = await fetch(`/api/userData/labels?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }

      const resData = await response.json();

      if (resData.success) {
        setUserLabels(resData.data.labels);
      } else {
        console.log('Failed to fetch labels');
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };
  const fetchUserLabelsIcons = async () => {
    try {
      await Promise.all(
        userLabels.map(async (label) => {
          if (label.domain) {
            await Promise.all(
              label.domainEmails.map(async (domain) => {
                try {
                  const response = await fetch(
                    `https://logo.clearbit.com/${domain}`
                  );
                  if (response.ok) {
                    console.log('sucessfully fetched icons');
                    label.icon = response.url;
                  } else {
                    throw new Error(`Failed to fetch icon for ${domain}`);
                  }
                } catch (error) {
                  console.error(`Error fetching icon for ${domain}:`, error);
                }
              })
            );
          }
        })
      );
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  };

  // console.log(userLabels);

  useEffect(() => {
    setIsFetching(true);
    fetchEmail();

    fetchUserLabels();
  }, []);

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
        className="h-full  w-full "
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
                setUserLabels={setUserLabels}
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
            <ResizablePanel>
              <Nav
                navLabelCount={navLabelCount}
                handleMailListChange={handleMailListChange}
                selectedNavItem={selectedNavItem}
                setSelectedNavItem={setSelectedNavItem}
                isCollapsed={isCollapsed}
                userLabels={userLabels}
                setUserLabels={setUserLabels}
              />
            </ResizablePanel>
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
            mails={mailsWithFilter[selectedNavItem] || mails}
            userLabels={userLabels}
            setMail={setMail}
            mail={mail}
            checkForNewMail={checkForNewMail}
            setCheckForNewMail={setCheckForNewMail}
            fetchEmail={fetchEmail}
            setCheckForOldMail={setCheckForOldMail}
            checkForOldMail={checkForOldMail}
            isFetching={isFetching}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={35}>
          <MailDisplay
            mailDisplaySize={mailDisplaySize}
            mail={mail.emails[0]}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
