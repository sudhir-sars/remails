'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import styled, { keyframes } from 'styled-components';
import dummyAvatar from '../../constants/dummyAvatar.png';
import avatarImages from '@/constants/avatars/exporter';
import notificationIcon from '@/constants/notificationIcon.png';
import { IEmails } from '../mail/components/IMail';
import { X, Archive, Upload, Bell, Mail, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
type NotificationType = 'admin' | 'gmail' | 'system';

interface INotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
}

interface INavBar {
  notificationEmails: INotification[];
}

interface NotificationProps {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  onClose: (id: string) => void;
  onArchive: (id: string) => void;
  isExpanded: boolean;
  index: number;
  totalCount: number;
  style?: React.CSSProperties;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  description,
  type,
  onClose,
  onArchive,
  isExpanded,
  index,
  totalCount,
  style,
}) => {
  const variants = {
    collapsed: { y: `${index * 8}px`, zIndex: totalCount - index },
    expanded: { y: `${index * (82 + 8)}px`, zIndex: totalCount - index },
  };

  const getIcon = () => {
    switch (type) {
      case 'admin':
        return <Bell size={25} className="text-blue-500" />;
      case 'gmail':
        return <Mail size={25} className="text-red-500" />;
      case 'system':
        return <Cog size={25} className="text-green-500" />;
    }
  };

  return (
    <motion.div
      initial="collapsed"
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={variants}
      transition={{ type: 'spring', stiffness: 500, damping: 50 }}
      className="w-[350px] h-16 border border-border rounded-lg shadow-md p-4 bg-white dark:bg-black m-2 mr-5 mb-2 absolute left-0 right-0"
      style={{ ...style, height: '75px' }}
    >
      <div className="flex justify-between items-start relative">
        <div className="flex items-start">
          <div className="mr-2 mt-1">{getIcon()}</div>
          <div>
            <h3 className="font-semibold text-xs text-foreground">{title}</h3>
            <p className="text-xs mt-1">{description}</p>
          </div>
        </div>
        <div className="absolute -top-7 -right-2 flex space-x-2">
          <button
            onClick={() => onArchive(id)}
            className="rounded-full border p-1 border-border dark:hover:bg-foreground hover:bg-background hover:text-blue-600"
          >
            <Archive size={15} />
          </button>
          <button
            onClick={() => onClose(id)}
            className="rounded-full border p-1 border-border dark:hover:bg-foreground hover:bg-background hover:text-red-600"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const rotateShake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
`;

const ShakingImage = styled(notificationIcon.src)`
  display: inline-block;
  animation: ${rotateShake} 0.4s infinite;
`;
import { notificationsList } from '@/constants/dummyNotificationList';
const NavBar: React.FC<INavBar> = ({ notificationEmails }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [avatarId, setAvatarId] = useState<number>(76);
  const [fullNav, setFullNav] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [triggerNotification, setTriggerNotification] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverHovered, setPopoverHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<INotification[]>(notificationsList);

  useEffect(() => {
    setTimeout(() => {
      setTriggerNotification(false);
    }, 8000);
  }, []);

  const handleCloseNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  };

  const handleArchiveNotification = (id: string) => {
    // Same logic as handleCloseNotification
    handleCloseNotification(id);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem('userId')!;
      try {
        const response = await fetch('/api/userData/fetchData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const res = await response.json();
          const userData = res.data;
          setAvatarUrl(userData.picture);
          setUserFirstName(userData.given_name);
          setUserLastName(userData.family_name);
          setUserEmail(userData.email);
          setAvatarId(parseInt(userData.avatarId, 10));
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Update state with existing notifications and new ones
    setNotifications((prevNotifications) => [
      ...notificationEmails,
      ...prevNotifications,
    ]);
  }, [notificationEmails]);

  // useEffect(() => {
  //   setTriggerNotification(true);
  //   const timer = setTimeout(() => setTriggerNotification(false), 10000);
  //   return () => clearTimeout(timer);
  // }, [notificationEmails]);

  useEffect(() => {
    if (fullNav) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!popoverHovered) {
          setPopoverOpen(false);
          setFullNav(false);
        }
      }, 7000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fullNav, popoverHovered]);

  const handleNavButtonClick = (action: 'expand' | 'collapse') => {
    if (action === 'expand') {
      setFullNav(true);
    } else {
      setFullNav(false);
    }
  };

  const handleLogOutClick = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const togglePopover = () => setPopoverOpen(!popoverOpen);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      setPopoverOpen(false);
    }
  };
  const handleViewAllClick = () => {
    setDialogOpen(true);
    setPopoverOpen(false);
  };

  return (
    <nav className="z-[1000000] top-2 border border-gray-300 dark:border-[#27272a] rounded-r-none border-r-0 rounded-full fixed right-0">
      <div
        onMouseEnter={() => setPopoverHovered(true)}
        onMouseLeave={() => setPopoverHovered(false)}
        className="h-auto space-x-1 w-auto bg-white rounded-full rounded-r-none py-1 px-1 pl-[0.35rem] border-r-0 backdrop-blur-sm bg-white/60 dark:bg-white/10 flex items-center justify-center transition-all"
      >
        {fullNav && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="pl-2" onClick={handleLogOutClick}>
                  <Upload className="-rotate-90 font-mono" size={17} />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={18} className="text-red-500">
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {fullNav && <ThemeToggle />}

        {fullNav && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button onClick={togglePopover}>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={notificationIcon.src} alt="Notifications" />
                  <AvatarFallback>|||</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              alignOffset={-30}
              sideOffset={-35}
              className="p-0 w-[400px] bg-transparent border-none shadow-none"
            >
              <div className="flex justify-start w-full mt-4 ml-2 ">
                <Button
                  variant="outline"
                  size={'sm'}
                  className="rounded-lg text-xs"
                  onClick={handleViewAllClick}
                >
                  View All
                </Button>
              </div>
              <div
                className="relative transition-all duration-300 overflow-hidden"
                style={{
                  height: isExpanded ? '270px' : '120px',
                }}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
              >
                <AnimatePresence>
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <Notification
                        key={notification.id}
                        id={notification.id}
                        title={notification.title}
                        description={notification.description}
                        type={notification.type}
                        onClose={handleCloseNotification}
                        onArchive={handleArchiveNotification}
                        isExpanded={isExpanded}
                        index={index}
                        totalCount={notifications.length}
                        style={{
                          display: index < 3 || isExpanded ? 'block' : 'none',
                        }}
                      />
                    ))
                  ) : (
                    <div className="w-80 h-16 border border-border rounded-lg shadow-md p-4 bg-white dark:bg-muted m-2 mr-5 mb-2 flex items-center justify-center">
                      <p className="text-sm text-gray-500">
                        No new notifications
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!triggerNotification ? (
          <>
            <button
              onClick={() =>
                handleNavButtonClick(fullNav ? 'collapse' : 'expand')
              }
            >
              <Avatar className={triggerNotification ? 'h-7 w-7' : ''}>
                <AvatarImage src={avatarImages[avatarId].src} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() =>
                handleNavButtonClick(fullNav ? 'collapse' : 'expand')
              }
            >
              <Avatar className={triggerNotification ? 'h-7 w-7' : ''}>
                <AvatarImage
                  src={ShakingImage}
                  alt="@shadcn"
                  className={'h-7 w-7'}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </button>
          </>
        )}
      </div>

      {/* Dialog moved outside of Popover */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[50vw] max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl ">Notifications</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllNotifications}
            >
              Clear All
            </Button>
          </div>

          <ScrollArea className="h-[400px] w-full pr-4">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.3 }}
                    className="w-full border border-border rounded-lg shadow-md p-4 bg-white dark:bg-black mb-4"
                  >
                    <div className="flex justify-between items-start relative">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          {notification.type === 'admin' && (
                            <Bell size={25} className="text-blue-500" />
                          )}
                          {notification.type === 'gmail' && (
                            <Mail size={25} className="text-red-500" />
                          )}
                          {notification.type === 'system' && (
                            <Cog size={25} className="text-green-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">
                            {notification.title}
                          </h3>
                          <p className="text-xs mt-1">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleArchiveNotification(notification.id)
                          }
                          className="rounded-full border p-1 border-border dark:hover:bg-foreground hover:bg-background hover:text-blue-600"
                        >
                          <Archive size={15} />
                        </button>
                        <button
                          onClick={() =>
                            handleCloseNotification(notification.id)
                          }
                          className="rounded-full border p-1 border-border dark:hover:bg-foreground hover:bg-background hover:text-red-600"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full border border-border rounded-lg shadow-md p-4 bg-white dark:bg-muted mb-4"
                >
                  <div className="flex justify-center items-center">
                    <p className="text-sm text-gray-500">
                      No new notifications
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default NavBar;
