
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, SuggestedQuestion } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import ChatSidebar from './chat-sidebar';
import ChatPanel from './chat-panel';
import { SUGGESTED_QUESTIONS } from '@/lib/questions';
import { useToast } from '@/hooks/use-toast';

const initialChats: Chat[] = [
  {
    id: '1',
    title: 'Demo',
    messages: [
      {
        id: '1-1',
        role: 'bot',
        content: '¡Hola! Soy Kaelum. ¿Cómo puedo ayudarte hoy?',
      },
    ],
  },
];

export default function ChatLayout({ onDeleteAllChats }) {
  console.log('El componente ChatLayout se está renderizando.'); 
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
          content: 'Soy Kaelum. ¡Pregúntame lo que sea!',
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
        content: `Esta es una respuesta simulada a: "${content}". Una IA real proporcionaría una respuesta más útil.`,
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

    // Simulate typing for reasoning
    let reasoningText = '';
    const reasoningWords = question.reasoning.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < reasoningWords.length) {
        reasoningText += (wordIndex > 0 ? ' ' : '') + reasoningWords[wordIndex];
        updateMessageInChat(activeChatId, botMessageId, {
          reasoning: reasoningText,
        });
        wordIndex++;
      } else {
        clearInterval(interval);
        // Finish reasoning and add final answer
        updateMessageInChat(activeChatId, botMessageId, {
          isReasoningComplete: true,
          content: question.answer,
        });
      }
    }, 50);
  };

  const handleDeleteAllLocalChats = () => {
    setChats([]);
    setActiveChatId(null);
    onDeleteAllChats(); // Call parent handler
    // Create a new initial chat after deletion
    setTimeout(() => {
      handleNewChat();
    }, 500);
  };


  return (
    <>
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <ChatPanel
        chat={activeChat}
        onSendMessage={handleSendMessage}
        onSendSuggestedQuestion={handleSendSuggestedQuestion}
        suggestedQuestions={
          activeChat?.messages.length === 1 ? SUGGESTED_QUESTIONS : []
        }
      />
    </>
  );
}
