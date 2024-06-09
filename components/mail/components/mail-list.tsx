import { ComponentProps } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMail } from '../use-mail';
import { IThread, IEmail, IThreads } from './IMail';

interface MailListProps {
  mails: IThreads;
}

export function MailList({ mails }: MailListProps) {
  const [mail, setMail] = useMail();

  return (
    <ScrollArea className="h-[82.5vh] w-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {mails.map((threads: IThread) =>
          threads.threads.map((email: IEmail) => (
            <button
              key={email.id}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
                mail.selected === email.id && 'bg-muted'
              )}
              onClick={() =>
                setMail({
                  ...mail,
                  selected: email.id,
                })
              }
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
                      mail.selected === email.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatDistanceToNow(new Date(email.date), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{email.subject}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {email.snippet.substring(0, 300)}
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
                          'UNREAD',
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
            </button>
          ))
        )}
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
