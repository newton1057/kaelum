import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BotAvatar } from '../icons';
import { User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <BotAvatar />}
      <div
        className={cn(
          'max-w-md rounded-2xl p-4 shadow-sm',
          isUser
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-muted text-muted-foreground'
        )}
      >
        <div className="prose prose-sm prose-p:text-inherit prose-strong:text-inherit prose-em:text-inherit prose-code:text-inherit prose-li:text-inherit max-w-none text-sm leading-relaxed text-inherit">
          <ReactMarkdown
            components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
                <User />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
