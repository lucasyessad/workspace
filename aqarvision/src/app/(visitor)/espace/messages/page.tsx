import { getUserConversations } from '@/lib/queries/conversations';
import { ConversationList } from '@/components/messaging/conversation-list';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Mes messages' };

export default async function VisitorMessagesPage() {
  const conversations = await getUserConversations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold text-bleu-nuit">Mes messages</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Vos conversations avec les agences immobilières.
        </p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="Aucune conversation"
          description="Contactez une agence depuis une annonce pour démarrer une conversation."
          action={
            <Button variant="or" asChild>
              <Link href="/recherche">Rechercher des biens</Link>
            </Button>
          }
        />
      ) : (
        <ConversationList conversations={conversations} basePath="/espace/messages" />
      )}
    </div>
  );
}
