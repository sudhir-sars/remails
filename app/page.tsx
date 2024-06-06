import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MailPage from '@/components/mail/page';
// import Mail from '@/components/main/Mail';

export default function Home() {
  return (
    <main className=" flex max-h-screen  flex-col items-center justify-between ">
      <MailPage />
    </main>
  );
}
