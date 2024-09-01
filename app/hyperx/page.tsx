'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

interface AIResponse {
  content: string;
}

export default function QueryBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiResponses, setAIResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    const token = localStorage.getItem('refreshToken')!;
    try {
      const response = await fetch('/api/hyperx/dummy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, token }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setAIResponses((prev) => [...prev, { content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setAIResponses((prev) => [
        ...prev,
        { content: 'Sorry, I encountered an error.' },
      ]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>Open Query Box</Button>
      <DialogContent className="w-[85vw] h-[90vh] flex flex-col p-6 pt-12 pb-0">
        <div className="h-full w-full flex justify-center overflow-hidden">
          <ScrollArea className="w-[60vw] border">
            <div className="p-6">
              {aiResponses.map((response, index) => (
                <div key={index} className="mb-4">
                  <strong>AI: </strong>
                  <ReactMarkdown>{response.content}</ReactMarkdown>
                  <Separator orientation="horizontal" className="my-4" />
                </div>
              ))}
              {isLoading && (
                <div className="text-gray-500">AI is thinking...</div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-baseline justify-center p-4 border-t">
          <div className="w-[40vw] relative">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query here..."
              className="min-h-[50px] max-h-[300px] resize-none border-2 rounded-xl p-4 pr-14 outline-none"
              style={{
                height: 'auto',
                overflow: 'hidden',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 400)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendQuery();
                }
              }}
            />
            <div className="absolute right-2 bottom-4">
              <Button
                variant={'ghost'}
                className="rounded-full px-3 py-6 hover:text-green-700"
                onClick={sendQuery}
                disabled={isLoading}
              >
                <Send className="" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
