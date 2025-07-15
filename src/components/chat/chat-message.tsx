'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { BotAvatar } from '../icons';
import { User, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import React from 'react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const showReasoning = message.reasoning !== undefined;
  const [isAccordionOpen, setAccordionOpen] = React.useState(false);

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
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={(value) => setAccordionOpen(!!value)}
      >
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs h-auto p-1 text-muted-foreground hover:bg-transparent hover:text-primary"
            >
              <>
                <span>{isAccordionOpen ? 'Ocultar' : 'Mostrar'} razonamiento</span>
                {isAccordionOpen ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </>
            </Button>
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
      </div>
      {isUser && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <User />
        </div>
      )}
    </div>
  );
}
