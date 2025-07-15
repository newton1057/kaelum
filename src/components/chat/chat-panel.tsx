'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import type { Chat, Model } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { AppLogo } from '../icons';
import { ModelSelector } from './model-selector';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User } from 'lucide-react';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string) => void;
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

export default function ChatPanel({
  chat,
  onSendMessage,
  selectedModel,
  onModelChange,
}: ChatPanelProps) {
  return (
    <SidebarInset className="flex max-h-svh flex-col p-0">
      <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <AppLogo />
        </div>
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              <User />
            </AvatarFallback>
          </Avatar>
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
