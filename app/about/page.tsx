import Image from 'next/image';
import Features from '@/components/Features';
import AboutPage from '@/components/About';
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between  ">
      <AboutPage />
    </main>
  );
}
