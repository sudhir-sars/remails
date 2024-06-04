import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/main/theme';
import Mail from '@/components/main/Mail';

export default function Home() {
  return (
    <main className=" flex min-h-screen flex-col items-center justify-between p-2">
      <Mail />
    </main>
  );
}
