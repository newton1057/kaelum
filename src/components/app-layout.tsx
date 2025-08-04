'use client';

import { useState, useMemo } from 'react';
import ChatPanel from './chat/chat-panel';
import type { Chat, Message, SuggestedQuestion } from '@/lib/types';
import { AppHeader } from './app-header';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import ChatSidebar from './chat/chat-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { SUGGESTED_QUESTIONS } from '@/lib/questions';
import { NewPatientDialog } from './chat/new-patient-dialog';
import type { PatientData } from '@/lib/types';

const initialChats: Chat[] = [
  {
    id: '1',
    title: 'Demo',
    messages: [
      {
        id: '1-1',
        role: 'bot',
        content: '¡Hola! Soy ima. ¿Cómo puedo ayudarte hoy?',
      },
    ],
  },
];

export default function AppLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId]
  );

  const handleNewChat = (patientData: PatientData) => {
    let patientSummary = `Iniciando consulta para **${patientData.name}**.`;
    if (patientData.age || patientData.gender || patientData.height || patientData.weight) {
      patientSummary += `\n- **Paciente:** `;
      const details = [];
      if (patientData.age) details.push(`${patientData.age} años`);
      if (patientData.gender) details.push(patientData.gender);
      if (patientData.height) details.push(`${patientData.height} cm`);
      if (patientData.weight) details.push(`${patientData.weight} kg`);
      patientSummary += details.join(', ');
    }
    if (patientData.medicalHistory) {
      patientSummary += `\n- **Historial Médico:** ${patientData.medicalHistory}`;
    }
    if (patientData.medications) {
      patientSummary += `\n- **Medicamentos Actuales:** ${patientData.medications}`;
    }
    if (patientData.allergies) {
      patientSummary += `\n- **Alergias:** ${patientData.allergies}`;
    }

    const newChat: Chat = {
      id: uuidv4(),
      title: `Consulta de ${patientData.name}`,
      messages: [
        {
          id: uuidv4(),
          role: 'bot',
          content: `${patientSummary}\n\n¿En qué puedo ayudarte hoy?`,
        },
      ],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setIsNewPatientDialogOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      })
    );
  };

  const updateMessageInChat = (
    chatId: string,
    messageId: string,
    updatedMessage: Partial<Message>
  ) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updatedMessage } : msg
            ),
          };
        }
        return chat;
      })
    );
  };

  const handleSendMessage = (content: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    };
    addMessageToChat(activeChatId, userMessage);

    // Mock AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: uuidv4(),
        role: 'bot',
        content: `Esta es una respuesta simulada de ima a: "${content}". Una IA real proporcionaría una respuesta más útil.`,
      };
      addMessageToChat(activeChatId, botMessage);
    }, 1000);
  };

  const handleSendSuggestedQuestion = (question: SuggestedQuestion) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: question.question,
    };
    addMessageToChat(activeChatId, userMessage);

    const botMessageId = uuidv4();
    const botMessage: Message = {
      id: botMessageId,
      role: 'bot',
      content: '',
      reasoning: '',
      isReasoningComplete: false,
    };
    addMessageToChat(activeChatId, botMessage);

    // Random delay between 6 to 10 seconds
    const randomDelay = Math.random() * (10000 - 6000) + 6000;

    setTimeout(() => {
      // Simulate typing for reasoning letter by letter
      let reasoningText = '';
      let charIndex = 0;

      const interval = setInterval(() => {
        if (charIndex < question.reasoning.length) {
          reasoningText += question.reasoning.charAt(charIndex);
          updateMessageInChat(activeChatId, botMessageId, {
            reasoning: reasoningText,
          });
          charIndex++;
        } else {
          clearInterval(interval);
          // Finish reasoning and add final answer
          updateMessageInChat(activeChatId, botMessageId, {
            isReasoningComplete: true,
            content: question.answer,
          });
        }
      }, 25); // Interval per character
    }, randomDelay);
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
            <ChatPanel
              chat={activeChat}
              onSendMessage={handleSendMessage}
              onSendSuggestedQuestion={handleSendSuggestedQuestion}
              suggestedQuestions={
                activeChat?.messages.length === 1 ? SUGGESTED_QUESTIONS : []
              }
              className="flex-1 flex flex-col"
            />
          </div>
        </SidebarInset>
      </div>
      <NewPatientDialog
        isOpen={isNewPatientDialogOpen}
        onOpenChange={setIsNewPatientDialogOpen}
        onSubmit={handleNewChat}
      />
    </SidebarProvider>
  );
}
