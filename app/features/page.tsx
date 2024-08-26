import Image from 'next/image';
import Features from '@/components/Features';
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between  ">
      <Features />
    </main>
  );
}
