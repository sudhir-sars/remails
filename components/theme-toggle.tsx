'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MoonStar } from 'lucide-react';
import { Icons } from '@/components/icons';

import { Button } from '@/components/plate-ui/button';
import styled, { keyframes } from 'styled-components';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;

  const RotatingIconSun = styled(Icons.sun)`
    &:hover {
      animation: ${rotate360} 0.2s linear;
    }
  `;

  return (
    <Button
      variant="ghost"
      size="theme"
      onClick={() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
      }}
    >
      <RotatingIconSun className="  rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonStar className=" p-1 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
