
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, PatientData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import ChatSidebar from './chat-sidebar';
import ChatPanel from './chat-panel';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppHeader } from '../app-header';
import { useToast } from '@/hooks/use-toast';

function transformSessionToChat(session: any): Chat {
  return {
    id: session.session_id,
    title: session.data?.title || `Chat General ${new Date(session.created_at * 1000).toLocaleString()}`,
    messages: session.messages.map((msg: any, idx: number) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
    })),
    mode: 'general',
  };
}

export default function GeneralChatLayout() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/chat/sessions?mode=general');
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
        console.error('Error loading general chats:', error);
        toast({
          title: 'Error al cargar los chats generales',
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

  const handleNewChat = async () => {
    const dataToSend = {
      data: {
        title: 'Nueva Conversación'
      }
    }
    
    const response = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/chat/start?mode=general', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    const result = await response.json();
    
    const newChat: Chat = {
      id: result.session_id,
      title: 'Nueva Conversación',
      messages: [
        {
          id: uuidv4(),
          role: 'bot',
          content: 'Soy ima. ¡Pregúntame lo que sea!',
        },
      ],
      mode: 'general',
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
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
    const botResponseText = result.messages[result.messages.length - 1].text;

    updateMessageInChat(chatId, loadingMessageId, {
      isLoading: false,
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
      }
    }, 25);
  };


  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen" style={{ width: '100%' }}>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
        <SidebarInset className="flex flex-col p-0">
          <AppHeader />
          <div className="flex-1 w-full flex flex-col overflow-y-auto">
            <ChatPanel
              chat={activeChat}
              onSendMessage={handleSendMessage}
              onSendSuggestedQuestion={() => {}}
              suggestedQuestions={[]}
              className="flex-1 flex flex-col"
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
