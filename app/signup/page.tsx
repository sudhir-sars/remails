'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { useState } from 'react';
import carouselImages from '@/utils/carouselImages';
import { FcGoogle } from 'react-icons/fc';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

import { Button } from '@/components/ui/button';
import Icons from '@/components/ui/icons';

import { useSearchParams } from 'next/navigation';
import { SiMicrosoft } from 'react-icons/si';
import MainImage from '@/public/MainImage.png';
import { createTempSession, verifySessionId } from '@/utils/session';
import { Image } from '@udecode/plate-media';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const Login: React.FC = () => {
  const [isLoadingG, setIsLoadingG] = useState<boolean>(false);
  const [isLoadingM, setIsLoadingM] = useState<boolean>(false);
  const handleLoginGoogle = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsLoadingG(true);

    const sessionId = await createTempSession();

    if (sessionId) {
      try {
        console.log(`session id for temp: ${sessionId}`);
        const authUrl = `/api/auth?sessionId=${sessionId}`;
        window.location.href = authUrl;
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
    }, 5000);
  };

  return (
    <div className="min-h-screen">
      <div className="container relative grid min-h-screen flex-col items-center justify-center md:grid lg:max-w-full lg:grid-cols-2 lg:px-0">
        <Link
          href="/examples/authentication"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8'
          )}
        >
          {`LEX<OPS`}
        </Link>

        <div className="lg:p-8 flex items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <div className={cn('grid gap-6')}>
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
                disabled={true}
                onClick={HandleLoginMicrosoft}
                variant="outline"
                type="button"
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
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacypolicy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="relative  items-center justify-center hidden h-full flex-col bg-muted p-10 text-white lg:flex lg:justify-center lg:items-center dark:border-r">
          <div className="w-[80%] bg-white rounded-full h-1 mb-3"></div>
          <Carousel
            opts={{
              loop: true,
            }}
            autoplay={true}
            autoplayInterval={3000}
            className=""
          >
            <CarouselContent className="">
              {carouselImages.map((image, index) => (
                <CarouselItem className="w-full h-full" key={index}>
                  <Image
                    loading="lazy"
                    src={image.src}
                    alt={`Feature ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
export default Login;
