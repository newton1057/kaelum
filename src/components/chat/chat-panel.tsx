'use client';

import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import type { Chat, Model, SuggestedQuestion } from '@/lib/types';
import MessageInput from './message-input';
import ChatMessages from './chat-messages';
import { AppLogo } from '../icons';
import { ModelSelector } from './model-selector';
import { UserSettingsModal } from './user-settings-modal';
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
  selectedModel,
  onModelChange,
  suggestedQuestions,
  onDeleteAllChats,
}: ChatPanelProps) {
  return (
    <SidebarInset className="flex max-h-svh flex-col p-0">
      <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <AppLogo />
        </div>
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>
          <UserSettingsModal onDeleteAllChats={onDeleteAllChats} />
        </div>
      </header>
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
    </SidebarInset>
  );
}
