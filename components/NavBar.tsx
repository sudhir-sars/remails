'use client';
import Link from 'next/link';
import Image from 'next/image';
import dynamicLogo1 from '@/public/DynamicLogo1.png';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link
        href="/"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
      >
        Home
      </Link>
      <Link
        href="/admin"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
      >
        Admin
      </Link>
      <Link
        href="/features"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
      >
        Features
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
      >
        About
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium hover:underline underline-offset-4"
        prefetch={false}
      >
        Contact
      </Link>
      <ThemeToggle />
    </>
  );

  return (
    <header className="w-full flex items-center justify-between sticky top-0 px-4 lg:px-6 h-14 border-b bg-background z-50">
      <Link href="/" className="flex items-center" prefetch={false}>
        <div className="h-8 w-8">
          <Image src={dynamicLogo1} alt="dynamic logo" width={32} height={32} />
        </div>
        <span className="text-xl font-bold ml-3  md:inline">Remails</span>
      </Link>

      <nav className="hidden md:flex items-center space-x-6">
        <NavLinks />
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <button className="md:hidden">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col space-y-4 mt-6">
            <NavLinks />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
