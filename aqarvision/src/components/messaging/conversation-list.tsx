import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/formatters';
import type { ConversationWithDetails } from '@/types';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  basePath: string;
}

export function ConversationList({ conversations, basePath }: ConversationListProps) {
  return (
    <div className="divide-y rounded-lg border bg-white">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`${basePath}/${conv.id}`}
          className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer"
        >
          {/* Agency avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bleu-nuit text-white text-sm font-bold">
            {conv.agency.name.charAt(0)}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold text-sm">
                {conv.agency.name}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {conv.last_message_at ? formatRelativeDate(conv.last_message_at) : ''}
              </span>
            </div>
            {conv.property && (
              <p className="truncate text-xs text-or">{conv.property.title}</p>
            )}
            {conv.last_message && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {conv.last_message.sender_type === 'visitor' ? 'Vous : ' : ''}
                {conv.last_message.body}
              </p>
            )}
          </div>

          {/* Unread badge */}
          {conv.unread_count > 0 && (
            <Badge variant="default" className="shrink-0 bg-or text-white">
              {conv.unread_count}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
}
