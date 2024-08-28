import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import avatarImages from '@/constants/avatars/exporter';

interface IFloatingBubble {
  emailAddress: string;
  avatarId: number;
  userName: string;
  isSuggestable: boolean;
}

const UserDataView: React.FC<IFloatingBubble> = ({
  emailAddress,
  avatarId,
  userName,
  isSuggestable,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Ensure avatarId is within bounds, fallback to first avatar if not
  const safeAvatarId =
    avatarId >= 0 && avatarId < avatarImages.length ? avatarId : 0;
  const avatarSrc = avatarImages[safeAvatarId].src;

  return (
    <TooltipProvider delayDuration={1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center  space-x-2 hover:bg-muted rounded-full p-1 "
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Avatar className="h-4 w-4">
              <AvatarImage src={avatarSrc} alt={userName} />
              <AvatarFallback>
                {/* {userName.charAt(0).toUpperCase()} */}
                qewdwqefd
              </AvatarFallback>
            </Avatar>

            <span className="text-sm font-medium">{userName}</span>

            {isHovered && !isSuggestable && (
              <button
                className="text-red-400 hover:text-red-700 ml-1"
                onClick={() => {
                  /* Handle remove action */
                }}
                aria-label="Remove user"
              >
                ×
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={20}
          alignOffset={20}
          className="p-2 px-4 dark:bg-black"
        >
          <p>{emailAddress}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserDataView;
