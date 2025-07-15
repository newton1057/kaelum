'use client';

import type { Chat, Model, SuggestedQuestion } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { SuggestedQuestions } from './suggested-questions';

interface ChatPanelProps {
  chat?: Chat;
  onSendMessage: (content: string) => void;
  onSendSuggestedQuestion: (question: SuggestedQuestion) => void;
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  suggestedQuestions: SuggestedQuestion[];
  onDeleteAllChats: () => void;
}

export default function ChatPanel({
  chat,
  onSendMessage,
  onSendSuggestedQuestion,
  suggestedQuestions,
}: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto">
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
