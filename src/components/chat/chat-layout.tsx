'use client';

import { useState, useMemo } from 'react';
import type { Chat, Message, Model } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import ChatSidebar from './chat-sidebar';
import ChatPanel from './chat-panel';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MODELS } from '@/lib/models';

const initialChats: Chat[] = [
  {
    id: '1',
    title: 'Bienvenido a ima',
    messages: [
      {
        id: '1-1',
        role: 'bot',
        content: '¡Hola! Soy ima. ¿Cómo puedo ayudarte hoy?',
      },
    ],
  },
  {
    id: '2',
    title: 'Historia de la Antigua Roma',
    messages: [
      { id: '2-1', role: 'user', content: 'Háblame del Imperio Romano.' },
      {
        id: '2-2',
        role: 'bot',
        content:
          'El **Imperio Romano** fue una de las civilizaciones más influyentes de la historia, con una duración de más de mil años. \n\nComenzó en el 27 a.C. cuando *Augusto* se convirtió en el primer emperador romano. \n\nPuedes aprender más sobre:\n- La República Romana\n- Las Guerras Púnicas\n- La caída del Imperio',
      },
      { id: '2-3', role: 'user', content: '¿Qué causó su caída?' },
      {
        id: '2-4',
        role: 'bot',
        content:
          'La caída del Imperio Romano de Occidente en el 476 d.C. fue causada por una combinación de factores, entre ellos: `inestabilidad económica`, `corrupción política`, `sobreexpansión` e `invasiones bárbaras`.',
      },
    ],
  },
];

export default function ChatLayout() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);

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

  const handleSendMessage = (content: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    };

    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
        };
      }
      return chat;
    });
    setChats(updatedChats);

    // Mock AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: uuidv4(),
        role: 'bot',
        content: `Esta es una respuesta simulada de ${selectedModel.name} a: "${content}". Una IA real proporcionaría una respuesta más útil.`,
      };
      const finalChats = updatedChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, botMessage],
          };
        }
        return chat;
      });
      setChats(finalChats);
    }, 1000);
  };

  return (
    <SidebarProvider defaultOpen>
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <ChatPanel
        chat={activeChat}
        onSendMessage={handleSendMessage}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </SidebarProvider>
  );
}
