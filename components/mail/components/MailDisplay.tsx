'use client';
import { addDays, addHours, format, nextSaturday } from 'date-fns';
import { useRef, useEffect, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from 'lucide-react';

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// import { Mail } from '../data';
import { IThreads, IThread, IEmail } from './IMail';

interface MailDisplayProps {
  mail: IEmail;
  mailDisplaySize: number;
}
import { ReplyModal } from './ReplyModal';
import { ForwardModal } from './ForwardModal';

export function MailDisplay({ mail, mailDisplaySize }: MailDisplayProps) {
  const parentRef = useRef(null);
  const today = new Date();
  const [scale, setScale] = useState(100);
  const sanitizedHTML = mail && DOMPurify.sanitize(mail.htmlBody);
  const [reply, setReply] = useState<boolean>(false);
  const [forward, setForward] = useState<boolean>(false);
  const [fullView, setFullView] = useState(true);

  useEffect(() => {
    function handleResize() {
      if (mailDisplaySize < 44) {
        setScale(0.7); // Set scale as a percentage (multiplied by 100)
      }
      if (mailDisplaySize > 45) {
        setScale(0.9);
      }
    }
    handleResize();
  }, [mailDisplaySize]);

  return (
    <div className="flex h-full flex-col w-full">
      {/* <Separator /> */}
      {mail ? (
        <div className="flex flex-1 flex-col w-full">
          <div className="flex items-start p-4 pb-0 w-full">
            <div className="flex items-start gap-4 text-sm w-full">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(' ')
                    .map((chunk) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 w-full ">
                <span className="flex justify-between w-full">
                  <div className="font-semibold">{mail.name}</div>
                  {mail.date && (
                    <div className="ml-auto pr-10 text-xs text-muted-foreground">
                      {format(new Date(mail.date), 'PPpp')}
                    </div>
                  )}
                </span>
                <span className="flex justify-between">
                  <span className=" ">
                    <div className="line-clamp-1 text-xs">{mail.subject}</div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">Reply-To:</span>{' '}
                      {mail.email}
                    </div>
                  </span>
                  <span>
                    <div className="flex items-center p-2 ">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!mail}
                            >
                              <Archive className="h-4 w-4" />
                              <span className="sr-only">Archive</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Archive</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={!mail}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Move to trash</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            Move to trash
                          </TooltipContent>
                        </Tooltip>

                        <Separator
                          orientation="vertical"
                          className="mx-1 h-6"
                        />
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span
                          onClick={() => {
                            console.log('setting reply true');
                            setFullView(true);
                            setReply(true);
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!mail}
                              >
                                <ReplyAll className="h-4 w-4" />
                                <span className="sr-only">Reply</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Reply</TooltipContent>
                          </Tooltip>
                        </span>
                        <span
                          onClick={() => {
                            setForward(true);
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={!mail}
                              >
                                <Forward className="h-4 w-4" />
                                <span className="sr-only">Forward</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              Forward
                            </TooltipContent>
                          </Tooltip>
                        </span>
                      </div>
                    </div>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <Separator />
          <span className="p-2">
            <ScrollArea className="h-[86vh] w-full rounded-xl p-2  ">
              <div
                style={{
                  transform: `scale(${0.85})`,
                  transformOrigin: 'top',
                  // textAlign: '',
                }}
              >
                <div
                  className="text-ali"
                  dangerouslySetInnerHTML={{
                    __html: `<div style="transform: scale(1);">${sanitizedHTML}</div>`,
                  }}
                />
                {/* </div> */}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </span>

          {/* <Separator className="mt-auto" /> */}
          {/* <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch id="mute" aria-label="Mute thread" /> Mute this
                    thread
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div> */}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}

      {reply && (
        <ReplyModal
          setFullView={setFullView}
          setReply={setReply}
          mail={mail}
          fullView={fullView}
        />
      )}
      {forward && <ForwardModal setForward={setForward} mail={mail} />}
    </div>
  );
}
