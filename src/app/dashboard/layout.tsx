
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, SuggestedQuestion, PendingFile } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import ChatSidebar from '@/components/chat/chat-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { NewPatientDialog } from '@/components/chat/new-patient-dialog';
import type { PatientData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { NewConsultationTypeDialog } from '@/components/chat/new-consultation-type-dialog';
import { ScreeningQuestionnaireDialog } from '@/components/chat/screening-questionnaire-dialog';
import type { ScreeningFormValues } from '@/components/chat/screening-questionnaire-dialog';

const initialChats: Chat[] = [];

function transformSessionToChat(session: any): Chat {
  const patientName = session.data?.name || session.data?.full_name || session.data?.nombre;
  const pendingFiles: PendingFile[] = (session.data?.pending_files || []).map((file: any) => ({
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    url: file.url,
  }));

  return {
    id: session.session_id,
    title: patientName ? `Consulta de ${patientName}` : `Chat ${new Date(session.created_at * 1000).toLocaleString()}`,
    messages: session.messages.map((msg: any, idx: number) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
    })),
    pendingFiles: pendingFiles.length > 0 ? pendingFiles : undefined,
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
  const [isNewConsultationTypeDialogOpen, setIsNewConsultationTypeDialogOpen] = useState(false);
  const [isScreeningQuestionnaireDialogOpen, setIsScreeningQuestionnaireDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          console.error('No user email found in local storage');
          return;
        }

        const res = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/chat/sessions?user=${encodeURIComponent(userEmail)}`);
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

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    router.push('/chat');
  };

  const handleNewPatientChat = async (patientData: PatientData) => {
    const dataToSend = {
      data: patientData
    }

    const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/chat/start', {
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

  const handleSelectConsultationType = (type: 'general' | 'screening') => {
    setIsNewConsultationTypeDialogOpen(false);
    if (type === 'general') {
      setIsNewPatientDialogOpen(true);
    } else {
      setIsScreeningQuestionnaireDialogOpen(true);
    }
  };

  const handleNewScreeningChat = async (formData: ScreeningFormValues) => {
    const dataToSend = {
      data: formData
    }

    const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/chat/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });


    const result = await response.json();
    const newChatId = result.session_id;

    router.push('/chat');
    setIsScreeningQuestionnaireDialogOpen(false);
  };


  return (
    <div
      className="full-screen-dashboard"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        background: 'radial-gradient(1200px 600px at 120% -20%, rgba(210,242,82,0.10) 0%, transparent 60%), linear-gradient(135deg, #031718, #0B2A2B 60%)',
        overflow: 'hidden',
      }}
    >
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={() => setIsNewConsultationTypeDialogOpen(true)}
        onSelectChat={handleSelectChat}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader />
        <div className="flex-1 w-full flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
      <NewConsultationTypeDialog
        isOpen={isNewConsultationTypeDialogOpen}
        onOpenChange={setIsNewConsultationTypeDialogOpen}
        onSelectType={handleSelectConsultationType}
      />
      <NewPatientDialog
        isOpen={isNewPatientDialogOpen}
        onOpenChange={setIsNewPatientDialogOpen}
        onSubmit={handleNewPatientChat}
      />
      <ScreeningQuestionnaireDialog
        isOpen={isScreeningQuestionnaireDialogOpen}
        onOpenChange={setIsScreeningQuestionnaireDialogOpen}
        onSubmit={handleNewScreeningChat}
      />
    </div>
  );
}
