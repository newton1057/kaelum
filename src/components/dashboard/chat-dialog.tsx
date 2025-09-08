
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ChatPanel from '../chat/chat-panel';
import { useState } from 'react';
import type { Chat, Message, SuggestedQuestion } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: {
    id: string;
    name: string;
    [key: string]: any;
  };
}

export function ChatDialog({ isOpen, onOpenChange, patient }: ChatDialogProps) {
    const [chat, setChat] = useState<Chat | undefined>(() => {
        if (patient) {
            return {
                id: uuidv4(),
                title: `Consulta de ${patient.name}`,
                messages: [{
                    id: uuidv4(),
                    role: 'bot',
                    content: `Iniciando consulta para **${patient.name}**. ¿En qué puedo ayudarte hoy?`
                }]
            }
        }
        return undefined;
    });

  // Dummy functions for now, to be replaced with API calls
  const handleSendMessage = (content: string, file?: File) => {
    if (!chat) return;

     const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
    };

    const botLoadingMessage: Message = {
      id: uuidv4(),
      role: 'bot',
      content: '',
      isLoading: true
    };
    
    setChat(prevChat => {
        if (!prevChat) return;
        return {
            ...prevChat,
            messages: [...prevChat.messages, userMessage, botLoadingMessage]
        }
    });

    console.log(`Message: ${content}`, file);
    // Simulate API call and response
    setTimeout(() => {
        setChat(prevChat => {
            if (!prevChat) return;
            const updatedMessages = prevChat.messages.map(m => m.id === botLoadingMessage.id ? {
                ...m,
                isLoading: false,
                content: "Esta es una respuesta simulada."
            } : m)
            return {
                ...prevChat,
                messages: updatedMessages
            }
        })
    }, 2000);
  };

  const handleSendSuggestedQuestion = (question: SuggestedQuestion) => {
    console.log(`Suggested question: ${question.question}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="flex-1 min-h-0">
            <ChatPanel
              chat={chat}
              onSendMessage={handleSendMessage}
              onSendSuggestedQuestion={handleSendSuggestedQuestion}
              suggestedQuestions={[]}
              className="h-full"
              disabled={false}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
