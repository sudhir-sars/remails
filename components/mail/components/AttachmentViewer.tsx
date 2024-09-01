import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';
import { getFileIcon } from '@/utils/attachmentThumbnails';

interface Attachment {
  filename: string;
  fileId: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size: number;
}

import { IAttachemnts } from './IMail';
interface AttachmentViewerProps {
  messageId: string;
  attachmentMetaData: IAttachemnts[];
}
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
const SkeletonAttachment = () => (
  <div className="relative w-[100px] h-[120px]">
    <Skeleton className="w-full h-full rounded-xl" />
    <div className="absolute top-2 right-2">
      <Skeleton className="w-4 h-4 rounded-full" />
    </div>
    <div className="absolute bottom-2 left-2 right-2">
      <Skeleton className="w-full h-4 rounded" />
    </div>
  </div>
);

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  messageId,
  attachmentMetaData,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  // State for managing hover status for each attachment
  const [hoveredAttachmentId, setHoveredAttachmentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchAttachments = async (messageId: string) => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_HOST}/api/fetchAttachment/test?messageId=${messageId}`,
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch attachments');

        const data = await response.json();
        return data.success ? data.attachments : [];
      } catch (error) {
        console.error('Error fetching attachments:', error);
        return [];
      }
    };

    const getAttachments = async () => {
      setLoading(true);
      const fetchedAttachments = await fetchAttachments(messageId);
      setAttachments(fetchedAttachments);
      setLoading(false);
    };

    getAttachments();
  }, [messageId]);

  const handleDownload = async (fileId: string) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await fetch(
        `/api/fetchAttachment/downloadAttachment?fileId=${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to get download link');

      const data = await response.json();
      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        console.error('Failed to retrieve download URL');
      }
    } catch (error) {
      console.error('Error handling download:', error);
    }
  };

  return (
    <TooltipProvider>
      <div>
        {loading ? (
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: attachmentMetaData.length }).map(
              (_, index) => (
                <SkeletonAttachment key={index} />
              )
            )}
          </div>
        ) : attachments.length === 0 ? (
          <p>No attachments found</p>
        ) : (
          <div className="flex flex-grow-0">
            {attachments.map((attachment, index) => (
              <Tooltip delayDuration={0} key={index}>
                <TooltipTrigger asChild>
                  <div
                    key={attachment.fileId}
                    className="relative w-[100px] h-[120px]"
                    onMouseEnter={() =>
                      setHoveredAttachmentId(attachment.fileId)
                    }
                    onMouseLeave={() => setHoveredAttachmentId(null)}
                  >
                    <Image
                      src={getFileIcon(attachment.filename)}
                      alt={attachment.filename}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md cursor-pointer"
                      onClick={() => {
                        console.log('Opening attachment');
                        window.open(attachment.webViewLink, '_blank');
                      }}
                    />

                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDownload(attachment.fileId)}
                          className="absolute  text-xs top-2 right-2 flex items-center justify-center dark:text-white text-black"
                        >
                          <Download size={15} className="cursor-pointer" />
                        </div>
                      </TooltipTrigger>

                      <TooltipContent className="text-xs">
                        download
                      </TooltipContent>
                    </Tooltip>

                    {!(hoveredAttachmentId === attachment.fileId) && (
                      <div className="absolute -bottom-4 w-full">
                        <div className="  mx-4 text-[0.55rem]  text-white bg-black bg-opacity-50 p-1 rounded">
                          {attachment.filename.slice(37, 48)}...
                        </div>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>

                <TooltipContent className="text-xs">
                  {attachment.filename.slice(37)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AttachmentViewer;
