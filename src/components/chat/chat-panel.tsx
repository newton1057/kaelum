'use client';

import type { Chat, Model, SuggestedQuestion } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { SuggestedQuestions } from './suggested-questions';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string) => void;
  onSendSuggestedQuestion: (question: SuggestedQuestion) => void;
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  suggestedQuestions: SuggestedQuestion[];
  onDeleteAllChats: () => void;
  className?: string;
}

export default function ChatPanel({
  chat,
  onSendMessage,
  onSendSuggestedQuestion,
  suggestedQuestions,
  className,
}: ChatPanelProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1">
        <ChatMessages messages={chat?.messages ?? []} />
      </div>
      <div className="border-t p-4">
        {suggestedQuestions.length > 0 && (
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={onSendSuggestedQuestion}
          />
        )}
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
