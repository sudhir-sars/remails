'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import jwt from 'jsonwebtoken';
import { useRouter, useSearchParams } from 'next/navigation';
import OnBoardingPage from '@/components/OnBoardingPage';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

interface DecodedToken {
  userId: string;
  refreshToken: string;
  historyId: string;
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jwtToken, setJwtToken] = useState<string>();
  const [metaFolderId, setMetaFolderId] = useState<string>();

  const verifyUser = useCallback(() => {
    if (!searchParams) {
      // router.push('/signup');
      return;
    }

    const JWT_token = searchParams.get('JWT_token');
    const metaFolderId = searchParams.get('metaFolderId');

    if (JWT_token && metaFolderId) {
      try {
        setMetaFolderId(metaFolderId);
        const decoded = jwt.verify(JWT_token, JWT_SECRET!) as DecodedToken;
        setJwtToken(JWT_token);
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.clear();
        // router.push('/signup');
      }
    } else {
      // router.push('/signup');
    }
  }, [searchParams, router]);

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  return <OnBoardingPage jwtToken={jwtToken} metaFolderId={metaFolderId} />;
}

export default function Component() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
