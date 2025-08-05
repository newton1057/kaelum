'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, Model, SuggestedQuestion } from '@/lib/types';
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
        content: '¡Hola! Soy ima. ¿Cómo puedo ayudarte hoy?',
      },
    ],
  },
];

function transformSessionToChat(session): Chat {
  return {
    id: session.session_id,
    title: `Chat ${new Date(session.created_at * 1000).toLocaleString()}`,
    messages: session.messages.map((msg, idx) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
    })),
  };
}

export default function ChatLayout({ selectedModel, onModelChange, onDeleteAllChats }) {
  console.log('El componente ChatLayout se está renderizando.'); 
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0].id : null
  );

  useEffect(() => {
    console.log('useEffect ejecutado');
    const fetchChats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5001/chat/sessions');
        const sessions = await res.json();
        console.log('Sesiones obtenidas:', sessions);
        const loadedChats: Chat[] = sessions.map(transformSessionToChat);
        setChats(loadedChats);
        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0].id);
        }
      } catch (error) {
        toast({
          title: 'Error al cargar las conversaciones',
          description: 'No se pudieron cargar los chats desde el servidor.',
          variant: 'destructive',
        });
        console.error('Error loading chats:', error);
      }
    };

    fetchChats();
  }, []);

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
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        suggestedQuestions={
          activeChat?.messages.length === 1 ? SUGGESTED_QUESTIONS : []
        }
        onDeleteAllChats={handleDeleteAllLocalChats}
      />
    </>
  );
}
