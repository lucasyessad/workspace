import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getConversationById, getConversationMessages } from '@/lib/queries/conversations';
import { MessageThread } from '@/components/messaging/message-thread';
import { MessageInput } from '@/components/messaging/message-input';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Conversation' };

export default async function DashboardConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await requirePermission('leads:read');

  const [conversation, messages] = await Promise.all([
    getConversationById(params.id),
    getConversationMessages(params.id),
  ]);

  if (!conversation || conversation.agency_id !== tenant.agency.id) notFound();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/messages"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="font-semibold">
            {conversation.subject ?? 'Conversation'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {conversation.status === 'closed' ? 'Clôturée' : 'En cours'}
          </p>
        </div>
      </div>

      <MessageThread
        messages={messages}
        currentUserId={tenant.user.id}
      />

      {conversation.status !== 'closed' && (
        <MessageInput conversationId={params.id} />
      )}
    </div>
  );
}
