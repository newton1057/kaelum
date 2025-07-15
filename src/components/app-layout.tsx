'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatLayout from './chat/chat-layout';
import DashboardLayout from './dashboard/dashboard-layout';
import type { Model } from '@/lib/types';
import { MODELS } from '@/lib/models';
import { AppHeader } from './app-header';
import { SidebarProvider } from './ui/sidebar';

export default function AppLayout() {
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const { toast } = useToast();

  const handleDeleteAllChats = () => {
    // This logic might need to be adjusted depending on where chats are stored
    toast({
      title: 'Chats eliminados',
      description: 'Todas tus conversaciones han sido borradas.',
    });
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex flex-col h-screen">
        <AppHeader
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onDeleteAllChats={handleDeleteAllChats}
          view={view}
          onViewChange={setView}
        />
        <div className="flex-1 overflow-hidden">
          {view === 'chat' ? (
            <ChatLayout
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onDeleteAllChats={handleDeleteAllChats}
            />
          ) : (
            <DashboardLayout />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
