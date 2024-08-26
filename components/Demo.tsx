'use client';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import SparklesText from '@/components/magicui/sparkles-text';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import { BorderBeam } from '@/components/magicui/border-beam';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Github, MailOpen, Video } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import ShinyButton from '@/components/magicui/shiny-button';
import Image from 'next/image';
import MainImage from '@/public/MainImage.png';
import carouselImages from '@/utils/carouselImages';

import dynamicLogo1 from '@/public/DynamicLogo1.png';
import BoxReveal from '@/components/magicui/box-reveal';
import NavBar from './NavBar';
import Footer from './Footer';

export default function Component() {
  const showToast = () => {
    toast.success(`New mail from: ${'sender'}`, {
      description: ` Subject: ${'subject'}`,
      duration: 10000,
      position: 'top-right',
      closeButton: true,
    });
  };

  return (
    <div className="flex flex-col min-h-[100dvh] ">
      <NavBar />

      <main className="flex-1">
        <section className="w-full py-8 md:py-18 lg:py-26 xl:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl   tracking-tighter sm:text-5xl xl:text-6xl">
                  <SparklesText
                    text="Welcome to Remails"
                    className="font-medium"
                  />
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-sm">
                  Remails is a powerful messaging and collaboration platform
                  that brings your team together. Our platform combines
                  innovative features with a user-friendly interface to enhance
                  communication and streamline workflows.
                </p>
                <p className="max-w-[600px] text-muted-foreground md:text-sm">
                  Discover how Remails can transform your team’s communication
                  with our advanced email management, intuitive design, and
                  seamless integrations. Start using Remails today and
                  experience the future of efficient team collaboration.
                </p>
                <div className="flex flex-col gap-10 min-[400px]:flex-row">
                  <Link
                    href="#"
                    className="inline-flex rounded-full h-10 items-center justify-center  bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                  <Link href="#" className="" prefetch={false}>
                    <ShinyButton
                      text="Learn More"
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
        <section className="w-full flex justify-center items-center flex-col mt-14">
          <div className="w-[70vw] bg-border rounded-full h-1 mb-3"></div>
          <div className="w-[75vw] py-0 md:py-0 lg:py-0 bg-background rounded-xl mb-20 overflow-hidden flex justify-center items-center">
            <div className="w-full h-full px-0 md:px-0">
              <Carousel
                opts={{
                  loop: true,
                }}
                autoplay={true}
                autoplayInterval={3000}
                className="w-full h-full"
              >
                <CarouselContent className="w-full h-full">
                  {carouselImages.map((image, index) => (
                    <CarouselItem className="w-full h-full" key={index}>
                      <img
                        src={image.src}
                        alt={`Feature ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </section>

        <section className="w-full  py-12 md:py-24 lg:py-32 bg-muted rounded-xl">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  See Remails in Action
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Watch our video to learn how Remails can transform the way
                  your team communicates and collaborates.
                </p>
              </div>
              <div className="w-[80vw] h-80vh max-w-4xl rounded-xl overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Remails Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
        {/* New Section: Simulated Browser Window */}
        {/* <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Try Remails in a Simulated Browser Window
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Interact with the live Remails app in a simulated browser
                  window right here.
                </p>
              </div>
              <div className="w-full h-[500px] max-w-4xl border-2 border-gray-300 rounded-xl overflow-hidden">
                <iframe
                  src="https://lucide.dev/" // Replace with the actual app URL
                  title="Remails App"
                  frameBorder="0"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section> */}
      </main>
      <Footer />
    </div>
  );
}
