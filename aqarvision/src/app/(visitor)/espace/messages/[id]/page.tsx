import { notFound } from 'next/navigation';
import { getConversationById, getConversationMessages } from '@/lib/queries/conversations';
import { markConversationRead } from '@/lib/actions/messaging';
import { MessageThread } from '@/components/messaging/message-thread';
import { MessageInput } from '@/components/messaging/message-input';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Conversation' };

export default async function VisitorConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const [conversation, messages] = await Promise.all([
    getConversationById(params.id),
    getConversationMessages(params.id),
  ]);

  if (!conversation) notFound();

  // Mark as read
  await markConversationRead(params.id);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/espace/messages"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-semibold">
            {conversation.subject ?? 'Conversation'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {conversation.status === 'closed' ? 'Conversation clôturée' : 'En cours'}
          </p>
        </div>
      </div>

      <MessageThread
        messages={messages}
        currentUserId={user?.id ?? ''}
      />

      {conversation.status !== 'closed' && (
        <MessageInput conversationId={params.id} />
      )}
    </div>
  );
}
