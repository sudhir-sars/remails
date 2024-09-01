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

  const safeAvatarId =
    avatarId >= 0 && avatarId < avatarImages.length ? avatarId : 0;
  const avatarSrc = avatarImages[safeAvatarId].src;

  return (
    <TooltipProvider delayDuration={1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center  space-x-2 hover:bg-muted rounded-lg px-4 p-1  "
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center justify-center">
              {(() => {
                const domain = emailAddress.split('@').pop()!;

                const domainParts = domain.split('.');
                const validDomain =
                  domainParts.length > 1
                    ? domainParts.slice(-2).join('.')
                    : null;
                return (
                  <Avatar className="">
                    <AvatarImage
                      loading="lazy"
                      src={`https://logo.clearbit.com/${'validDomain'}`}
                      alt={userName}
                      className="rounded-full "
                    />
                    <AvatarFallback className="w-full">
                      <div className="rounded-full flex items-center justify-center gap-4  p-1 bg-muted w-full">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                    </AvatarFallback>
                  </Avatar>
                );
              })()}
            </div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={20}
          alignOffset={20}
          className="p-2 px-4"
        >
          <p>{emailAddress}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserDataView;
