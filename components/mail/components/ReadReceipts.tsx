import { useState, useEffect } from 'react';
import { IEmail } from './IMail';

import { Check } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
interface IReadReceipts {
  mailListLabel: string;
  email: IEmail;
}
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ReadReceipts = ({ mailListLabel, email }: IReadReceipts) => {
  const [isReadReceipt, setIsReadReceipt] = useState<
    'read' | 'unread' | 'unautherized'
  >('unautherized');

  const extractGUID = (htmlContent: string): string | null => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(htmlContent, 'text/html');
    const imgTags = dom.getElementsByTagName('img');

    for (const img of imgTags) {
      const src = img.src;
      const match = src.match(/GUID=([^&]+)/); // Extract GUID from URL

      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const fetchReadReceiptStatus = async (GUID: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/checkForReadReceipts?GUID=${GUID}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Email status:', data);
      return data.success && data.status;
    } catch (error) {
      console.error('Error checking email status:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkReceipt = async () => {
      if (email.labels.includes('SENT')) {
        const htmlContent = email.htmlBody; // Assume you have the HTML content of the email
        const guid = extractGUID(htmlContent);
        if (guid) {
          const status = await fetchReadReceiptStatus(guid);
          if (status == false) {
            setIsReadReceipt('unread');
          } else if (status == true) {
            setIsReadReceipt('read');
          }
        }
      }
    };

    checkReceipt();
  }, []);

  useEffect(() => {
    console.log(isReadReceipt);
  }, [isReadReceipt]);

  return (
    <>
      {' '}
      <TooltipProvider>
        {mailListLabel === 'SENT' && (
          <div
            className={`${isReadReceipt == 'read' ? 'text-blue-700' : ''}   `}
          >
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                {isReadReceipt == 'read' && <CheckCheck size={15} />}
              </TooltipTrigger>
              <TooltipContent className="">
                {isReadReceipt == 'read' && (
                  <div className="flex items-baseline">
                    <p className="text-blue-700">Read </p>
                  </div>
                )}
                {isReadReceipt == 'unread' && <p>Unread</p>}
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                {isReadReceipt == 'unread' && <Check size={15} />}
              </TooltipTrigger>
              <TooltipContent>
                {isReadReceipt == 'read' && (
                  <div className="flex items-baseline">
                    <p className="text-blue-700">Read </p>
                  </div>
                )}
                {isReadReceipt == 'unread' && <p>Unread</p>}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </TooltipProvider>
    </>
  );
};

export default ReadReceipts;
