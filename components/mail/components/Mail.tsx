'use client';

import React, { useEffect, useState, useRef } from 'react';
import jwt from 'jsonwebtoken';
import { RiSpam2Line } from 'react-icons/ri';
import TopLoadingBar from 'react-top-loading-bar';
import { markAsRead, createLabel } from '@/utils/mail/operation';
import {
  Users,
  Megaphone,
  ShieldAlert,
  ShieldOff,
  Inbox,
  MessageSquareDot,
  Send,
  FileMinus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
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

import MailDisplay from './MailDisplay';
import MailList from './MailList';
import { Nav } from './nav';
import { IEmail, IEmails } from './IMail';
import { dummyEmail } from '@/constants/dummyMail';
import dynamicLogo1 from '@/constants/DynamicLogo1.png';
import Image from 'next/image';
import FloatingBubble from './FloatingBubble';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';
import { toast } from 'sonner';
import ViewInFullMode from './ViewInFullMode';
import AiLogo from '@/constants/AiLogo.png';
import {
  ICreateLabelApiRes,
  IFrontendLabel,
  IGmailApiLabel,
  ISystemLabels,
} from '@/utils/mail/types';
import { IFetchDataHistory } from '@/utils/mail/types';
import { setInterval } from 'timers/promises';
import { INotification } from '@/utils/mail/types';
interface MailProps {
  setNotificationEmails: React.Dispatch<React.SetStateAction<INotification[]>>;
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  defaultLayout: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  watchDogHistoryId: string;
}

interface INavLabelCounts {
  name: string;
  count: number;
  labelId: string;
}

import { IUserLabels } from '@/utils/mail/types';

export type ICategory = {
  [key: string]: IEmail;
};

export type IMailsWithFilter = {
  [key: string]: ICategory;
};

import { useTheme } from 'next-themes';
import { IHyperxMessage } from './IMail';
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;
import { IAddress } from './IMail';
import HyperX from './HyperX';
const Mail: React.FC<MailProps> = ({
  setNotificationEmails,
  watchDogHistoryId,
  accounts,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}) => {
  const [showAddBuckerDialog, setShowAddBuckerDialog] = useState(false);
  const userId = localStorage.getItem('userId');

  const fetchEmailByHistoryController = useRef<AbortController | null>(null);
  const fetchEmailController = useRef<AbortController | null>(null);

  const [userLabelFlag, setUserLabelFlag] = useState(false);

  const [replyModuleTempMail, setReplyModuleTempMail] =
    useState<IEmail>(dummyEmail);

  const [floatingTempMail, setFloatingTempMail] = useState<IEmail>(dummyEmail);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [paginationDisabled, setPaginationDisabled] = useState(false);
  const [totalEmails, setTotalEmails] = useState<number>(100);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mails, setMails] = useState<IMailsWithFilter>({});
  const [mailsWithFilter, setMailsWithFilter] = useState<IMailsWithFilter>({});
  const [mailsWithSearchFilter, setMailsWithSearchFilter] =
    useState<IMailsWithFilter>({});
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [mail, setMail] = useState<IEmail>(dummyEmail);
  const [mailListLabel, setMailListLabel] = useState<string>('INBOX');
  const [selectedNavItem, setSelectedNavItem] = useState('INBOX');
  const [navLabelCount, setNavLabelCount] = useState<INavLabelCounts[]>([]);
  const [userLabels, setUserLabels] = useState<IUserLabels[]>([]);
  const [checkForNewMail, setCheckForNewMail] = useState(false);
  const [checkForOldMail, setCheckForOldMail] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [filteredMails, setFilteredMails] = useState<IEmail | null>(null);

  const [userLabelId, setUserLabelId] = useState('');
  const [isSuggestableNotSet, setIsSuggestableNotSet] = useState(true);
  const [standAloneNotification, setStandAloneNotification] = useState('');
  const [fetchDataHistory, setFetchDataHistory] = useState<IFetchDataHistory>(
    {}
  );
  const [fuckingInitailFetched, setFuckingInitailFetched] = useState('false');
  const [mailListLabelId, setMailListLabelId] = useState<string>('INBOX');
  const [userLabelEmails, setUserLabelEmails] = useState<string>('');
  const [userLabelEmailAddressType, setUserLabelEmailAddressType] = useState<
    'personal' | 'domain'
  >('personal');
  const [rightPaginationDisabled, setRightPaginationDisabled] = useState(false);
  const [firstFetch, setFirstFetch] = useState<boolean>(true);
  const [criticalLabelsIdMapping, setCriticalLabelsIdMapping] = useState<{
    [key: string]: string;
  }>({});
  const topLoadingBarRef = useRef<any>(null);
  const viewInFullModeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dndReplyRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({
    x: window.innerWidth - 40,
    y: 70,
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [isPaginationVisible, setIsPaginationVisible] =
    useState<boolean>(false);
  const [paginationTimeout, setPaginationTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const mailListRef = useRef<HTMLDivElement>(null);

  const [historyId, setHistoryId] = useState<string>('');
  const [replyModuleVisibility, setReplyModuleVisibility] =
    useState<boolean>(false);
  const [unMountreplyModule, setUnMountReplyModule] = useState<boolean>(true);
  const { theme } = useTheme();
  const [isHyperXOpen, setIsHyperXOpen] = useState(false);
  const [hyperxMessage, setHyperxMessage] = useState<IHyperxMessage[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [triggerForcedPagination, setTriggerForcedPagination] =
    useState<boolean>(false);

  const [suggestableMails, setSuggestableMails] = useState<IAddress[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
        const { data } = await response.json();
        const fetchedUserAddress = data;
        console.log(fetchedUserAddress);
        setSuggestableMails([
          // ...fetchedUserAddress.fromAddresses,
          // ...fetchedUserAddress.toAddresses,
          ...fetchedUserAddress.metaAddresses,
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const defaultCategories = navLabelCount.map((label) => label.name);
    const newMailsWithFilter: IMailsWithFilter = {};
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    defaultCategories.forEach((category) => {
      newMailsWithFilter[category] = Object.fromEntries(
        Object.entries(mails[category] || {}).slice(startIndex, endIndex)
      );
    });

    userLabels.forEach((label) => {
      newMailsWithFilter[label.title] = Object.fromEntries(
        Object.entries(mails[label.title] || {}).slice(startIndex, endIndex)
      );
    });

    setMailsWithFilter(newMailsWithFilter);
    setIsPaginationVisible(true);
    setIsFetching(false);
  }, [mails, currentPage, navLabelCount, userLabels, triggerForcedPagination]);

  useEffect(() => {
    setIsFetching(true);
    initailFetchData();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  const handleMailListChange = async (
    labelName: string,
    labelId: string,
    userLabelFlag: boolean,
    emailAddress?: string
  ) => {
    if (isFetching) {
      return;
    }
    console.log(fetchDataHistory);
    setIsSearchActive(false);
    setOpen(false);
    setRightPaginationDisabled(false);
    if (fuckingInitailFetched === 'false') return;
    setTotalEmails(fetchDataHistory[labelName]?.totalEmails);
    setMailListLabelId(labelId);
    if (userLabelFlag && emailAddress) {
      setUserLabelFlag(true);
      setUserLabelEmails(emailAddress);
    }
    setMailListLabel(labelName);
    setCurrentPage(1);

    let tempFetchDataHistory = fetchDataHistory;
    if (!fetchDataHistory[labelName]) {
      tempFetchDataHistory[labelName] = {
        labelId,
        pageToken: undefined,
        initialFetched: 'notFetched',
        lastFetchedPage: 0,
        totalEmails: 0,
      };
    }

    if (
      userLabelFlag &&
      tempFetchDataHistory[labelName].initialFetched === 'notFetched'
    ) {
      await fetchEmail('emailAddressFetch', labelId, labelName, emailAddress);
      tempFetchDataHistory[labelName].initialFetched = 'fetched';
      tempFetchDataHistory[labelName].lastFetchedPage = 1;
      if (!fetchDataHistory[labelName].pageToken) setPaginationDisabled(true);
      tempFetchDataHistory[labelName].totalEmails = 999999;
      setFetchDataHistory(tempFetchDataHistory);
      setTotalEmails(805488);
      return;
    } else if (fetchDataHistory[labelName].initialFetched === 'notFetched') {
      await fetchEmail('generic', labelId, labelName);
      tempFetchDataHistory[labelName].initialFetched = 'fetched';
      tempFetchDataHistory[labelName].lastFetchedPage = 1;
      setFetchDataHistory(tempFetchDataHistory);
      setCurrentPage(1);
      setTotalEmails(fetchDataHistory[labelName].totalEmails);
      return;
    }
  };

  const handlePageChange = async (newPage: number) => {
    setPaginationDisabled(true);
    setRightPaginationDisabled(false);
    setCurrentPage(newPage);

    let tempFetchDataHistory = fetchDataHistory;
    const { pageToken, lastFetchedPage } = fetchDataHistory[mailListLabel];
    if (pageToken && newPage > lastFetchedPage) {
      if (userLabelFlag && userLabelEmails) {
        await fetchEmail(
          'emailAddressFetch',
          mailListLabelId,
          mailListLabel,
          userLabelEmails
        );
      } else {
        await fetchEmail('generic', mailListLabelId, mailListLabel);
      }
      tempFetchDataHistory[mailListLabel].lastFetchedPage = newPage;
      setFetchDataHistory(tempFetchDataHistory);
    }
    if (!fetchDataHistory[mailListLabel].pageToken) {
      setTotalEmails(805488);
      setRightPaginationDisabled(true);
    }
    setPaginationDisabled(false);
  };

  const fetchEmail = async (
    fetchType: 'emailAddressFetch' | 'generic',
    labelId: string,
    labelName: string,
    emailAddress?: string
  ) => {
    setIsFetching(true);
    setPaginationDisabled(true);
    startLoading();

    if (fetchEmailController.current) {
      fetchEmailController.current.abort();
    }

    const controller = new AbortController();
    fetchEmailController.current = controller;

    const token = localStorage.getItem('refreshToken');
    if (!token) {
      finishLoading();
      window.location.href = '/signup';
      return;
    }

    try {
      const params = new URLSearchParams({ token });
      if (fetchDataHistory[labelName]?.pageToken)
        params.append('pageToken', fetchDataHistory[labelName].pageToken);
      if (fetchType !== 'emailAddressFetch') params.append('labelId', labelId);
      else if (fetchType === 'emailAddressFetch' && emailAddress)
        params.append('sender', emailAddress);

      const response = await fetch(`api/fetchmail/gmail?${params.toString()}`, {
        signal: controller.signal,
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          handleEmailFetchSuccess(responseData, labelName);
        } else {
          console.error('Error fetching emails:', responseData.error);
          setIsFetching(false);
          finishLoading();
        }
      } else {
        console.error('Failed to fetch emails:', response.statusText);
        setIsFetching(false);
        finishLoading();
      }
    } catch (error: unknown) {
      handleFetchEmailError(error);
    }
  };

  const handleEmailFetchSuccess = (responseData: any, labelName: string) => {
    setNavLabelCount(responseData.labelCounts);
    let tempFetchDataHistory = fetchDataHistory;

    if (firstFetch) {
      responseData.labelCounts.forEach((label: INavLabelCounts) => {
        tempFetchDataHistory[label.name] = {
          labelId: label.labelId,
          pageToken: undefined,
          initialFetched: 'notFetched',
          lastFetchedPage: 0,
          totalEmails: label.count,
        };
      });

      const requiredLabels = new Set([
        'Critical',
        'Urgent',
        'Routinal',
        'Hold',
      ]);
      const existingLabels = new Set(
        responseData.labelCounts.map((label: INavLabelCounts) => label.name)
      );

      const tempCriticalLabelsIdMapping: { [key: string]: string } = {};
      const missingLabels = [...requiredLabels].filter((label) => {
        if (existingLabels.has(label)) {
          const existingLabelData: INavLabelCounts =
            responseData.labelCounts.find(
              (l: INavLabelCounts) => l.name === label
            );
          tempCriticalLabelsIdMapping[existingLabelData.labelId] =
            existingLabelData.name;
          return false;
        }
        return true;
      });

      if (missingLabels.length > 0)
        createMissingLabels(
          missingLabels,
          tempFetchDataHistory,
          tempCriticalLabelsIdMapping
        );
      setTotalEmails(tempFetchDataHistory[labelName].totalEmails);
      setCriticalLabelsIdMapping(tempCriticalLabelsIdMapping);
    }

    const resEmails: ICategory = responseData.data;
    tempFetchDataHistory[labelName].pageToken = responseData.nextPageToken;

    setMails((prevMails) => {
      const updatedMails = {
        ...prevMails,
        [labelName]: { ...prevMails[labelName], ...resEmails },
      };
      return updatedMails;
    });

    setFetchDataHistory(tempFetchDataHistory);
    setFirstFetch(false);

    finishLoading();
    setPaginationDisabled(false);
    setFuckingInitailFetched('true');
  };

  const createMissingLabels = async (
    missingLabels: string[],
    tempFetchDataHistory: any,
    tempCriticalLabelsIdMapping: { [key: string]: string }
  ) => {
    for (const missingLabel of missingLabels) {
      try {
        const result = await createLabel(missingLabel);
        if (result.success) {
          tempFetchDataHistory[missingLabel] = {
            labelId: result.response.data.id,
            pageToken: undefined,
            initialFetched: 'notFetched',
            lastFetchedPage: 0,
            totalEmails: 0,
          };
          tempCriticalLabelsIdMapping[result.response.data.id] = missingLabel;
        } else {
          throw new Error('Label creation failed');
        }
      } catch (error) {
        window.location.href = '/signup';
      }
    }
  };

  const handleFetchEmailError = (error: unknown) => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') console.log('Fetch was aborted');
      else {
        console.error('Error during email fetch:', error);
        window.location.href = '/signup';
      }
    } else {
      console.error('An unknown error occurred:', error);
      window.location.href = '/signup';
    }
    setIsFetching(false);
    finishLoading();
  };

  const fetchEmailByHistory = async (newHistoryId: string) => {
    if (fetchEmailByHistoryController.current) {
      fetchEmailByHistoryController.current.abort();
    }

    const controller = new AbortController();
    fetchEmailByHistoryController.current = controller;

    const token = localStorage.getItem('refreshToken');
    if (!token) {
      finishLoading();
      window.location.href = '/signup';
      return;
    }

    try {
      const params = new URLSearchParams({ token });
      params.append('newHistoryId', newHistoryId);
      params.append('userId', userId!);

      const response = await fetch(
        `api/gmail/watchDogFetcher?${params.toString()}`,
        { signal: controller.signal }
      );

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          const resThreads: IEmails = responseData.data;
          const emailData: IEmails = [];

          if (resThreads.length > 0) {
            resThreads.forEach((email) => {
              emailData.push(email);
            });

            // setNotificationEmails(emailData);

            // Prepend new emails to the existing mails state
            const newNotifications: INotification[] = [];

            setMails((prevMails) => {
              // Create a new updated mails object
              const updatedMails = { ...prevMails };

              resThreads.forEach((email) => {
                console.log(resThreads);
                const sender = email.name || email.email;
                const subject = email.snippet || 'No subject';
                const notification: INotification = {
                  id: email.id,
                  title: 'New Email Received',
                  description: `You have received a new email from ${sender}: ${subject}`,
                  type: 'gmail', // or 'admin'/'system' based on your needs
                };
                newNotifications.push(notification);

                // Determine if the toast should be shown based on the presence of 'SENT'

                if (!email.labels.includes('SENT')) {
                  showNewMailToast(sender, subject);
                }

                email.labels.forEach((label) => {
                  // Update the emails for this label
                  if (updatedMails[label]) {
                    // Prepend new email to the beginning of the array for the label
                    updatedMails[label] = {
                      [email.id]: email,
                      ...updatedMails[label],
                    };
                  } else {
                    // Initialize the label with the new email
                    updatedMails[label] = { [email.id]: email };
                  }
                });
              });

              return updatedMails;
            });
            setNotificationEmails(newNotifications);

            setNavLabelCount(responseData.labelCounts);
          } else {
            console.error('No new emails to process');
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
      if (!response.ok) console.log('error in fetch labels');

      const resData = await response.json();
      if (resData.success) handleFetchUserLabelsSuccess(resData.data.labels);
      else console.log('Failed to fetch labels');
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const handleFetchUserLabelsSuccess = (labels: any) => {
    const temPUserLabels = labels;
    temPUserLabels.forEach(async (label: any) => {
      if (label.domain) {
        label.domainEmails.forEach(async (domain: any) => {
          label.icon = `https://logo.clearbit.com/${domain}`;
        });
      }
    });
    let tempFetchDataHistory = fetchDataHistory;
    temPUserLabels.forEach((label: IUserLabels) => {
      tempFetchDataHistory[label.title] = {
        labelId: label.title,
        pageToken: undefined,
        initialFetched: 'notFetched',
        lastFetchedPage: 0,
        totalEmails: 999999999,
      };
    });
    setFetchDataHistory(tempFetchDataHistory);
    setUserLabels(temPUserLabels);
  };

  const initailFetchData = async () => {
    await fetchUserLabels();
    fetchEmail('generic', 'INBOX', 'INBOX');
  };

  const startLoading = () => topLoadingBarRef.current?.continuousStart(0);
  const finishLoading = () => topLoadingBarRef.current?.complete();

  const handleMouseEnter = () => {
    const timeoutId = setTimeout(() => setIsPaginationVisible(true), 200);
    setPaginationTimeout(timeoutId);
    if (hideTimeout) {
      setHideTimeout(null);
      clearTimeout(hideTimeout);
    }
  };

  const handleMouseLeave = () => {
    const timeoutId = setTimeout(() => setIsPaginationVisible(false), 5000);
    setHideTimeout(timeoutId);
    if (paginationTimeout) {
      setPaginationTimeout(null);
      clearTimeout(paginationTimeout);
    }
  };

  const showNewMailToast = (sender: string, subject: string) => {
    toast.success(`New mail from: ${sender}`, {
      description: ` Subject: ${subject}`,
      duration: 10000,
      position: 'top-right',
      closeButton: true,
    });
  };
  const [navLabelNames, setNavLabelNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (navLabelCount) {
      navLabelCount.forEach((label) => {
        navLabelNames.add(label.labelId);
        navLabelNames.add(label.name);
      });
    }
  }, [navLabelCount]);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_WEB_SOCKET_URI}`);
    socket.on('connect', () => {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');

      socket.emit('registerUser', { userId, username, email });
    });

    socket.on('userDisconnected', (userId: string) => {
      console.log(`User ${userId} has disconnected`);
      toast.info(`User ${userId} has disconnected`, {
        position: 'top-right',
        closeButton: true,
      });

      // Clear local storage
      localStorage.clear();

      // Redirect after 5 seconds
      setTimeout(() => {
        window.location.href = '/signup'; // Redirect to the home page
      }, 5000);
    });

    socket.on('broadcastMessage', (message: string) => {
      const notification: INotification = {
        id: Date.now().toString(),
        title: 'New message from admin',
        description: message,
        type: 'admin',
      };

      setNotificationEmails((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]);

      toast.success(notification.title, {
        description: notification.description,
        position: 'top-right',
        closeButton: true,
      });
    });

    socket.on('newEmail', (notification: any) => {
      console.log(notification);
      fetchEmailByHistory(notification.newHistoryId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <ViewInFullMode
        mailsBigData={mails}
        setMailsBigData={setMails}
        mail={mail}
        viewInFullModeRef={viewInFullModeRef}
      />
      <TopLoadingBar
        color={theme === 'dark' ? '#FFFFFF' : '#000000'}
        height={theme === 'dark' ? 2 : 3}
        style={{ borderRadius: '0 10px 10px 0' }}
        ref={topLoadingBarRef}
        shadow
      />
      <TooltipProvider delayDuration={0}>
        <div ref={dndReplyRef} className="relative">
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
            }}
            className="overflow-x-scroll overflow-y-scroll bg-[#faf9f8] shadow-inner dark:bg-background "
          >
            <ResizablePanel
              defaultSize={defaultLayout[0]}
              collapsedSize={navCollapsedSize}
              collapsible
              minSize={13}
              maxSize={15}
              onCollapse={() => {
                setIsCollapsed(true);
                document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
              }}
              onExpand={() => {
                setIsCollapsed(false);
                document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
              }}
              className={cn(
                isCollapsed &&
                  'min-w-[50px] transition-all  duration-300 ease-in-out'
              )}
            >
              <div className="my-2">
                {isCollapsed ? (
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8">
                      <img src={dynamicLogo1.src} alt="dynamic logo" />
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4 items-center justify-start">
                    <div className="text-xl font-bold ml-6">Remails</div>
                    <div className="flex items-center justify-center mt-[0.15rem] space-x-3">
                      <ThemeToggle />
                    </div>
                  </div>
                )}
              </div>

              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={25} minSize={7} maxSize={26}>
                  <Nav
                    setMailsWithFilter={setMailsWithFilter}
                    suggestableMails={suggestableMails}
                    setShowDialog={setShowAddBuckerDialog}
                    showDialog={showAddBuckerDialog}
                    setFetchDataHistory={setFetchDataHistory}
                    fetchDataHistory={fetchDataHistory}
                    mailsWithFilter={mailsWithFilter}
                    navLabelCount={navLabelCount}
                    handleMailListChange={handleMailListChange}
                    selectedNavItem={selectedNavItem}
                    setSelectedNavItem={setSelectedNavItem}
                    isCollapsed={isCollapsed}
                    setUserLabels={setUserLabels}
                    userLabels={userLabels}
                    mailListLabel={mailListLabel}
                    links={[
                      {
                        title: 'Inbox',
                        label: 'INBOX',
                        icon: Inbox,
                        variant: 'default',
                      },
                      {
                        title: 'Important',
                        label: 'IMPORTANT',
                        icon: ShieldAlert,
                        variant: 'default',
                      },
                      {
                        title: 'Starred',
                        icon: Star,
                        label: 'STARRED',
                        variant: 'ghost',
                      },
                      {
                        title: 'Sent',
                        icon: Send,
                        label: 'SENT',
                        variant: 'ghost',
                      },
                      {
                        title: 'Spam',
                        icon: ShieldOff,
                        label: 'SPAM',
                        variant: 'ghost',
                      },
                      {
                        title: 'Trash',
                        icon: Trash2,
                        label: 'TRASH',
                        variant: 'ghost',
                      },
                      {
                        title: 'Social',
                        icon: Users,
                        label: 'CATEGORY_SOCIAL',
                        variant: 'ghost',
                      },
                      {
                        title: 'Promotions',
                        label: 'CATEGORY_PROMOTIONS',
                        icon: Megaphone,
                        variant: 'ghost',
                      },
                    ]}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={40}>
              <div className="relative">
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className={`
                  z-50 absolute top-0 h-[3.25rem] w-full shadow-lg pt-2 pb-2 border-border/40 bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/5
                  ${open ? 'h-[3.9rem]' : ''}
                  `}
                >
                  <div
                    className={`flex items-center ${open ? 'justify-center' : 'justify-end'}`}
                  >
                    {isPaginationVisible && !open && (
                      <div
                        className={`flex items-center justify-start mx-3 w-44`}
                      >
                        <div className="flex items-center justify-start space-x-[0.1rem] pr-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRightPaginationDisabled(false);
                              handlePageChange(currentPage - 1);
                            }}
                            disabled={currentPage === 1 || paginationDisabled}
                            className="px-2 rounded-full hover:bg-border"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={
                              paginationDisabled ||
                              indexOfLastItem >= totalEmails ||
                              (Object.keys(
                                mailsWithFilter?.[mailListLabel] || {}
                              ).length +
                                indexOfFirstItem) %
                                10 !==
                                0
                            }
                            className="px-2 rounded-full hover:bg-border"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex text-nowrap text-xs text-muted-foreground w-auto">
                          {indexOfFirstItem + 1}-
                          {Math.min(
                            indexOfLastItem,
                            totalEmails,
                            Object.keys(mailsWithFilter?.[mailListLabel] || {})
                              .length
                          ) + indexOfFirstItem}{' '}
                          of{' '}
                          {!navLabelNames.has(mailListLabel)
                            ? 'Many'
                            : totalEmails}
                        </div>
                      </div>
                    )}
                    <div
                      className={`w-[80%] ${!open ? 'hidden' : ''}`}
                      ref={wrapperRef}
                    >
                      <div className="">
                        <SearchBar
                          mailsBigData={mails}
                          setMailsBigData={setMails}
                          hyperxMessage={hyperxMessage}
                          setHyperxMessage={setHyperxMessage}
                          suggestableMails={suggestableMails}
                          mailListLabel={mailListLabel}
                          setMailsWithSearchFilter={setMailsWithSearchFilter}
                          mailsWithSearchFilter={mailsWithSearchFilter}
                          isSearchActive={isSearchActive}
                          mailsWithFilter={mailsWithFilter}
                          setIsSearchActive={setIsSearchActive}
                          isOpen={open}
                          setIsOpen={setOpen}
                        />
                      </div>
                    </div>

                    {!open && (
                      <>
                        <div className="shadow-inner-all rounded-lg mr-2">
                          <div className=" h-8  flex items-center justify-center  border-none cursor-pointer border rounded-lg hover:bg-transparent shadow-none bg-transparent">
                            <div className="text-sm flex items-center justify-center font-normal text-muted-foreground text-nowrap w-44 bg-transparent">
                              <div
                                onClick={() => setOpen(true)}
                                className="h-full w-full pl-5 "
                              >
                                Search...{' '}
                              </div>
                              <div className="  ml-auto items-center">
                                <span className="text-xs">
                                  <div
                                    onClick={() =>
                                      setIsHyperXOpen(!isHyperXOpen)
                                    }
                                    className="w-10 pr-2 flex items-center justify-center cursor-pointer"
                                  >
                                    <img
                                      src={AiLogo.src}
                                      alt="AI Logo"
                                      height={18}
                                      width={18}
                                    />
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Tabs
                          defaultValue="INBOX"
                          onValueChange={(value) =>
                            handleMailListChange(value, value, false)
                          }
                        >
                          <TabsList className="ml-auto shadow-inner-all dark:bg-transparent">
                            <TabsTrigger value="INBOX">Primary</TabsTrigger>
                            <TabsTrigger value="UNREAD">Unread</TabsTrigger>
                            <TabsTrigger value="SPAM" className="">
                              Spam
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </>
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-0 h-4 w-4 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/50"></div>
                  <div className="bg-transparent -bottom-4 left-0 rounded-tl-[11px] absolute shadow-[inset_2px_2px_4px_0_rgba(0,0,0,0.1)] h-4 w-4" />
                  <div className="absolute -bottom-4 right-0 h-4 w-4 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-background/50"></div>
                  <div className="bg-transparent -bottom-4 right-0 rounded-tr-[11px] absolute shadow-[inset_-2px_2px_4px_0_rgba(0,0,0,0.1)] h-4 w-4" />
                </div>

                <MailList
                  triggerForcedPagination={triggerForcedPagination}
                  setTriggerForcedPagination={setTriggerForcedPagination}
                  unMountreplyModule={unMountreplyModule}
                  setUnMountReplyModule={setUnMountReplyModule}
                  criticalLabelsIdMapping={criticalLabelsIdMapping}
                  mailListLabel={mailListLabel}
                  setReplyModuleTempMail={setReplyModuleTempMail}
                  replyModuleTempMail={replyModuleTempMail}
                  fetchDataHistory={fetchDataHistory}
                  setFetchDataHistory={setFetchDataHistory}
                  mailsBigData={mails}
                  setMailsBigData={setMails}
                  setShowAddBuckerDialog={setShowAddBuckerDialog}
                  showAddBuckerDialog={showAddBuckerDialog}
                  replyModuleVisibility={replyModuleVisibility}
                  setReplyModuleVisibility={setReplyModuleVisibility}
                  viewInFullModeRef={viewInFullModeRef}
                  mails={
                    isSearchActive
                      ? mailsWithSearchFilter['SEARCH_RESULTS']
                      : mailsWithFilter[mailListLabel]
                  }
                  userLabels={userLabels}
                  setMail={setMail}
                  mail={mail}
                  checkForNewMail={checkForNewMail}
                  setCheckForNewMail={setCheckForNewMail}
                  setCheckForOldMail={setCheckForOldMail}
                  checkForOldMail={checkForOldMail}
                  isFetching={isFetching}
                  mailListRef={mailListRef}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={defaultLayout[2]} minSize={45}>
              <MailDisplay
                floatingTempMail={floatingTempMail}
                mailsBigData={mails}
                setMailsBigData={setMails}
                setReplyModuleVisibility={setReplyModuleVisibility}
                replyModuleVisibility={replyModuleVisibility}
                setUnMountReplyModule={setUnMountReplyModule}
                unMountreplyModule={unMountreplyModule}
                suggestableMails={suggestableMails}
                mailListRef={mailListRef}
                isMinimized={isMinimized}
                setIsMinimized={setIsMinimized}
                dndReplyRef={dndReplyRef}
                mail={mail}
                setFloatingTempMail={setFloatingTempMail}
                setReplyModuleTempMail={setReplyModuleTempMail}
                replyModuleTempMail={replyModuleTempMail}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {!unMountreplyModule && (
          <FloatingBubble
            setReplyModuleTempMail={setReplyModuleTempMail}
            replyModuleTempMail={replyModuleTempMail}
            replyModuleVisibility={replyModuleVisibility}
            setReplyModuleVisibility={setReplyModuleVisibility}
            dndReplyRef={dndReplyRef}
            bubblePosition={bubblePosition!}
            setBubblePosition={setBubblePosition}
            floatingTempMail={floatingTempMail}
            setFloatingTempMail={setFloatingTempMail}
          />
        )}
      </TooltipProvider>
      <HyperX
        mailsBigData={mails}
        setMailsBigData={setMails}
        isOpen={isHyperXOpen}
        setIsOpen={setIsHyperXOpen}
        messages={hyperxMessage}
        setMessages={setHyperxMessage}
      />
    </>
  );
};

export default Mail;
