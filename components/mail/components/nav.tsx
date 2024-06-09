'use client';
import * as React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: 'default' | 'ghost';
  }[];
  setSelectedNavItem: (item: string) => void;
  selectedNavItem: string;
}

export function Nav({
  links,
  isCollapsed,
  setSelectedNavItem,
  selectedNavItem,
}: NavProps) {
  const handleNavButtonClick = (title: string) => {
    console.log(title);
    setSelectedNavItem(title);
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  // onClick={handleNavButtonClick(link.title)}
                  className={cn(
                    buttonVariants({ variant: link.variant, size: 'icon' }),
                    'h-9 w-9',
                    selectedNavItem == link.label ? 'border' : ''
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              key={index}
              variant={'ghost'}
              className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
                ${
                  selectedNavItem == link.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
              onClick={() => {
                console.log('here');
                handleNavButtonClick(link.title);
              }}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    'ml-auto hover:text-accent ',
                    link.variant === 'default' && ' dark:text-white '
                  )}
                >
                  {link.label}
                </span>
              )}
            </Button>
            // <Button
            //   variant="ghost"
            //   key={index}
            //   className={`flex justify-start rounded-lg `}
            // >

            // </Button>
          )
        )}
      </nav>
    </div>
  );
}
