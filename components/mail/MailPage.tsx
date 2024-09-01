'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { Progress } from '@/components/ui/progress';
import ScaledApp from '../Scaler';
import Mail from './components/Mail';
import { accounts } from './data';
import NavBar from '@/components/main/NavBar';
import { IEmails } from './components/IMail';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

interface MailPageProps {
  defaultLayout: any;
  defaultCollapsed: any;
}

type NotificationType = 'admin' | 'gmail' | 'system';

interface INotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
}
interface DecodedToken {
  userId: string;
  refreshToken: string;
  historyId: string;
}

export default function MailPage({
  defaultLayout,
  defaultCollapsed,
}: MailPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [watchDogHistoryId, setWatchDogHistoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // Added useState for isLoading
  const [showProgress, setShowProgress] = useState(true);

  const getLocalStorageItem = (key: string) => localStorage.getItem(key);

  const redirectToSignup = (errorMsg: string) => {
    console.error(errorMsg);
    localStorage.clear();
    window.location.href = '/signup';
  };

  const dismantleDrive = async () => {
    const folderId = getLocalStorageItem('remailsMetaDataFolderId');
    if (!folderId)
      return redirectToSignup('No folder ID found in localStorage');

    const response = await fetch('/api/drive/dismantleDrive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getLocalStorageItem('refreshToken')}`,
      },
      body: JSON.stringify({ folderId }),
    });

    if (!response.ok)
      return redirectToSignup(`Error: ${(await response.json()).error}`);
    return await response.json();
  };

  const endWatch = async () => {
    const token = getLocalStorageItem('refreshToken');
    if (!token) return;

    try {
      const response = await fetch(
        `/api/gmail/endWatchDog?token=${encodeURIComponent(token)}`
      );
      const data = await response.json();
      if (!data.success) console.error('Failed to end watch:', data.error);
    } catch (error) {
      console.error('Error ending watch:', error);
    }
  };

  const initiateUserAddressFetch = async () => {
    const token = getLocalStorageItem('refreshToken');
    const userId = getLocalStorageItem('userId');

    if (!token || !userId)
      return redirectToSignup(
        'Authentication token or userId not found in localStorage'
      );

    try {
      const lastFetchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/userData/fetchData`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (!lastFetchResponse.ok)
        return console.error('Error in fetching user address last fetch time');

      const lastFetchData = await lastFetchResponse.json();
      console.log(lastFetchData.data);
      localStorage.setItem('userName', JSON.stringify(lastFetchData.data.name));
      localStorage.setItem(
        'userEmail',
        JSON.stringify(lastFetchData.data.email)
      );

      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/userData/updateUserData`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            userData: { userAddressLastFetchTime: Date.now() },
          }),
        }
      );

      if (!updateResponse.ok)
        return console.error('Error in updating user data');

      const schedulerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/APIRequestScheduler/userDataScheduler`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            userId,
            lastFetchTime: lastFetchData.data?.userAddressLastFetchTime,
          }),
        }
      );

      if (!schedulerResponse.ok)
        console.error('Error in scheduling user data fetch');
      else console.log('User data fetch scheduled successfully');
    } catch (error) {
      console.error('Error during the fetch process:', error);
    }
  };

  const setupWatchdog = async () => {
    const JWT_token = searchParams?.get('JWT_token');
    const metaFolderId = searchParams?.get('metaFolderId');

    if (metaFolderId) {
      localStorage.setItem('remailsMetaDataFolderId', metaFolderId);
    } else {
      redirectToSignup('Meta folder Id Missing');
    }

    if (JWT_token) {
      try {
        const decoded = jwt.verify(JWT_token, JWT_SECRET!) as DecodedToken;
        const { userId, refreshToken, historyId } = decoded;

        if (historyId) {
          setWatchDogHistoryId(historyId);
        } else {
          return redirectToSignup(
            'history id not found, need to authenticate again'
          );
        }

        localStorage.setItem('userId', userId);
        localStorage.setItem(
          'refreshToken',
          jwt.sign({ refreshToken }, JWT_SECRET!, { expiresIn: '1y' })
        );
        localStorage.setItem(
          'userIdToken',
          jwt.sign({ userId }, JWT_SECRET!, { expiresIn: '1y' })
        );

        setIsAuthorized(true);
        router.replace('/');
      } catch (error) {
        return redirectToSignup('Error verifying token');
      }
    } else {
      const local_token = getLocalStorageItem('userIdToken');
      if (local_token) {
        try {
          const decoded = jwt.verify(local_token, JWT_SECRET!) as DecodedToken;
          if (decoded) {
            const userId = getLocalStorageItem('userId');
            const token = getLocalStorageItem('refreshToken');

            setIsLoading(true);
            const response = await fetch(
              `/api/gmail/setupWatchDogOnLogin?userId=${encodeURIComponent(userId!)}&token=${encodeURIComponent(token!)}`
            );
            const data = await response.json();

            if (data.success) {
              setWatchDogHistoryId(data.historyId || '');
              setIsAuthorized(true);
              router.replace('/');
            } else {
              console.error('Watchdog setup failed:', data.error);
              return redirectToSignup('Watchdog setup failed');
            }
          } else {
            return redirectToSignup('Tampered token');
          }
        } catch (error) {
          return redirectToSignup('Tampered token');
        } finally {
          setIsLoading(false);
        }
      } else {
        return redirectToSignup('No userIdToken found in localStorage');
      }
    }
  };

  useEffect(() => {
    setupWatchdog();
    initiateUserAddressFetch();

    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      await Promise.all([endWatch(), dismantleDrive()]);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const timer = setTimeout(() => setShowProgress(false), 4000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timer);
    };
  }, [searchParams, router]);

  const [notificationEmails, setNotificationEmails] = useState<INotification[]>(
    []
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {showProgress && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-white">
          <Progress className="w-[30vw]" />
        </div>
      )}
      {isAuthorized && (
        <>
          <NavBar notificationEmails={notificationEmails} />
          <ScaledApp>
            <Mail
              setNotificationEmails={setNotificationEmails}
              watchDogHistoryId={watchDogHistoryId}
              accounts={accounts}
              defaultLayout={defaultLayout}
              defaultCollapsed={defaultCollapsed}
              navCollapsedSize={4}
            />
          </ScaledApp>
        </>
      )}
    </Suspense>
  );
}
