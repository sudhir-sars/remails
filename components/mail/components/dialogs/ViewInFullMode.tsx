import React, { useState, useRef, useCallback, useEffect } from 'react';
import TextEditor from '../texteditor/TextEditor';
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from '@/components/ui/scroll-area';
import { IThread, IEmail } from '../IMail';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import DOMPurify from 'dompurify';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Reply, Forward } from 'lucide-react';

// Define the prop types for MailHeader
interface MailHeaderProps {
  email: IEmail;
}

// Example child component wrapped with React.memo
const MailHeader: React.FC<MailHeaderProps> = React.memo(({ email }) => (
  <div className=" fixed items-center z-[50]   space-y-2 px-8  py-3 w-full rounded-lg rounded-br-none   border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="text-xs text-foreground">{`From: ${email.name} <${email.email}>`}</div>
    <div className="flex justify-between ">
      <div>{`Sub: ${email.subject}`}</div>
    </div>
  </div>
));

// Define the prop types for EmailContent
interface EmailContentProps {
  emails: IEmail[];
}

const EmailContent: React.FC<EmailContentProps> = React.memo(({ emails }) => (
  <>
    {emails.map((email, index) => {
      const sanitizedHTML = DOMPurify.sanitize(
        email.htmlBody || email.textBody
      );
      return (
        <ScrollArea
          key={index}
          className="max-w-[80vw] pr-5 pl-0  flex justify-center"
        >
          <div className="flex justify-between my-12 ">
            <ScrollArea className="flex justify-center w-full">
              <div
                className=" w-full bg-muted rounded-3xl p-6 scale-75"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            </ScrollArea>
            <ScrollBar orientation="horizontal" />
            <div className="flex items-center justify-center w-9">
              <div className="flex items-center flex-col h-full relative">
                <span className="absolute top-[10%] flex justify-center text-xs items-center dark:bg-muted bg-muted border text-black h-6 w-6 dark:text-white font-semibold rounded-full px-[0.3rem]">
                  <span>{index + 1}</span>
                </span>
                <span className="h-[100%] w-[0.2rem] rounded-full bg-gray-300" />
              </div>
            </div>
          </div>
        </ScrollArea>
      );
    })}
  </>
));

interface IViewInFullMode {
  mail: IThread;
  viewFullMailRef: React.RefObject<HTMLDivElement>;
}

export function ViewInFullMode({ mail, viewFullMailRef }: IViewInFullMode) {
  const [collapsibleButtonHover, setCollapsibleButtonHover] = useState(false);
  const [collapsibleButtonClick, setCollapsibleButtonClick] = useState(false);

  const collapsibleButtonRef = useRef<HTMLDivElement>(null);
  const handleCollapsibleButtonClick = () => {
    if (collapsibleButtonRef.current) {
      collapsibleButtonRef.current.click();
    }
  };

  const threadViewCollapsibleRef = useRef<HTMLDivElement>(null);
  const [replyForwardButtonVisibility, setReplyForwardButtonVisibility] =
    useState(true);
  const threadViewPrevScrollTop = useRef(0);

  const handleThreadViewScroll = useCallback((event) => {
    const currentScrollTop = event.currentTarget.scrollTop;
    const deltaY = currentScrollTop - threadViewPrevScrollTop.current;
    if (deltaY < -50) {
      setReplyForwardButtonVisibility(true);
    } else if (deltaY > 50) {
      setReplyForwardButtonVisibility(false);
    }
    threadViewPrevScrollTop.current = currentScrollTop;
  }, []);
  // console.log(mail);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <span ref={viewFullMailRef} className="hidden"></span>
        </DialogTrigger>

        <DialogContent className="h-[98vh] w-[75vw] bg-muted p-0  px-0">
          <MailHeader email={mail.emails[0]} />

          <div className="h-full w-full relative">
            <div className="absolute top-[4.5rem]  right-6 z-[56]">
              <button
                onClick={() => {
                  setCollapsibleButtonClick(!collapsibleButtonClick);
                  handleCollapsibleButtonClick();
                }}
                onMouseLeave={() => setCollapsibleButtonHover(false)}
                onMouseEnter={() => setCollapsibleButtonHover(true)}
                className="
                  rounded-lg h-7 w-16 flex justify-center items-center
                  border-b border-border/40 rounded-t-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
                  "
              >
                {collapsibleButtonClick && !collapsibleButtonHover && (
                  <BiCollapseVertical className="p-[0.18rem]" />
                )}
                {collapsibleButtonHover && !collapsibleButtonClick && (
                  <BiExpandVertical className="" />
                )}
                {!collapsibleButtonHover && !collapsibleButtonClick && (
                  <BiExpandVertical className="p-[0.18rem]" />
                )}
                {collapsibleButtonClick && collapsibleButtonHover && (
                  <BiCollapseVertical className="" />
                )}
                <span className="text-sm mr-2">{mail.emails.length}</span>
              </button>
            </div>

            <div className="relative w-full">
              <div>
                <ScrollArea className="h-[93vh] flex w-full  rounded-2xl px-3  ">
                  <ScrollAreaViewport
                    ref={threadViewCollapsibleRef}
                    onScroll={handleThreadViewScroll}
                  >
                    <Collapsible className="space-y-2">
                      <div className="flex items-center justify-end relative">
                        <CollapsibleTrigger asChild>
                          <div
                            ref={collapsibleButtonRef}
                            className="hidden"
                          ></div>
                        </CollapsibleTrigger>
                      </div>
                      <div className="flex w-full rounded-2xl relative">
                        <CollapsibleContent className="space-y-2  pt-16  rounded-2xl w-full">
                          <EmailContent
                            emails={mail.emails.slice(0, -1).reverse()}
                          />
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    <div className="flex justify-between w-full pt-16 pr-5 pl-0">
                      <ScrollArea className="justify-center w-full">
                        <div
                          className="bg-muted rounded-3xl  p-6 scale-75"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              mail.emails[0].htmlBody || mail.emails[0].textBody
                            ),
                          }}
                        />
                      </ScrollArea>
                      <div className="flex items-center justify-center w-9">
                        <div className="flex items-center flex-col h-full relative">
                          <span className="absolute top-[10%] flex justify-center text-xs items-center dark:bg-muted bg-muted border text-black h-6 w-6 dark:text-white font-semibold rounded-full px-[0.3rem]">
                            <span>{mail.emails.length}</span>
                          </span>
                          <span className="h-[100%] w-[0.2rem] rounded-full bg-gray-300" />
                        </div>
                      </div>
                    </div>
                    <div className=" px-16 bg-transparent   ">
                      <Button
                        size={'sm'}
                        className="rounded-full mb-2   space-x-2 flex justify-center items-center bg-black text-white"
                      >
                        <Reply size={15} />
                        <span className="text-xs pr-3 ">Reply</span>
                      </Button>
                      <TextEditor />
                      {/* <div className=" absolute bottom-3 left-7 w-full h-full bg-transparent flex justify-end pr-10 space-x-4 items-center">
                        <Button className="rounded-full px-10 pl-7 space-x-2 flex justify-center items-center bg-black text-white hover:bg-muted">
                          <Reply size={20} />
                          <span>Reply</span>
                        </Button>
                      </div> */}
                    </div>
                  </ScrollAreaViewport>
                </ScrollArea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ViewInFullMode;
