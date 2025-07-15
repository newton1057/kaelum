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
    title: 'Welcome to SynapseAI',
    messages: [
      {
        id: '1-1',
        role: 'bot',
        content: 'Hello! I am SynapseAI. How can I help you today?',
      },
    ],
  },
  {
    id: '2',
    title: 'History of Ancient Rome',
    messages: [
      { id: '2-1', role: 'user', content: 'Tell me about the Roman Empire.' },
      {
        id: '2-2',
        role: 'bot',
        content:
          'The Roman Empire was one of the most influential civilizations in world history, lasting for over a thousand years. It began in 27 BC when Augustus became the first Roman emperor.',
      },
      { id: '2-3', role: 'user', content: 'What caused its fall?' },
      {
        id: '2-4',
        role: 'bot',
        content:
          'The fall of the Western Roman Empire in 476 AD was caused by a combination of factors, including economic instability, political corruption, overexpansion, and barbarian invasions.',
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
      title: 'New Conversation',
      messages: [
        {
          id: uuidv4(),
          role: 'bot',
          content: 'I am SynapseAI. Ask me anything!',
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
        content: `This is a mock response from ${selectedModel.name} to: "${content}". A real AI would provide a more helpful answer.`,
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
