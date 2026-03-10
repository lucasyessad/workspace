import { requirePermission } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLAN_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import type { Subscription } from '@/types';

export const metadata = { title: 'Abonnement' };

export default async function SubscriptionPage() {
  const tenant = await requirePermission('subscription:read');
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('agency_id', tenant.agency.id)
    .single();

  const sub = subscription as Subscription | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold">Abonnement</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Gérez votre plan et votre facturation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan actuel</CardTitle>
        </CardHeader>
        <CardContent>
          {sub ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">
                  {SUBSCRIPTION_PLAN_LABELS[sub.plan_code]}
                </span>
                <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'trial' ? 'info' : 'warning'}>
                  {sub.status === 'active' ? 'Actif' : sub.status === 'trial' ? 'Essai' : sub.status}
                </Badge>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Date de début</dt>
                  <dd className="font-medium">{formatDate(sub.start_date)}</dd>
                </div>
                {sub.renewal_date && (
                  <div>
                    <dt className="text-muted-foreground">Prochain renouvellement</dt>
                    <dd className="font-medium">{formatDate(sub.renewal_date)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Mode de facturation</dt>
                  <dd className="font-medium">{sub.billing_mode === 'manual' ? 'Manuel' : 'En ligne'}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun abonnement actif.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
