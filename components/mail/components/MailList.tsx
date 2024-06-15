'use client';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { ComponentProps } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { IThread, IEmail, IThreads } from './IMail';

interface MailListProps {
  mails: IThreads;
  setMail: (mail: IEmail) => void;
  mail: IEmail;
  setFetchMore: (fetchMore: boolean) => void;
  isFetching: boolean;
}

export function MailList({
  mails,
  setMail,
  isFetching,
  mail,
  setFetchMore,
}: MailListProps) {
  console.log('here in mail list');
  console.log(isFetching);

  return (
    <ScrollArea className="h-[82.5vh] w-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {isFetching && (
          <div className="flex-col items-center space-y-10">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="space-y-2" key={index}>
                <Skeleton className="h-2 w-[50%]" />
                <Skeleton className="h-2 w-[50%]" />
                <Skeleton className="h-2 w-[80%]" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        )}
        {!isFetching &&
          mails.map((thread: IThread) => {
            const email = thread.emails[0];

            if (!email) {
              // Skip rendering this thread if the first email is undefined
              return null;
            }

            return (
              <button
                key={email.id}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg p-3 pb-5 text-left text-sm transition-all hover:bg-accent',
                  mail.id === email.id && 'bg-muted'
                )}
                onClick={() => setMail(email)}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{email.name}</div>
                      {!email.read && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'ml-auto text-xs',
                        mail.id === email.id
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatDistanceToNow(new Date(email.date), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row w-full">
                  <div className="flex-col w-full">
                    <div className="text-xs font-medium">{email.subject}</div>
                    <div className="line-clamp-3 text-xs text-muted-foreground">
                      <span>{email.snippet.substring(0, 400)}</span>
                    </div>
                    {email.labels.length ? (
                      <div className="flex items-center gap-2">
                        {email.labels
                          .filter(
                            (label) =>
                              ![
                                'INBOX',
                                'CATEGORY_UPDATES',
                                'CATEGORY_PROMOTIONS',
                                'CATEGORY_PERSONAL',
                                'CATEGORY_SOCIAL',
                                'CATEGORY_FORUMS',
                                'CHAT',
                                'UNREAD',
                                'CATEGORY_PRIMARY',
                                'CATEGORY_TRAVEL',
                                'CATEGORY_FINANCE',
                                'CATEGORY_PURCHASES',
                                'CATEGORY_TV',
                                'CATEGORY_SHOPPING',
                                'CATEGORY_RESERVATIONS',
                              ].includes(label)
                          )
                          .map((label) => (
                            <Badge
                              key={label}
                              variant={getBadgeVariantFromLabel(label)}
                            >
                              {label}
                            </Badge>
                          ))}
                      </div>
                    ) : null}
                  </div>
                  {thread.emails.length > 1 && (
                    <div className="flex items-center flex-col p-2 pb-0 pt-1 ">
                      <span className="flex justify-center text-xs items-center dark:bg-muted bg-[#f6e1fe] h-6 w-6  dark:text-white text-[#c666ec] font-semibold rounded-full  px-[0.3rem]">
                        <span>{thread.emails.length}</span>
                      </span>
                      <span className="h-5 w-[0.2rem] rounded-full rounded-t-none bg-[#c666ec]" />
                      <span className="h-[0.2rem] w-[0.2rem] my-[0.15rem] rounded-full bg-[#c666ec]" />
                      <span className="h-[0.2rem] w-[0.2rem] mb-[0.15rem] rounded-full bg-[#c666ec]" />
                      <span className="h-[0.2rem] w-[0.2rem]  rounded-full bg-[#c666ec]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>['variant'] {
  if (['work'].includes(label.toLowerCase())) {
    return 'default';
  }

  if (['personal'].includes(label.toLowerCase())) {
    return 'outline';
  }

  return 'secondary';
}
