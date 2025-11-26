'use client';

import { UserSettingsModal } from './chat/user-settings-modal';

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
      </div>
      <div className="flex items-center gap-4">
        <UserSettingsModal />
      </div>
    </header>
  );
}
