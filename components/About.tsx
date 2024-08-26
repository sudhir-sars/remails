import Link from 'next/link';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

import MainImage from '@/public/MainImage.png';
import { BorderBeam } from '@/components/magicui/border-beam';

import ShinyButton from '@/components/magicui/shiny-button';
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] justify-center items-center ">
      <NavBar />
      <div className="w-[85vw] flex-col border ">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tighter sm:text-4xl xl:text-5xl">
                    About Our Email Client
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-sm md:text-lg">
                    Our email client app was created to revolutionize the way
                    you manage your inbox. With a focus on productivity,
                    security, and seamless integration, we`&apos;ve developed a
                    suite of powerful features to help you stay organized and
                    efficient.
                  </p>
                  <p className="max-w-[600px] text-muted-foreground text-sm md:text-base">
                    At the core of our app is a deep understanding of the
                    challenges modern professionals face when it comes to email
                    management. We`&apos;ve listened to our users and carefully
                    crafted solutions to address their pain points, from
                    cluttered inboxes to missed deadlines.
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/"
                    className="inline-flex rounded-full h-10 items-center justify-center  bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                  <Link href="#our-mission" className="" prefetch={false}>
                    <ShinyButton
                      text="Our Mission"
                      className="h-10 px-8 rounded-full"
                    />
                  </Link>
                </div>
              </div>
              <div className="w-full h-full relative rounded-xl overflow-hidden">
                <img
                  src={MainImage.src}
                  alt="Main Image"
                  className="w-full h-full object-cover border rounded-xl"
                />
                <BorderBeam size={1000} borderWidth={3} className="" />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 md:px-6">
            <FeatureCard
              icon={<InboxIcon className="w-6 h-6 text-primary-foreground" />}
              title="Inbox Management"
              description="Easily organize and prioritize your emails with advanced filtering and sorting tools."
            />
            <FeatureCard
              icon={
                <CalendarIcon className="w-6 h-6 text-primary-foreground" />
              }
              title="Calendar Integration"
              description="Stay on top of your schedule by seamlessly integrating your email and calendar."
            />
            <FeatureCard
              icon={<TimerIcon className="w-6 h-6 text-primary-foreground" />}
              title="Task Tracking"
              description="Manage your to-dos and deadlines directly from your inbox."
            />
            <FeatureCard
              icon={<LockIcon className="w-6 h-6 text-primary-foreground" />}
              title="Advanced Security"
              description="Rest easy with end-to-end encryption and robust security features."
            />
          </div>
        </section>
        <section
          id="our-mission"
          className="w-full py-12 md:py-24 lg:py-32 bg-light-gray"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Our Mission
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our mission is to empower users with an intuitive, powerful,
                  and secure email management experience. We are dedicated to
                  helping you achieve productivity and efficiency, and to
                  providing exceptional support that makes managing your inbox a
                  breeze.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/contact" className="" prefetch={false}>
                  <ShinyButton
                    text="Contact Us"
                    className="h-10 px-8 rounded-full"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function TimerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-start gap-2 p-4 rounded-lg bg-background">
      <div className="bg-primary rounded-md p-3 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
