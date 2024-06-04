'use client';

import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';

const Menu: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleClick = (item: string) => {
    setSelectedItem(item === selectedItem ? null : item);
  };

  return (
    <>
      <div className="fixed">
        <ul className="flex  text-sm text-muted-foreground font-medium pt-3 pl-5">
          {['Mail', 'Dashboard', 'Tasks', 'Calendar', 'Notes', 'Upcoming'].map(
            (item) => (
              <li
                key={item}
                onClick={() => handleClick(item)}
                className={`hover:text-foreground cursor-pointer rounded-2xl px-4 py-1 pb-[0.35rem] ${
                  selectedItem === item ? 'bg-[#27272a] text-foreground  ' : ''
                }`}
              >
                {item}
              </li>
            )
          )}
        </ul>
      </div>
    </>
  );
};

export default Menu;
