
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Chat, Message, PatientData, PendingFile } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import ChatSidebar from './chat-sidebar';
import ChatPanel from './chat-panel';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppHeader } from '../app-header';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

function transformSessionToChat(session: any): Chat {
  const pendingFiles: PendingFile[] = (session.data?.pending_files || []).map((file: any) => ({
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    url: file.url,
  }));

  return {
    id: session.session_id,
    title: session.title || `Chat General ${new Date(session.created_at * 1000).toLocaleString()}`,
    messages: session.messages.map((msg: any, idx: number) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
      attachment: msg.attachment,
    })),
    mode: 'general',
    pendingFiles: pendingFiles.length > 0 ? pendingFiles : undefined,
  };
}

export default function GeneralChatLayout() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          console.error('No user email found in local storage');
          return;
        }
        const res = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/chat/sessions?mode=general&user=${encodeURIComponent(userEmail)}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const result = await res.json();

        const loadedChats: Chat[] = result.sessions.map(transformSessionToChat);
        setChats(loadedChats);

        // Verificar si hay un parámetro newChat en la URL
        const newChatId = searchParams.get('newChat');
        if (newChatId) {
          const chatExists = loadedChats.some(chat => chat.id === newChatId);

          if (!chatExists) {
            // Crear el objeto del chat inmediatamente para que sea funcional
            const newChat: Chat = {
              id: newChatId,
              title: 'Nueva Conversación',
              messages: [],
              mode: 'general',
            };

            // Agregar el nuevo chat a la lista
            setChats([newChat, ...loadedChats]);
            setActiveChatId(newChatId);

            // Recargar después para obtener la versión actualizada del servidor
            setTimeout(async () => {
              const retryRes = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/chat/sessions?mode=general&user=${encodeURIComponent(userEmail)}`);
              if (retryRes.ok) {
                const retryResult = await retryRes.json();
                const retryChats: Chat[] = retryResult.sessions.map(transformSessionToChat);

                // Verificar si el nuevo chat está en la respuesta del servidor
                const serverHasNewChat = retryChats.some(chat => chat.id === newChatId);

                if (serverHasNewChat) {
                  // Si el servidor ya tiene el chat, usar la versión del servidor
                  setChats(retryChats);
                } else {
                  // Si el servidor aún no tiene el chat, mantener el local junto con los del servidor
                  // Verificar que el chat local aún exista en el estado actual
                  setChats(prevChats => {
                    const localNewChat = prevChats.find(c => c.id === newChatId);
                    if (localNewChat) {
                      // Mantener el chat local al principio de la lista
                      return [localNewChat, ...retryChats.filter(c => c.id !== newChatId)];
                    }
                    return retryChats;
                  });
                }

                // Mantener el nuevo chat activo
                setActiveChatId(newChatId);
              }
            }, 1000);
          } else {
            // Si el chat ya existe, solo establecerlo como activo
            setActiveChatId(newChatId);
          }
        } else if (loadedChats.length > 0) {
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
  }, [toast, searchParams]);


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

    const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/chat/start?mode=general', {
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
          content: 'Soy MentalBeat. ¡Pregúntame lo que sea!',
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

  const updateChatTitle = (chatId: string, title: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, title };
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

    const userEmail = localStorage.getItem('userEmail');
    const formData = new FormData();
    formData.append('session_id', activeChatId);
    formData.append('msg', content);
    if (userEmail) {
      formData.append('user', userEmail);
    }
    if (file) {
      formData.append('multimedia', file);
    }

    await sendMessageToServer(formData, activeChatId, botLoadingMessageId);
  };

  const sendMessageToServer = async (data: FormData, chatId: string, loadingMessageId: string) => {
    const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/chat/message', {
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
    const botAttachment = result.messages[result.messages.length - 1].attachment;
    const newTitle = result.title;

    if (newTitle) {
      updateChatTitle(chatId, newTitle);
    }

    updateMessageInChat(chatId, loadingMessageId, {
      isLoading: false,
      attachment: botAttachment,
      content: botResponseText,
    });
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
          <div className="flex-1 w-full flex flex-col overflow-hidden">
            <ChatPanel
              chat={activeChat}
              onSendMessage={handleSendMessage}
              onSendSuggestedQuestion={() => { }}
              suggestedQuestions={[]}
              className="flex-1 flex flex-col"
              disabled={!activeChatId}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
