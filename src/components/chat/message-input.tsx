
'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Paperclip, X, File as FileIcon } from 'lucide-react';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: FormEvent<HTMLTextAreaElement>) => {
    setInputValue(e.currentTarget.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() || attachment) {
      onSendMessage(inputValue.trim(), attachment ?? undefined);
      setInputValue('');
      clearAttachment();
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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAttachment(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="flex flex-col">
       {attachment && (
        <div className="relative mb-2 w-fit rounded-lg border bg-muted/50 p-2">
          <div className="flex items-center gap-2">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={attachment.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="max-w-xs truncate text-sm text-muted-foreground">
              {attachment.name}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
            onClick={clearAttachment}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full items-end gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleAttachmentClick}
          className="absolute bottom-2 left-2 h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          <Paperclip />
          <span className="sr-only">Adjuntar archivo</span>
        </Button>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Pregúntale a ima..."
          className="max-h-48 min-h-12 resize-none overflow-y-auto rounded-2xl border-2 border-border bg-background pl-12 pr-12"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute bottom-2 right-2 h-9 w-9 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-50"
          disabled={!inputValue.trim() && !attachment}
        >
          <SendHorizontal />
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </form>
    </div>
  );
}
