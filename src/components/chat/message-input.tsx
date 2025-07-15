'use client';

import { useState, useRef, type FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: FormEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-end gap-2"
    >
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onInput={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Pregúntale a SynapseAI..."
        className="max-h-48 min-h-12 resize-none overflow-y-auto rounded-2xl border-2 border-border bg-background pr-12"
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute bottom-2 right-2 h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        disabled={!inputValue.trim()}
      >
        <SendHorizontal />
        <span className="sr-only">Enviar mensaje</span>
      </Button>
    </form>
  );
}
