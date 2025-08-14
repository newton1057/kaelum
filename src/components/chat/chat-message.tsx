'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { BotAvatar, FileIcon } from '../icons';
import { User, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const showReasoning = message.reasoning !== undefined;

  const LoadingIndicator = () => (
    <div className="flex items-start gap-4">
      <BotAvatar />
      <div className={cn('flex flex-col items-start')}>
        <div
          className={cn(
            'max-w-md rounded-2xl p-4 shadow-sm',
            'rounded-bl-none bg-muted text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="animate-spin" size={16} />
            <span>Razonamiento...</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ReasoningSection = () => {
    if (!showReasoning) return null;

    if (!message.isReasoningComplete) {
      return (
        <Card className="max-w-md bg-muted/50 border-primary/20 mt-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Loader className="animate-spin" size={16} />
              <span>Razonamiento...</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="prose prose-sm prose-p:text-inherit max-w-none text-xs leading-relaxed text-muted-foreground">
              {message.reasoning}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="mt-2 text-xs h-auto p-1 text-muted-foreground hover:bg-transparent hover:text-primary hover:no-underline justify-start gap-1 [&[data-state=open]>svg:last-child]:rotate-180">
            <span className="[&[data-state=open]>span:first-child]:hidden">
              <span>Mostrar</span>
            </span>
             <span className="[&[data-state=closed]>span:first-child]:hidden">
              <span>Ocultar</span>
            </span>
            <span>razonamiento</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </AccordionTrigger>
          <AccordionContent>
            <Card className="max-w-md bg-muted/50 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold text-primary">
                  Razonamiento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="prose prose-sm prose-p:text-inherit max-w-none text-xs leading-relaxed text-muted-foreground">
                  {message.reasoning}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };
  
  const AttachmentSection = () => {
    if (!message.attachment) return null;

    const { url, name, contentType } = message.attachment;
    const isImage = contentType.startsWith('image/');

    return (
      <div className="mt-2">
        <div className="block max-w-md">
          <Card className="overflow-hidden transition-colors hover:bg-muted/50">
            {isImage ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={url}
                  alt={name}
                  width={300}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </a>
            ) : (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="truncate">
                    <CardTitle className="text-sm font-medium">{name}</CardTitle>
                  </div>
                </CardHeader>
              </a>
            )}
          </Card>
        </div>
      </div>
    );
  };

  if (message.isLoading) {
    return <LoadingIndicator />;
  }
  
  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <BotAvatar />}
      <div
        className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
      >
        <div
          className={cn(
            'max-w-md rounded-2xl p-4 shadow-sm',
            isUser
              ? 'rounded-br-none bg-primary text-primary-foreground'
              : 'rounded-bl-none bg-muted text-muted-foreground',
            message.content === '' && !message.isReasoningComplete && 'hidden'
          )}
        >
          <div className="prose prose-sm prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit prose-code:text-inherit prose-li:text-inherit max-w-none text-sm leading-relaxed text-inherit">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        {!isUser && <ReasoningSection />}
        <AttachmentSection />
      </div>
      {isUser && (
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src="https://firebasestorage.googleapis.com/v0/b/aurora-4e980.appspot.com/o/resourcesPDFima%2Fdefault.jpg?alt=media&token=31b50401-b3d0-49c9-b186-6545c413c608"
            alt="User Avatar"
          />
          <AvatarFallback className="bg-primary/20 text-primary">
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
