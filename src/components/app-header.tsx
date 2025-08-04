'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppLogo } from './icons';
import { UserSettingsModal } from './chat/user-settings-modal';

interface AppHeaderProps {
  onDeleteAllChats: () => void;
}

export function AppHeader({
  onDeleteAllChats,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:block">
          <AppLogo />
        </div>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <AppLogo />
      </div>
      <div className="flex items-center gap-4">
        <UserSettingsModal onDeleteAllChats={onDeleteAllChats} />
      </div>
    </header>
  );
}
