'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, SuggestedQuestion } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { NewPatientDialog } from '@/components/chat/new-patient-dialog';
import type { PatientData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const initialChats: Chat[] = [];

function transformSessionToChat(session: any): Chat {
  return {
    id: session.session_id,
    title: session.data?.name ? `Consulta de ${session.data.name}` : `Chat ${new Date(session.created_at * 1000).toLocaleString()}`,
    messages: session.messages.map((msg: any, idx: number) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
    })),
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/chat/sessions');
        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();
        const loadedChats: Chat[] = result.sessions.map(transformSessionToChat);
        setChats(loadedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    fetchChats();
  }, []);

  const handleNewChat = () => {
    // For dashboard, new chat should probably open the dialog, 
    // which is handled by onNewChat in the sidebar
     router.push('/chat');
     // We can't directly open the dialog here as it belongs to AppLayout.
     // A better approach would be to use a global state manager, but for now
     // redirecting to the chat page where a new chat can be created is a
     // reasonable UX. Or, we can just trigger the dialog if we move the dialog logic up.
     // For now, let's keep it simple. The user can click "New Chat" on the /chat page.
     // The button in the sidebar now has a single responsibility.
     setIsNewPatientDialogOpen(true);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    router.push('/chat');
  };
  
  const handleNewPatientChat = async (patientData: PatientData) => {
    const dataToSend = {
      data: patientData
    }
    
    const response = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/chat/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });


    const result = await response.json();
    const newChatId = result.session_id;

    // After creating, redirect to chat page and let it handle the new chat.
    // A more robust solution might use global state (Context/Redux)
    // to update the chat list across layouts.
    // For now, we fetch chats again on the chat page.
    router.push('/chat');
    setIsNewPatientDialogOpen(false);
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen" style={{ width: '100%' }}>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={() => setIsNewPatientDialogOpen(true)}
          onSelectChat={handleSelectChat}
        />
        <SidebarInset className="flex flex-col p-0">
          <AppHeader />
          <div className="flex-1 w-full flex flex-col overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </div>
      <NewPatientDialog
        isOpen={isNewPatientDialogOpen}
        onOpenChange={setIsNewPatientDialogOpen}
        onSubmit={handleNewPatientChat}
      />
    </SidebarProvider>
  );
}
