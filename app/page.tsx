// 'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MailComponent from '@/components/mail/MailPage';
// import Mail from '@/components/main/Mail';

export default function Home() {
  return (
    <main className=" flex max-h-screen h-screen w-screen border flex-col items-center justify-between ">
      <MailComponent />
    </main>
  );
}
