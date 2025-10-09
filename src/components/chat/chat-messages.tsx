"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { ChatAvatar } from './chat-avatar';
import { BotCard } from './bot-card';
import { Skeleton } from '../ui/skeleton';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isBotTyping: boolean;
  className?: string;
}

export function ChatMessages({ messages, isBotTyping, className }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  return (
    <div ref={scrollAreaRef} className={cn('h-full w-full overflow-y-auto', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex items-start gap-4', message.role === 'user' && 'justify-end')}
            >
              {message.role === 'bot' && <ChatAvatar role="bot" />}
              <div className={cn('max-w-[85%] lg:max-w-[70%]', message.role === 'user' ? 'flex justify-end' : '')}>
                {message.role === 'bot' ? (
                  <BotCard>{message.content}</BotCard>
                ) : (
                  <div className="rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground shadow-md">
                    {message.content}
                  </div>
                )}
              </div>
              {message.role === 'user' && <ChatAvatar role="user" />}
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-start gap-4">
              <ChatAvatar role="bot" />
              <BotCard>
                <div className="flex items-center space-x-2 p-2">
                  <Skeleton className="h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                  <Skeleton className="h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                  <Skeleton className="h-2.5 w-2.5 animate-bounce rounded-full" />
                </div>
              </BotCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
