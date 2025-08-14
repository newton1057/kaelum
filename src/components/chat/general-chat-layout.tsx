
'use client';

import { useState, useMemo } from 'react';
import type { Chat, Message } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import ChatSidebar from './chat-sidebar';
import ChatPanel from './chat-panel';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppHeader } from '../app-header';

const initialChats: Chat[] = [
  {
    id: 'general-1',
    title: 'General Chat',
    messages: [
      {
        id: '1-1',
        role: 'bot',
        content: '¡Hola! Soy ima. Este es un chat general. ¿Cómo puedo ayudarte hoy?',
      },
    ],
  },
];

export default function GeneralChatLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId]
  );

  const handleNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'Nueva Conversación',
      messages: [
        {
          id: uuidv4(),
          role: 'bot',
          content: 'Soy ima. ¡Pregúntame lo que sea!',
        },
      ],
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

  const handleSendMessage = (content: string) => {
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

    // Mock AI response
    setTimeout(() => {
        updateMessageInChat(activeChatId, botLoadingMessageId, {
            isLoading: false,
        });

      const responseText = `Esta es una respuesta simulada a: "${content}". Una IA real proporcionaría una respuesta más útil.`;
      let currentText = '';
      let charIndex = 0;
      const interval = setInterval(() => {
      if (charIndex < responseText.length) {
        currentText += responseText.charAt(charIndex);
        updateMessageInChat(activeChatId, botLoadingMessageId, {
          content: currentText,
        });
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 25); 

    }, 1500);
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
