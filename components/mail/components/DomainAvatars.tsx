import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  bucketDomainEmails: string[];
  bucketPersonalEmails: string[];
  handleAvatarClick: (src: string, isImage: boolean) => void;
}

const UniqueAvatars = ({
  bucketDomainEmails,
  bucketPersonalEmails,
  handleAvatarClick,
}: Props) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  // Get unique domains from bucketDomainEmails
  const uniqueDomains = Array.from(
    new Set(bucketDomainEmails.map((email) => email.substring(1))) // Remove '@' and make unique
  );

  // Extract unique domains from personal emails
  const personalEmailDomains = Array.from(
    new Set(
      bucketPersonalEmails.map(
        (email) => email.match(/(?<=@)[^\s@]+/)?.[0] || 'd'
      ) // Extract domains or fallback
    )
  );

  // Combine and deduplicate domain lists
  const allUniqueDomains = Array.from(
    new Set([...uniqueDomains, ...personalEmailDomains])
  );

  return (
    <div className="relative flex flex-grow space-x-3 ml-3">
      {allUniqueDomains.length > 0 &&
        allUniqueDomains.map((domain, index) => {
          const src = `https://logo.clearbit.com/${domain}`;
          const fallbackText = domain.charAt(0).toUpperCase(); // Use first character of domain for fallback

          return (
            <div
              key={`domain-${index}`}
              className={`relative p-1 border rounded-full ${
                selectedAvatar === domain ? 'border-primary' : 'border-muted'
              }`}
              onClick={() => setSelectedAvatar(domain)}
            >
              <Avatar className="hover:cursor-pointer">
                <AvatarImage
                  src={src}
                  alt={`@${domain}`}
                  onClick={() => handleAvatarClick(src, true)}
                />
                <AvatarFallback
                  onClick={() => handleAvatarClick(fallbackText, false)}
                >
                  {fallbackText}
                </AvatarFallback>
              </Avatar>
            </div>
          );
        })}
    </div>
  );
};

export default UniqueAvatars;
