'use client';

import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatPanel from './chat/chat-panel';
import DashboardLayout from './dashboard/dashboard-layout';
import type { Chat, Message, Model, SuggestedQuestion } from '@/lib/types';
import { MODELS } from '@/lib/models';
import { AppHeader } from './app-header';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import ChatSidebar from './chat/chat-sidebar';
import { v4 as uuidv4 } from 'uuid';
import { SUGGESTED_QUESTIONS } from '@/lib/questions';

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
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );
  const { toast } = useToast();
  
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

    // Mock AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: uuidv4(),
        role: 'bot',
        content: `Esta es una respuesta simulada de ${selectedModel.name} a: "${content}". Una IA real proporcionaría una respuesta más útil.`,
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


  const handleDeleteAllChats = () => {
    setChats([]);
    setActiveChatId(null);
    toast({
      title: 'Chats eliminados',
      description: 'Todas tus conversaciones han sido borradas.',
    });
     setTimeout(() => {
      handleNewChat();
    }, 500);
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
          <AppHeader
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onDeleteAllChats={handleDeleteAllChats}
            view={view}
            onViewChange={setView}
          />
          <div className="flex-1 w-full flex flex-col overflow-y-auto">
            {view === 'chat' ? (
              <ChatPanel
                chat={activeChat}
                onSendMessage={handleSendMessage}
                onSendSuggestedQuestion={handleSendSuggestedQuestion}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                suggestedQuestions={
                  activeChat?.messages.length === 1 ? SUGGESTED_QUESTIONS : []
                }
                onDeleteAllChats={handleDeleteAllChats}
                className="flex-1 flex flex-col"
              />
            ) : (
              <DashboardLayout />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
