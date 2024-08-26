'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // Import the toast function from sonner

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/NavBar'; // Import the Header component

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
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

          if (response.ok) {
            router.push('/admin/home');
          }
        } catch (error) {
          // Handle token verification errors
          console.error('Token verification failed', error);
        }
      }
    };

    verifyToken();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Both username and password are required.', {
        position: 'top-right',
        closeButton: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Send login request to the server
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage (consider using cookies for better security)
        localStorage.setItem('adminToken', data.token);

        // Redirect to admin panel
        router.push('/admin/home');

        // Display success message
        toast.success('Login successful! Redirecting to admin panel...', {
          position: 'top-right',
          closeButton: true,
        });
      } else {
        // Display error message
        toast.error(
          data.message ||
            'Login failed. Please check your username and password.',
          {
            position: 'top-right',
            closeButton: true,
          }
        );
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error('An unexpected error occurred. Please try again later.', {
        position: 'top-right',
        closeButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <div className="flex items-center justify-center">
        <div className="w-[85vw]">
          <Header /> {/* Include the Header component */}
        </div>
      </div>
      <div className="flex items-center justify-center flex-grow p-4">
        <div className="mx-auto max-w-md space-y-6 p-6 shadow-md rounded-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access the admin panel.
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <Card>
              <CardContent className="space-y-4 py-10">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardFooter>
            </Card>
          </form>
          <div className="text-center"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
