'use client';
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { useSearchParams } from 'next/navigation';
import { createTempSession, verifySessionId } from '@/utils/session';
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

import Image from 'next/image';

import { Mail } from './mail';
import { accounts, mails } from '../data';

interface MailPageProps {
  defaultLayout: any;
  defaultCollapsed: any;
}
interface DecodedToken {
  sessionId: string;
  refreshToken: string;
}
export default function MailPage({
  defaultLayout,
  defaultCollapsed,
}: MailPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const JWT_token = searchParams.get('JWT_token');
    if (JWT_token) {
      try {
        const decoded = jwt.verify(JWT_token, JWT_SECRET!) as DecodedToken;

        const {
          sessionId,

          refreshToken,
        } = decoded;

        localStorage.setItem(
          'sessionToken',
          jwt.sign({ sessionId }, JWT_SECRET!, { expiresIn: '6d' })
        );
        localStorage.setItem(
          'refreshToken',
          jwt.sign({ refreshToken }, JWT_SECRET!, { expiresIn: '6d' })
        );

        console.log('all token set');
        setIsAuthorized(true);
        router.replace('http://localhost:3000/');
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('refreshToken');

        window.location.href = '/signup';
      }
    } else {
      const local_token = localStorage.getItem('sessionToken');
      if (local_token) {
        try {
          const decoded = jwt.verify(local_token, JWT_SECRET!) as DecodedToken;
          setIsAuthorized(true);
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
  }, []);
  return (
    <>
      {isAuthorized && (
        <div className="mt-8  h-[95vh] ">
          <Mail
            accounts={accounts}
            mails={mails}
            defaultLayout={defaultLayout}
            defaultCollapsed={defaultCollapsed}
            navCollapsedSize={4}
          />
        </div>
      )}
    </>
  );
}
