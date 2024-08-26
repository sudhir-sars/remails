'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import io from 'socket.io-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { DataTablePagination } from '@/components/admin/TablePagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SparklesText from '@/components/magicui/sparkles-text';

import { ThemeToggle } from '@/components/ThemeToggle';

const socket = io(`${process.env.NEXT_PUBLIC_WEB_SOCKET_URI}`);
import ScaledApp from '@/components/Scaler';

interface User {
  id: string;
  username: string;
  email: string;
  status: 'online' | 'offline';
}
import { MessageUsers } from '@/components/admin/MessageUsers';
import UserTable from '@/components/admin/UserTable';

const HomePage = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    console.log(connectedUsers);
  }, [connectedUsers]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('adminToken');

      if (token) {
        try {
          const response = await fetch('/api/auth/admin/verifyExistingUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          const data = await response.json();

          if (response.ok) {
            setUsername(data.user.username);
            socket.emit('adminConnect', token);

            socket.on('broadcastMessage', (message: string) => {
              toast.info(`Broadcast message: ${message}`);
            });

            socket.on('connectedUsers', (users: User[]) => {
              setConnectedUsers(users);
            });

            return () => {
              socket.off('broadcastMessage');
              socket.off('connectedUsers');
            };
          } else {
            localStorage.removeItem('adminToken');
            router.push('/admin');
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          localStorage.removeItem('adminToken');
          router.push('/admin');
        }
      } else {
        router.push('/admin');
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    socket.disconnect();
    router.push('/admin');
  };

  const handleMessageUser = (userId: string, username: string) => {
    const message = prompt(`Enter message for ${username}:`);
    if (message) {
      socket.emit('broadcastToUser', { userId, message });
      toast(`Message sent to ${username}`, {
        description: `Message: ${message}`,
        duration: 10000,
        position: 'top-right',
        closeButton: true,
      });
    }
  };
  const handleNotifyUser = (userId: string, message: string) => {
    socket.emit('broadcastToUser', { userId, message });
    toast(`Message sent to user with ID ${userId}`, {
      description: `Message: ${message}`,
      duration: 10000,
      position: 'top-right',
      closeButton: true,
    });
  };

  const handleBroadcastMessage = (message: string) => {
    socket.emit('broadcastToAll', message);
    setBroadcastMessage('');
    toast('Broadcast message sent', {
      description: `Message: ${message}`,
      duration: 10000,
      position: 'top-right',
      closeButton: true,
    });
  };

  const handleDisconnect = (userId: string, username: string) => {
    socket.emit('disconnectUser', userId);
    toast(`Disconnected ${username}`, {
      description: `User ${username} has been disconnected.`,
      duration: 10000,
      position: 'top-right',
      closeButton: true,
    });
  };

  return (
    <ScaledApp>
      <div className="flex min-h-screen flex-col ">
        <div className="flex flex-col min-h-[100dvh] ">
          <header className="sticky top-0 px-4 lg:px-6 h-14 flex items-center border-b bg-background z-50 mt-6 mx-44">
            <Link
              href="#"
              className="flex items-center justify-center"
              prefetch={false}
            >
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6">
              <Link
                href="/"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Features
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                About
              </Link>
              <Link
                href="#"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Contact
              </Link>
              <ThemeToggle />
              <Button variant={'outline'} onClick={handleLogout}>
                Logout
              </Button>
            </nav>
          </header>

          <main className="flex-col space-y-12 p-8 mx-44">
            <UserTable
              connectedUsers={connectedUsers}
              onDisconnect={handleDisconnect}
              onMessage={handleMessageUser}
            />
            <div className="flex justify-center">
              <MessageUsers
                onBroadcast={handleBroadcastMessage}
                onMessage={handleNotifyUser}
              />
            </div>
          </main>
        </div>
      </div>
    </ScaledApp>
  );
};

export default HomePage;
