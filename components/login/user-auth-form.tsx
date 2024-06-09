'use client';

import * as React from 'react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { FcGoogle } from 'react-icons/fc';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { SiMicrosoft } from 'react-icons/si';
import { v4 as uuidv4 } from 'uuid';
import { createTempSession, verifySessionId } from '@/utils/session';
import { useRouter } from 'next/router';
import { Suspense } from 'react';
interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoadingG, setIsLoadingG] = React.useState<boolean>(false);
  const [isLoadingM, setIsLoadingM] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  // const router = useRouter();

  const handleLoginGoogle = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoadingG(true);

    const sessionId = await createTempSession();
    // setLocal(sessionId);
    if (sessionId) {
      try {
        console.log(`session id for temp: ${sessionId}`);

        const authUrl = `/api/auth?sessionId=${sessionId}`;
        window.location.href = authUrl;
        // window.open(authUrl, '_blank', 'width=500,height=500');
        setTimeout(() => {
          setIsLoadingG(false);
        }, 3000);
      } catch {
        console.log('error');
      }
    }
  };

  const HandleLoginMicrosoft = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoadingM(true);

    setTimeout(() => {
      setIsLoadingM(false);
    }, 3000);
  };

  return (
    <Suspense>
      <div className={cn('grid gap-6', className)} {...props}>
        <div className="grid gap-2">
          <Button
            onClick={handleLoginGoogle}
            disabled={isLoadingG}
            className="flex items-center justify-center"
          >
            {isLoadingG ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="mr-4 text-xl" />
            )}
            Sign In with Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          onClick={HandleLoginMicrosoft}
          variant="outline"
          type="button"
          disabled={isLoadingM}
          className="flex items-center justify-center"
        >
          {isLoadingM ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <SiMicrosoft className=" mr-2  text-lg " />
          )}{' '}
          Microsoft
        </Button>
      </div>
    </Suspense>
  );
}
