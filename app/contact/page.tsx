import Image from 'next/image';
import ContactPage from '@/components/ContactPage';
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between   ">
      <ContactPage />
    </main>
  );
}
