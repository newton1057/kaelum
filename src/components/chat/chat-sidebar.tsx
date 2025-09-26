
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
import { LogOut, MessageSquare, Plus, MessageCircle, FolderKanban } from 'lucide-react';
import type { Chat } from '@/lib/types';
import { AppLogo } from '../icons';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';


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
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    setUserType(storedUserType);
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    router.push('/login');
  };
  
  const isGeneralChat = pathname.startsWith('/general');

  const displayedChats = isGeneralChat 
    ? chats.filter(chat => chat.mode === 'general')
    : chats.filter(chat => chat.mode !== 'general');

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <AppLogo />
          <Button variant="ghost" size="icon" onClick={onNewChat}>
            <Plus />
            <span className="sr-only">Nueva Consulta</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
         <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push('/dashboard/expedientes')}
              isActive={pathname === '/dashboard/expedientes'}
              className="w-full justify-start"
            >
              <FolderKanban />
              <span>Expedientes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           {userType !== 'tertiary' && userType !== 'other' && userType !== 'v2' && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/general')}
                isActive={pathname.startsWith('/general')}
                className="w-full justify-start"
              >
                <MessageCircle />
                <span>Chat Medico</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
        <SidebarMenu>
          {displayedChats.map((chat) => (
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
            <SidebarMenuButton
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
