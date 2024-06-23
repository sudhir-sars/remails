'use client';

import * as React from 'react';
import Image from 'next/image';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { ToggleTheme } from '../sub/ToggleTheme';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Url } from 'next/dist/shared/lib/router/router';

import dummyAvatar from '../../constants/dummyAvatar.png';
import navCollapse from '../../constants/navCollapse.gif';

const Menu: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [fullNav, setFullNav] = useState<boolean>(false);
  const [colorTheme, setColorTheme] = useState<string>('black');

  const handleNavButtonClick = (label: string) => {
    if (label === 'expand') {
      setFullNav(true);
      const timer = setTimeout(() => {
        setFullNav(false);
      }, 5000); // 30000 milliseconds = 30 seconds

      // Clean up the timer on component unmount or before re-running the effect
      return () => clearTimeout(timer);
    }
    if (label === 'collapse') {
      setFullNav(false);
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    try {
      const params = new URLSearchParams({ token });

      const response = await fetch(`api/fetchmail/gmail?${params.toString()}`);

      if (response.ok) {
        const res = await response.json();
        const userData = res.data;
        setAvatarUrl(userData.picture);
        setUserFirstName(userData.given_name);
        setUserLastName(userData.family_name);
        setUserEmail(userData.email);
      }
    } catch (err) {
      console.log('error occurred while fetching user data');
    }
  };

  useEffect(() => {
    // fetchUserInfo();
  }, []);

  return (
    <>
      <nav
        className={`top-2 border border-gray-300 dark:border-[#27272a] rounded-r-none border-r-0 rounded-full fixed right-0  `}
      >
        <div
          className={`space-x-2 w-auto h-auto bg-white rounded-full rounded-r-none py-1 px-1 pl-2 border-r-0
      backdrop-blur-sm bg-white/60 dark:bg-white/10 flex items-center justify-center transition-all`}
        >
          {fullNav && (
            <button onClick={() => handleNavButtonClick('collapse')}>
              <Image src={navCollapse} alt="collapse" height={20} width={20} />
            </button>
          )}

          {fullNav && <ToggleTheme />}

          <button
            onClick={() =>
              handleNavButtonClick(`${fullNav ? 'collapse' : 'expand'}`)
            }
          >
            <Image
              className="rounded-full p-[0.05rem]"
              src={avatarUrl || dummyAvatar}
              alt="avatarIcon"
              width={30}
              height={30}
            />
          </button>
        </div>
      </nav>
    </>
  );
};

export default Menu;
