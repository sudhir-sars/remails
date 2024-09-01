'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or return a placeholder
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-1 w-full overflow-hidden rounded-full bg-primary/20',
        className
      )}
      {...props}
    >
      <style jsx>{`
        @keyframes moveRight {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>

      <div className="relative w-full h-full">
        <div
          className="absolute h-full bg-black"
          style={{
            width: '30%',
            animation: 'moveRight 1s linear infinite',
          }}
        />
        <div
          className="absolute h-full bg-black"
          style={{
            width: '30%',
            animation: 'moveRight 1s linear infinite',
            animationDelay: '1s',
          }}
        />
      </div>
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
