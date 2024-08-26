import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';

interface MessageUsersProps {
  onMessage: (userId: string, message: string) => void;
  onBroadcast: (message: string) => void;
}

export function MessageUsers({ onMessage, onBroadcast }: MessageUsersProps) {
  const [userId, setUserId] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleSendMessage = () => {
    if (userId && userMessage) {
      onMessage(userId, userMessage);
      setUserMessage('');
      setUserId('');
    }
  };

  const handleBroadcastMessage = () => {
    if (broadcastMessage) {
      onBroadcast(broadcastMessage);
      setBroadcastMessage('');
    }
  };

  return (
    <Tabs defaultValue="user">
      <div className="flex justify-center">
        <TabsList className="grid  grid-cols-2 w-[350px]">
          <TabsTrigger value="user">Notify User</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="user" className="">
        <Card className="w-[700px]">
          <CardHeader>
            <CardTitle>Send Message to User</CardTitle>
            <CardDescription>
              Enter the user ID and message to send a message to a specific
              user.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="user-message">Message</Label>
              <Textarea
                rows={5}
                id="user-message"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Enter message"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="broadcast">
        <Card className="w-[700px]">
          <CardHeader>
            <CardTitle>Broadcast Message</CardTitle>
            <CardDescription>
              Enter a message to broadcast to all users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="broadcast-message">Broadcast Message</Label>
              <Textarea
                rows={10}
                id="broadcast-message"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter broadcast message"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBroadcastMessage}>Broadcast</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
