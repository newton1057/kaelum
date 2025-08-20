'use client';

import type { Chat, SuggestedQuestion } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { SuggestedQuestions } from './suggested-questions';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string, file?: File) => void;
  onSendSuggestedQuestion: (question: SuggestedQuestion) => void;
  suggestedQuestions: SuggestedQuestion[];
  className?: string;
  disabled?: boolean;
}

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
        <ChatMessages messages={chat?.messages ?? []} activeChatId={chat?.id ?? null} />
      </div>
      <div className="border-t bg-background">
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
