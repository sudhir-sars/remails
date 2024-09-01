'use client';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from 'react';
import jwt from 'jsonwebtoken';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area';
import avatarImages from '@/constants/avatars/exporter';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

import navCollapse from '@/constants/navCollapse.gif';

interface IOnBoardingPage {
  jwtToken: string | undefined;
  metaFolderId: string | undefined;
}

export default function OnBoardingPage({
  jwtToken,
  metaFolderId,
}: IOnBoardingPage) {
  const [fullNav, setFullNav] = useState<boolean>(false);
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1);
  const [isFemale, setIsFemale] = useState(true);
  const [isBottomNotReached, setIsBottomNotReached] = useState<boolean>(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const genderImages = [
    { src: avatarImages[0].src, alt: 'male' },
    { src: avatarImages[1].src, alt: 'female' },
  ];

  const handleWheel = useCallback(() => {
    const scrollCur = scrollAreaRef.current;
    if (!scrollCur) return;

    const { scrollTop, clientHeight, scrollHeight } = scrollCur;
    setIsBottomNotReached(scrollTop + clientHeight < scrollHeight);
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    scrollArea?.addEventListener('wheel', handleWheel);
    return () => scrollArea?.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleNavButtonClick = (label: string) => {
    if (label === 'expand') {
      setFullNav(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFullNav(false), 7000);
    } else {
      setFullNav(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const handleUpdateUserData = async () => {
    const userId = localStorage.getItem('userId')!;
    const userData = {
      gender: isFemale ? 'f' : 'm',
      avatarId: `${selectedAvatar}`,
      isOnBoardingNotDone: false,
    };

    try {
      const response = await fetch('/api/userData/updateUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userData }),
      });

      if (response.ok) {
        const redirectUrl = `${process.env.NEXT_PUBLIC_HOST}?JWT_token=${jwtToken}&metaFolderId=${metaFolderId}`;
        window.location.href = redirectUrl;
        console.log('User data updated successfully:', await response.json());
      } else {
        console.error('Failed to update user data');
      }
    } catch (err) {
      console.error('Error occurred while updating user data:', err);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <Carousel className="rounded-xl overflow-hidden">
          <CarouselContent>
            <CarouselItem>
              <div className="bg-background p-6 sm:p-8 md:p-10 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold">
                    Welcome to Our Email Client
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Let&apos;s get started by setting up your profile.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-center">
                    What is your gender?
                  </h3>
                  <div className="flex items-center justify-center space-x-8">
                    {genderImages.map((gender, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setIsFemale(index === 1);
                          setSelectedAvatar(index);
                        }}
                        className={`p-4 rounded-lg transition-all ${(!isFemale && index === 0) || (isFemale && index === 1) ? 'bg-primary/10' : ''}`}
                      >
                        <img
                          src={gender.src}
                          alt={gender.alt}
                          className="w-32 h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="bg-background p-20 py-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Choose your avatar</h2>
                  <p className="text-muted-foreground">
                    Select an avatar that represents you.
                  </p>
                </div>
                <ScrollArea className="h-[400px] w-full rounded-md mt-10">
                  <div className="flex flex-wrap gap-4">
                    {avatarImages.slice(2).map((avatar, index) => (
                      <div
                        key={index + 2}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedAvatar === index + 2 ? 'bg-primary/10 text-primary-foreground' : 'bg-card hover:bg-primary/10'}`}
                        onClick={() => setSelectedAvatar(index + 2)}
                      >
                        <Image
                          src={avatar.src}
                          alt={`Avatar ${index + 3}`}
                          className="w-16 h-16 object-cover rounded-full"
                          width={64}
                          height={64}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CarouselItem>

            <CarouselItem>
              <div className="bg-background mb-0 p-20 pt-6 pb-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Privacy Policy</h2>
                  <p className="text-muted-foreground">
                    Please review and accept our privacy policy.
                  </p>
                </div>
                <ScrollArea className="h-[70vh] w-full rounded-md">
                  <ScrollAreaViewport ref={scrollAreaRef}>
                    <div className="bg-card p-4 rounded-lg space-y-4">
                      <div className="max-w-none px-4 py-6 mx-auto">
                        <h3 className="text-xl font-semibold mb-4">
                          Privacy Policy
                        </h3>
                        <p className="mb-4">
                          Welcome to our Privacy Policy. At Remails, we
                          prioritize your privacy and are committed to
                          safeguarding your personal information. By using our
                          platform, you consent to the collection, use, and
                          sharing of your data as outlined below. This policy
                          explains what information we collect, how we use it,
                          and your rights regarding your data.
                        </p>

                        <h4 className="text-lg font-semibold mb-2">
                          Information We Collect
                        </h4>
                        <p className="mb-4">
                          We collect various types of information to provide,
                          maintain, and improve our services. The information we
                          collect includes:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>
                              Personal Identification Information:
                            </strong>{' '}
                            Username, email address, gender (optional), and
                            avatar selection.
                          </li>
                          <li>
                            <strong>Usage Data:</strong> Details of how you
                            interact with our platform, including your IP
                            address, browser type, and usage patterns.
                          </li>
                          <li>
                            <strong>Device Information:</strong> Information
                            about the device you use to access our services,
                            such as device type, operating system, and unique
                            device identifiers.
                          </li>
                          <li>
                            <strong>Cookies and Tracking Technologies:</strong>{' '}
                            We use cookies and similar technologies to enhance
                            user experience, analyze usage, and provide targeted
                            advertising.
                          </li>
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                          Use of Your Information
                        </h4>
                        <p className="mb-4">
                          We use the collected information for various purposes,
                          including:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Service Provision:</strong> To deliver and
                            manage our services, including account creation,
                            user authentication, and personalized content.
                          </li>
                          <li>
                            <strong>Enhancement of User Experience:</strong> To
                            analyze usage patterns and improve the
                            functionality, performance, and security of our
                            platform.
                          </li>
                          <li>
                            <strong>Personalization:</strong> To offer tailored
                            recommendations and content based on your
                            preferences and interactions.
                          </li>
                          <li>
                            <strong>Communication:</strong> To send you updates,
                            newsletters, promotional materials, and responses to
                            your inquiries.
                          </li>
                          <li>
                            <strong>Compliance:</strong> To comply with legal
                            obligations, enforce our terms, and protect our
                            rights and the rights of others.
                          </li>
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                          Data Security
                        </h4>
                        <p className="mb-4">
                          We implement industry-standard security measures to
                          protect your personal data from unauthorized access,
                          disclosure, alteration, or destruction. These measures
                          include:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Encryption:</strong> Encrypting sensitive
                            data both in transit and at rest to safeguard
                            against unauthorized access.
                          </li>
                          <li>
                            <strong>Access Controls:</strong> Restricting access
                            to personal data to authorized personnel only.
                          </li>
                          <li>
                            <strong>Regular Audits:</strong> Conducting security
                            audits and vulnerability assessments to identify and
                            address potential risks.
                          </li>
                          <li>
                            <strong>Incident Response:</strong> Having a
                            response plan in place for data breaches or security
                            incidents.
                          </li>
                        </ul>
                        <p className="mb-4">
                          Despite these measures, no method of transmission over
                          the Internet or electronic storage is completely
                          secure. We cannot guarantee absolute security of your
                          data.
                        </p>

                        <h4 className="text-lg font-semibold mb-2">
                          Third-Party Access
                        </h4>
                        <p className="mb-4">
                          We may share your information with third parties under
                          the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Service Providers:</strong> To assist in
                            operating our platform, processing transactions, or
                            performing other functions on our behalf.
                          </li>
                          <li>
                            <strong>Business Transfers:</strong> In connection
                            with a merger, acquisition, or sale of all or a
                            portion of our business.
                          </li>
                          <li>
                            <strong>Legal Requirements:</strong> When required
                            to do so by law or in response to valid requests by
                            public authorities.
                          </li>
                          <li>
                            <strong>Consent:</strong> When you have given
                            explicit consent for us to share your information
                            with third parties.
                          </li>
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                          Your Rights
                        </h4>
                        <p className="mb-4">
                          You have certain rights concerning your personal data,
                          including:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Access:</strong> Request a copy of the
                            personal data we hold about you.
                          </li>
                          <li>
                            <strong>Correction:</strong> Request that we correct
                            or update any inaccurate or incomplete data.
                          </li>
                          <li>
                            <strong>Deletion:</strong> Request that we delete
                            your personal data under certain circumstances.
                          </li>
                          <li>
                            <strong>Restriction:</strong> Request that we
                            restrict the processing of your data in specific
                            situations.
                          </li>
                          <li>
                            <strong>Portability:</strong> Request a copy of your
                            data in a structured, commonly used, and
                            machine-readable format.
                          </li>
                          <li>
                            <strong>Objection:</strong> Object to the processing
                            of your data for direct marketing purposes or based
                            on legitimate interests.
                          </li>
                        </ul>

                        <h4 className="text-lg font-semibold mb-2">
                          Cookies and Tracking Technologies
                        </h4>
                        <p className="mb-4">
                          We use cookies and similar tracking technologies to
                          enhance your browsing experience. Cookies are small
                          data files stored on your device that help us:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Authenticate:</strong> Ensure secure logins
                            and user sessions.
                          </li>
                          <li>
                            <strong>Analyze:</strong> Track user interactions
                            and site performance.
                          </li>
                          <li>
                            <strong>Personalize:</strong> Customize content and
                            advertising based on your preferences.
                          </li>
                        </ul>
                        <p className="mb-4">
                          You can manage your cookie preferences through your
                          browser settings. Please note that disabling cookies
                          may affect the functionality of our platform.
                        </p>

                        <h4 className="text-lg font-semibold mb-2">
                          Changes to This Policy
                        </h4>
                        <p className="mb-4">
                          We may update our Privacy Policy periodically to
                          reflect changes in our practices or legal
                          requirements. We will notify you of significant
                          changes by posting the updated policy on this page. We
                          encourage you to review this policy regularly to stay
                          informed about how we protect your data.
                        </p>

                        <h4 className="text-lg font-semibold mb-2">
                          Contact Us
                        </h4>
                        <p className="mb-4">
                          If you have any questions, concerns, or requests
                          regarding this Privacy Policy or our data practices,
                          please contact us:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                          <li>
                            <strong>Email:</strong>{' '}
                            <a
                              href="mailto:privacy@remails.com"
                              className="text-blue-500 underline"
                            >
                              privacy@remails.com
                            </a>
                          </li>
                          <li>
                            <strong>Address:</strong> [Your Company Address]
                          </li>
                          <li>
                            <strong>Phone:</strong> [Your Company Phone Number]
                          </li>
                        </ul>
                        <p className="mb-4">
                          We are here to assist you and will respond to your
                          inquiries as promptly as possible.
                        </p>
                      </div>
                    </div>
                  </ScrollAreaViewport>
                </ScrollArea>
              </div>

              <div className="mt-10 flex justify-end items-center px-20 pr-28">
                <Button
                  variant="default"
                  disabled={isBottomNotReached}
                  onClick={handleUpdateUserData}
                >
                  Dive into Remails
                </Button>
              </div>
            </CarouselItem>
          </CarouselContent>

          <CarouselPrevious className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-background/50 rounded-full p-2 hover:bg-background/75 transition-colors">
            <ArrowLeftIcon className="w-6 h-6" />
          </CarouselPrevious>

          <CarouselNext className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-background/50 rounded-full p-2 hover:bg-background/75 transition-colors">
            <ArrowRightIcon className="w-6 h-6" />
          </CarouselNext>
        </Carousel>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <nav
          className={`flex items-center space-x-2 bg-white dark:bg-gray-900 p-2 rounded-full shadow-lg`}
        >
          {fullNav && (
            <button onClick={() => handleNavButtonClick('collapse')}>
              <Image src={navCollapse} alt="collapse" height={20} width={20} />
            </button>
          )}

          {fullNav && <ThemeToggle />}

          <button
            onClick={() =>
              handleNavButtonClick(fullNav ? 'collapse' : 'expand')
            }
            aria-label={fullNav ? 'Collapse Navigation' : 'Expand Navigation'}
          >
            <Avatar>
              <AvatarImage
                src={avatarImages[selectedAvatar].src}
                alt={`User Avatar ${selectedAvatar + 1}`}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </button>
        </nav>
      </div>
    </>
  );
}
