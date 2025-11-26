
'use client';

import { Button } from '@/components/ui/button';
import type { Chat } from '@/lib/types';
import { AppLogo } from '../icons';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const palette = {
  bg1: '#031718',
  bg2: '#0B2A2B',
  surface: 'rgba(3, 23, 24, 0.85)',
  border: 'rgba(210, 242, 82, 0.15)',
  accent: '#D2F252',
  text: '#E9FFD0',
  textMuted: '#bfe6a8',
  ink: '#082323',
  danger: '#ff6b6b',
};

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    setUserType(storedUserType);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    router.push('/login');
  };

  const isGeneralChat = pathname.startsWith('/general');

  const displayedChats = isGeneralChat
    ? chats.filter((chat) => chat.mode === 'general')
    : chats.filter((chat) => chat.mode !== 'general');

  // Navigation items for the General section
  const navigationItems = [
    {
      key: 'expedientes',
      label: 'Expedientes',
      path: '/dashboard/expedientes',
    },
    ...(userType !== 'tertiary' && userType !== 'other' && userType !== 'v2'
      ? [
        {
          key: 'general',
          label: 'Chat Medico',
          path: '/general',
        },
      ]
      : []),
  ];

  return (
    <aside
      style={{
        position: 'relative',
        width: '250px',
        borderRight: `1px solid ${palette.border}`,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* Header with Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px',
          gap: 10,
        }}
      >
        <AppLogo />
        <button
          onClick={onNewChat}
          type="button"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: `1px solid ${palette.border}`,
            background: 'transparent',
            color: palette.text,
            fontSize: 18,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease, border 0.2s ease',
          }}
          aria-label="Nueva Consulta"
        >
          +
        </button>
      </div>

      {/* General Navigation Section */}
      <div
        style={{
          marginTop: 8,
          display: 'grid',
          gap: 0,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: palette.textMuted,
            padding: '8px 16px',
          }}
        >
          General
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.path)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 700,
                color: isActive ? palette.ink : palette.text,
                background: isActive ? palette.accent : 'transparent',
                border: 'none',
                borderRadius: 0,
                cursor: isActive ? 'default' : 'pointer',
                transition: 'background 0.2s ease, color 0.2s ease',
                textAlign: 'left',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Conversations Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '0 16px 24px',
          gap: 12,
          minHeight: 0,
          textAlign: 'left',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: palette.textMuted,
            padding: '4px 0',
            textAlign: 'left',
          }}
        >
          Conversaciones
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingRight: 6,
            minHeight: 0,
          }}
        >
          {displayedChats.length === 0 ? (
            <div
              style={{
                fontSize: 13,
                color: palette.textMuted,
                padding: '4px 2px',
              }}
            >
              No hay conversaciones disponibles.
            </div>
          ) : (
            displayedChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: isActive
                      ? 'rgba(210,242,82,0.08)'
                      : palette.surface,
                    border: `1px solid ${isActive ? palette.accent : palette.border}`,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease, border 0.2s ease',
                    font: 'inherit',
                    color: 'inherit',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: palette.text,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chat.title}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer with Logout */}
      <div
        style={{
          padding: '0 16px 24px',
          borderTop: `1px solid ${palette.border}`,
          paddingTop: 16,
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 700,
            color: palette.text,
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background 0.2s ease, color 0.2s ease',
            width: '100%',
            textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
