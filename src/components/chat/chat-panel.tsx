
'use client';

import type { Chat, PendingFile, SuggestedQuestion } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { SuggestedQuestions } from './suggested-questions';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { FileIcon, Paperclip, Download } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string, file?: File) => void;
  onSendSuggestedQuestion: (question: SuggestedQuestion) => void;
  suggestedQuestions: SuggestedQuestion[];
  className?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


const PendingFilesSection = ({ files }: { files: PendingFile[] }) => {
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="mb-4">
      <AccordionItem value="item-1" className="border rounded-lg">
        <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
           <div className="flex items-center gap-2">
             <Paperclip className="h-4 w-4" />
             <span>Archivos de la Sesión ({files.length})</span>
           </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pt-0">
          <div className="flex flex-col gap-2 pt-2 border-t">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                 <div className="flex items-center gap-3">
                   <FileIcon className="h-6 w-6 text-muted-foreground" />
                   <div className="flex flex-col">
                     <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                     <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                   </div>
                 </div>
                 <Button asChild variant="ghost" size="icon">
                   <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                     <Download className="h-4 w-4" />
                   </a>
                 </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};


export default function ChatPanel({
  chat,
  onSendMessage,
  onSendSuggestedQuestion,
  suggestedQuestions,
  className,
  disabled,
}: ChatPanelProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto">
        {chat?.pendingFiles && chat.pendingFiles.length > 0 && (
          <div className="p-4 border-b">
            <PendingFilesSection files={chat.pendingFiles} />
          </div>
        )}
        <ChatMessages chat={chat} activeChatId={chat?.id ?? null} />
      </div>
      <div className="shrink-0 border-t bg-background">
        <div className="w-full p-4">
          {suggestedQuestions.length > 0 && (
            <SuggestedQuestions
              questions={suggestedQuestions}
              onSelectQuestion={onSendSuggestedQuestion}
            />
          )}
          <MessageInput onSendMessage={onSendMessage} disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
