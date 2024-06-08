'use client';
import { useEffect } from 'react';
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from './Theme';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
const Menu: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleClick = (item: string) => {
    setSelectedItem(item);
  };

  return (
    <>
      <div className="fixed flex justify-between items-center  w-full border border-l-0 border-r-0 border-t-0 z-50 ">
        <ul className="flex  text-sm text-muted-foreground font-medium  pl-5">
          {['Dashboard', 'Mail', 'Tasks', 'Calendar', 'Notes', 'Upcoming'].map(
            (item) => (
              <ul className="" key={item}>
                <li className="mx-1 my-1">
                  <Button
                    size={'sm'}
                    key={item}
                    onClick={() => handleClick(item)}
                    variant={'ghost'}
                    className={` rounded-2xl flex flex-row justify-start hover:bg-border gap-2  text-primary dark:text-muted-foreground  dark:hover:bg-muted   p-3 text-left  transition-all '
                ${
                  selectedItem == item &&
                  'bg-primary text-muted-foreground hover:bg-primary hover:text-accent  text-white dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:text-white'
                }`}
                  >
                    <span className="px-1">{item}</span>
                  </Button>
                </li>
              </ul>
            )
          )}
        </ul>
        <span className="mr-5 ">
          <ThemeToggle />
        </span>
      </div>
    </>
  );
};

export default Menu;
