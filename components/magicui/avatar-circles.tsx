'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: string[];
}

const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn('z-10 flex -space-x-4 rtl:space-x-reverse', className)}>
      {avatarUrls.map((url, index) => (
        <Image
          key={index}
          className="h-6 w-6 rounded-full border border-white dark:border-gray-800"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black">
        +{numPeople}
      </div>
    </div>
  );
};

export default AvatarCircles;
