import { requirePermission } from '@/lib/auth/guard';
import { getAgencyInbox } from '@/lib/queries/conversations';
import { ConversationList } from '@/components/messaging/conversation-list';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare } from 'lucide-react';

export const metadata = { title: 'Messages' };

export default async function DashboardMessagesPage() {
  const tenant = await requirePermission('leads:read');
  const conversations = await getAgencyInbox(tenant.agency.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Messages</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Conversations avec les visiteurs et prospects.
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="Aucun message"
          description="Les messages des visiteurs apparaîtront ici quand ils vous contacteront."
        />
      ) : (
        <ConversationList conversations={conversations} basePath="/dashboard/messages" />
      )}
    </div>
  );
}
