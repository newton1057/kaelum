'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, Plus } from 'lucide-react';
import type { Chat } from '@/lib/types';
import { AppLogo } from '../icons';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <AppLogo />
          <Button variant="ghost" size="icon" onClick={onNewChat}>
            <Plus />
            <span className="sr-only">Nuevo Chat</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => onSelectChat(chat.id)}
                isActive={chat.id === activeChatId}
                className="w-full justify-start"
              >
                <MessageSquare />
                <span>{chat.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start">
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
