'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import type { Chat } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { AppLogo } from '../icons';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string) => void;
}

export default function ChatPanel({ chat, onSendMessage }: ChatPanelProps) {
  return (
    <SidebarInset className="flex max-h-svh flex-col p-0">
      <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-center">
        <div className="flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <AppLogo />
        </div>
        <div className="hidden md:block">
          <AppLogo />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={chat?.messages ?? []} />
      </div>
      <div className="border-t p-4">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </SidebarInset>
  );
}
