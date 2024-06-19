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
import { IEmail } from './IMail';

interface NavLabelCount {
  name: string;
  messagesTotal: number;
}

type NavLabelCounts = NavLabelCount[];

interface NavProps {
  navLabelCount: NavLabelCounts;
  isCollapsed: boolean;
  links: {
    title: string;

    icon: LucideIcon;
    variant: 'default' | 'ghost';
  }[];
  setSelectedNavItem: (item: string) => void;
  selectedNavItem: string;
  handleMailListChange: (label: string) => void;
}

export function Nav({
  navLabelCount,
  handleMailListChange,
  links,
  isCollapsed,
  setSelectedNavItem,
  selectedNavItem,
}: NavProps) {
  const handleNavButtonClick = (title: string) => {
    setSelectedNavItem(title);
  };
  // console.log(navLabelCount);

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
                <div>
                  <Button
                    // size={'icon'}
                    key={index}
                    variant={'ghost'}
                    className={`flex  justify-start hover:bg-border gap-2  hover:text-primary dark:text-muted-foreground  dark:hover:bg-muted rounded-lg  p-3 text-left text-sm transition-all '
                ${
                  selectedNavItem == link.title &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                    onClick={() => {
                      handleMailListChange(link.title);
                      handleNavButtonClick(link.title);
                    }}
                  >
                    <link.icon className="h-4 w-4" />
                    {/* <span className="sr-only">{link.title}</span> */}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                <span className="ml-auto text-muted-foreground">
                  {navLabelCount &&
                    (() => {
                      const matchingItem = navLabelCount.find(
                        (item) =>
                          item.name.toUpperCase() === link.title.toUpperCase()
                      );
                      return matchingItem ? matchingItem.messagesTotal : '';
                    })()}
                </span>
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
                handleMailListChange(link.title);
                handleNavButtonClick(link.title);
              }}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {navLabelCount &&
                navLabelCount
                  .filter(
                    (item) =>
                      item.name.toUpperCase() === link.title.toUpperCase()
                  )
                  .map((item) => (
                    <span key={item.name} className="ml-auto ">
                      {item.messagesTotal}
                    </span>
                  ))}
            </Button>
          )
        )}
      </nav>
    </div>
  );
}
