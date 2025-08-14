
'use client';

import { useState, useMemo, useEffect } from 'react';
import ChatPanel from './chat/chat-panel';
import type { Chat, Message, SuggestedQuestion } from '@/lib/types';
import { AppHeader } from './app-header';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import ChatSidebar from './chat/chat-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { SUGGESTED_QUESTIONS } from '@/lib/questions';
import { NewPatientDialog } from './chat/new-patient-dialog';
import type { PatientData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
      attachment: msg.attachment,
    })),
  };
}

export default function AppLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const { toast } = useToast();

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

        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0].id);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast({
          title: 'Error al cargar las conversaciones',
          description: 'No se pudieron cargar los chats desde el servidor.',
          variant: 'destructive',
        });
      }
    };

    fetchChats();
  }, [toast]);


  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId]
  );

  const handleNewChat = async (patientData: PatientData) => {
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
    const data = result.data;
    console.log('Response from server:', data);
    
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
      id: result.session_id,
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

  const handleSendMessage = async (content: string, file?: File) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    };
    if (file) {
      userMessage.attachment = {
        name: file.name,
        contentType: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // Create a temporary URL for preview
      };
    }

    addMessageToChat(activeChatId, userMessage);

    const botLoadingMessageId = uuidv4();
    const botLoadingMessage: Message = {
      id: botLoadingMessageId,
      role: 'bot',
      content: '',
      isLoading: true,
    };
    addMessageToChat(activeChatId, botLoadingMessage);

    const formData = new FormData();
    formData.append('session_id', activeChatId);
    formData.append('msg', content);
    if (file) {
      formData.append('multimedia', file);
    }

    await sendMessageToServer(formData, activeChatId, botLoadingMessageId);
  };

  const sendMessageToServer = async (data: FormData, chatId: string, loadingMessageId: string) => {
    const response = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/chat/message', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      updateMessageInChat(chatId, loadingMessageId, { 
        content: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.',
        isLoading: false,
      });
      return;
    }

    const result = await response.json();
    console.log('Response from server:', result);

    const botResponseText = result.messages[result.messages.length - 1].text;
    const botAttachment = result.messages[result.messages.length - 1].attachment;

    updateMessageInChat(chatId, loadingMessageId, {
      isLoading: false,
      isReasoningComplete: false,
      attachment: botAttachment,
    });
    
    let currentText = '';
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < botResponseText.length) {
        currentText += botResponseText.charAt(charIndex);
        updateMessageInChat(chatId, loadingMessageId, {
          content: currentText,
        });
        charIndex++;
      } else {
        clearInterval(interval);
        updateMessageInChat(chatId, loadingMessageId, {
          isReasoningComplete: true, 
        });
      }
    }, 25); 
  }

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
          <div className="flex-1 w-full flex flex-col overflow-hidden">
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
