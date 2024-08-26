import Link from 'next/link';
import Image from 'next/image';
import dynamicLogo1 from '@/public/DynamicLogo1.png'; // Ensure the correct path
import { ThemeToggle } from './ThemeToggle';
export default function Header() {
  return (
    <header className="sticky top-0 px-4 lg:px-6 h-14 flex items-center border-b bg-background z-50">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <div className="flex items-center justify-center">
          <div className="h-8 w-8">
            <Image
              src={dynamicLogo1}
              alt="dynamic logo"
              width={32}
              height={32}
            />
          </div>
        </div>
        <span className="text-xl font-bold ml-3">Remails</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
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
      </nav>
    </header>
  );
}
