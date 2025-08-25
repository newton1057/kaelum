'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Chat, Message } from '@/lib/types';
import ChatMessage from './chat-message';
import { AppLogo } from '../icons';

interface ChatMessagesProps {
  chat?: Chat;
  activeChatId: string | null;
}

export default function ChatMessages({ chat, activeChatId }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      setTimeout(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [chat?.messages, activeChatId]);

  const messages = chat?.messages ?? [];
  const hasContent = messages.length > 0 || (chat?.pendingFiles ?? []).length > 0;

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef} viewportRef={viewportRef}>
      <div className="p-4 md:p-6 w-full">
        {!hasContent ? (
          <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
            <AppLogo />
            <p className="text-lg text-muted-foreground">
              Inicia una conversación con ima
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
