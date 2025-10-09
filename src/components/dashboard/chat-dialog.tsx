
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
  isDemoMode: boolean;
}


function transformSessionToChat(session: any): Chat {
  const patientName = session.data?.name || session.data?.full_name || session.data?.nombre || "Paciente";
  
  const pendingFiles: PendingFile[] = (session.data?.pending_files || []).map((file: any) => ({
    name: file.name,
    contentType: file.contentType,
    size: file.size,
    url: file.url,
  }));

  // Sort messages by timestamp, then by sender (user before model)
  const sortedMessages = (session.messages || []).sort((a: any, b: any) => {
    const timeA = a.created_at || 0;
    const timeB = b.created_at || 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    // If timestamps are the same, user messages come first
    if (a.sender === 'user' && b.sender === 'model') {
      return -1;
    }
    if (a.sender === 'model' && b.sender === 'user') {
      return 1;
    }
    return 0;
  });

  return {
    id: session.session_id,
    title: `Consulta de ${patientName}`,
    messages: sortedMessages.map((msg: any, idx: number) => ({
      id: msg.id || `${session.session_id}-${idx}`,
      role: msg.sender === 'model' ? 'bot' : 'user',
      content: msg.text,
      timestamp: msg.created_at,
      attachment: msg.attachment,
    })),
    pendingFiles: pendingFiles.length > 0 ? pendingFiles : undefined,
  };
}


export function ChatDialog({ isOpen, onOpenChange, patient, isDemoMode }: ChatDialogProps) {
    const [chat, setChat] = useState<Chat | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && patient?.id) {
            if (isDemoMode) {
                setIsLoading(false);
                setError(null);
                setChat({
                    id: patient.id,
                    title: `Consulta de ${patient.name}`,
                    messages: [{
                        id: uuidv4(),
                        role: 'bot',
                        content: `Iniciando nueva consulta para **${patient.name}** (Modo Demo). ¿En qué puedo ayudarte hoy?`
                    }]
                });
                return;
            }

            const fetchChatSession = async () => {
                setIsLoading(true);
                setError(null);
                setChat(undefined);
                try {
                    const url = `https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/chatSessionMedicalRecord?patientId=${patient.id}`;
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'No se pudo cargar la sesión de chat.');
                    }
                    
                    const result = await response.json();
                    
                    if (result && result.messages) {
                        setChat(transformSessionToChat(result));
                    } else {
                        // If no session exists, create a new local one to start the conversation
                        setChat({
                            id: uuidv4(), // This will be a temporary ID, API should handle session creation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, patient, isDemoMode, toast]);

    const handleSendMessage = async (content: string, file?: File) => {
        if (!chat) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content,
        };
        // Add file handling later if needed

        const botLoadingMessageId = uuidv4();
        const botLoadingMessage: Message = {
            id: botLoadingMessageId,
            role: 'bot',
            content: '',
            isLoading: true
        };

        setChat(prevChat => {
            if (!prevChat) return undefined;
            return {
                ...prevChat,
                messages: [...prevChat.messages, userMessage, botLoadingMessage]
            };
        });

        if (isDemoMode) {
             setTimeout(() => {
                setChat(prevChat => {
                    if (!prevChat) return undefined;
                    let botResponse = "Esta es una respuesta de demostración. La funcionalidad completa está desactivada en Modo Demo.";

                    if (content.toLowerCase().includes('análisis') || content.toLowerCase().includes('analisis')) {
                        botResponse = `
### Análisis Clínico Avanzado (Simulación)

**Paciente:** ${patient.name}, ${patient.age} años.

**1. Resumen Clínico y Hallazgos:**
- **Síntomas Principales:** El paciente reporta fatiga persistente y cefaleas tensionales durante las últimas 3 semanas.
- **Historial Relevante:** Antecedentes de hipertensión arterial (HTA) en tratamiento con Losartán 50mg.
- **Datos Biométricos:** IMC de 28.5, indicando sobrepeso.

**2. Diagnósticos Diferenciales (Basado en Síntomas):**
- **Trastorno de Ansiedad Generalizada (TAG):** La fatiga y cefaleas son síntomas somáticos comunes.
- **Apnea Obstructiva del Sueño:** El sobrepeso es un factor de riesgo importante.
- **Hipotiroidismo Subclínico:** Podría explicar la fatiga y se debe descartar con pruebas de TSH y T4 libre.

**3. Análisis Farmacogenético (Simulado):**
- **CYP2C9 (*1/*3):** Metabolizador intermedio. La dosis actual de Losartán podría ser subóptima. Se recomienda monitorizar la presión arterial y considerar un ajuste o un fármaco alternativo si no se alcanzan los objetivos.
- **MTHFR (C677T):** Genotipo heterocigoto. Podría haber una menor eficiencia en el metabolismo del folato, lo cual se ha asociado a una respuesta reducida a ciertos antidepresivos (ISRS).

**4. Recomendación (Simulación):**
Se sugiere realizar un perfil tiroideo y una polisomnografía para descartar las condiciones mencionadas. Desde el punto de vista farmacológico, si se considera iniciar un tratamiento para la ansiedad, se podría optar por un IRSN como la Venlafaxina, que puede ser más eficaz en pacientes con polimorfismos en MTHFR. Es crucial un seguimiento estricto de la presión arterial.

*Nota: Este es un análisis generado en Modo Demo. La información es ficticia y no debe usarse para tomar decisiones clínicas reales.*
                        `;
                    }

                    const updatedMessages = prevChat.messages.map(m => m.id === botLoadingMessageId ? {
                        ...m,
                        isLoading: false,
                        content: botResponse,
                    } : m);
                    return { ...prevChat, messages: updatedMessages };
                });
            }, 1500);
            return;
        }

        try {
            const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/chatSessionMedicalRecord/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patientId: patient.id,
                    msg: content,
                }),
            });

            if (!response.ok) {
                throw new Error('La API ha retornado un error.');
            }

            const result = await response.json();
            const botResponseText = result?.botMessage?.text || "No se recibió una respuesta válida.";

            setChat(prevChat => {
                if (!prevChat) return undefined;
                const updatedMessages = prevChat.messages.map(m => m.id === botLoadingMessageId ? {
                    ...m,
                    isLoading: false,
                    content: botResponseText,
                } : m);
                return { ...prevChat, messages: updatedMessages };
            });

        } catch (err) {
            setChat(prevChat => {
                if (!prevChat) return undefined;
                const updatedMessages = prevChat.messages.map(m => m.id === botLoadingMessageId ? {
                    ...m,
                    isLoading: false,
                    content: "Lo siento, tuve un problema al conectarme con la API."
                } : m);
                return { ...prevChat, messages: updatedMessages };
            });
        }
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
            className="flex-1 flex flex-col overflow-hidden"
            disabled={false}
        />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle>{chat?.title || 'Cargando...'}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 flex flex-col">
           {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
