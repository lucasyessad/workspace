'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import type { Message } from '@/types';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-4">
      <div className="mx-auto max-w-2xl space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.sender_user_id === currentUserId;
          const isSystem = msg.message_type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <p className="text-xs text-muted-foreground">{msg.body}</p>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  isOwn
                    ? 'bg-bleu-nuit text-white rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={cn(
                    'mt-1 text-right text-[10px]',
                    isOwn ? 'text-white/60' : 'text-muted-foreground'
                  )}
                >
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
