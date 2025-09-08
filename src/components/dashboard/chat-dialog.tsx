
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ChatPanel from '../chat/chat-panel';
import { useState, useEffect } from 'react';
import type { Chat, Message, SuggestedQuestion, PendingFile } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: {
    id: string;
    name: string;
    [key: string]: any;
  };
}


function transformSessionToChat(session: any): Chat {
  const patientName = session.data?.name || session.data?.full_name || session.data?.nombre;
  
  const pendingFiles: PendingFile[] = (session.data?.pending_files || []).map((file: any) => ({
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    url: file.url,
  }));

  return {
    id: session.session_id,
    title: `Consulta de ${patientName}`,
    messages: session.messages.map((msg: any, idx: number) => ({
      id: `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.timestamp,
      attachment: msg.attachment,
    })),
    pendingFiles: pendingFiles.length > 0 ? pendingFiles : undefined,
  };
}


export function ChatDialog({ isOpen, onOpenChange, patient }: ChatDialogProps) {
    const [chat, setChat] = useState<Chat | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && patient?.id) {
            const fetchChatSession = async () => {
                setIsLoading(true);
                setError(null);
                setChat(undefined);
                try {
                    const response = await fetch(`https://kaelumapi-703555916890.northamerica-south1.run.app/medicalRecords/chatSessionMedicalRecord?patientId=${patient.id}`);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'No se pudo cargar la sesión de chat.');
                    }
                    
                    const result = await response.json();
                    
                    if (result.session) {
                        setChat(transformSessionToChat(result.session));
                    } else {
                        // If no session exists, create a new local one to start the conversation
                        setChat({
                            id: uuidv4(), // This will be a temporary ID
                            title: `Consulta de ${patient.name}`,
                            messages: [{
                                id: uuidv4(),
                                role: 'bot',
                                content: `Iniciando nueva consulta para **${patient.name}**. ¿En qué puedo ayudarte hoy?`
                            }]
                        });
                    }

                } catch (err: any) {
                    setError(err.message);
                    toast({
                        variant: 'destructive',
                        title: 'Error al cargar el chat',
                        description: err.message,
                    })
                } finally {
                    setIsLoading(false);
                }
            }
            fetchChatSession();
        }
    }, [isOpen, patient, toast]);


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
  
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col h-full p-4 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-16 w-3/4 rounded-2xl" />
                    </div>
                     <div className="flex items-center justify-end gap-4">
                        <Skeleton className="h-10 w-3/4 rounded-2xl" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex flex-col h-full items-center justify-center p-4">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
         <ChatPanel
              chat={chat}
              onSendMessage={handleSendMessage}
              onSendSuggestedQuestion={handleSendSuggestedQuestion}
              suggestedQuestions={[]}
              className="h-full"
              disabled={false}
            />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{chat?.title || 'Cargando...'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
           {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
