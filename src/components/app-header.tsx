'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Model } from '@/lib/types';
import { AppLogo } from './icons';
import { ModelSelector } from './chat/model-selector';
import { UserSettingsModal } from './chat/user-settings-modal';
import { Button } from './ui/button';
import { LayoutDashboard, MessageSquare } from 'lucide-react';

interface AppHeaderProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  onDeleteAllChats: () => void;
  view: 'chat' | 'dashboard';
  onViewChange: (view: 'chat' | 'dashboard') => void;
}

export function AppHeader({
  selectedModel,
  onModelChange,
  onDeleteAllChats,
  view,
  onViewChange,
}: AppHeaderProps) {
  return (
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
        <Button
          variant={view === 'dashboard' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('dashboard')}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={view === 'chat' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('chat')}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat
        </Button>
        <div className="md:hidden">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
        </div>
        <UserSettingsModal onDeleteAllChats={onDeleteAllChats} />
      </div>
    </header>
  );
}
