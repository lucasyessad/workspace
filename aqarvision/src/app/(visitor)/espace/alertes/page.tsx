import { getUserSavedSearches } from '@/lib/queries/saved-searches';
import { EmptyState } from '@/components/ui/empty-state';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertToggle } from '@/components/search/alert-toggle';
import { formatRelativeDate } from '@/lib/formatters';
import { TRANSACTION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/constants';
import Link from 'next/link';
import type { SearchFilters } from '@/types';

export const metadata = { title: 'Mes alertes' };

export default async function AlertsPage() {
  const searches = await getUserSavedSearches();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold text-bleu-nuit">Mes alertes</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Recevez des notifications quand de nouveaux biens correspondent à vos critères.
        </p>
      </div>

      {searches.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="Aucune alerte"
          description="Sauvegardez une recherche pour recevoir des alertes quand de nouveaux biens sont publiés."
          action={
            <Button variant="or" asChild>
              <Link href="/recherche">Faire une recherche</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {searches.map((search) => {
            const filters = search.filters as SearchFilters;
            return (
              <Card key={search.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{search.name}</p>
                      <Badge variant={search.is_active ? 'success' : 'secondary'}>
                        {search.is_active ? 'Active' : 'Pausée'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {filters.transactionType && (
                        <Badge variant="outline">{TRANSACTION_TYPE_LABELS[filters.transactionType]}</Badge>
                      )}
                      {filters.propertyType && (
                        <Badge variant="outline">{PROPERTY_TYPE_LABELS[filters.propertyType]}</Badge>
                      )}
                      {filters.wilaya && <Badge variant="outline">{filters.wilaya}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Créée {formatRelativeDate(search.created_at)} — Fréquence : {search.frequency}
                    </p>
                  </div>
                  <AlertToggle searchId={search.id} isActive={search.is_active} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
