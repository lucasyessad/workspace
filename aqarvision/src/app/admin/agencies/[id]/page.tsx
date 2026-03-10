import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/formatters';
import { SUBSCRIPTION_PLAN_LABELS } from '@/lib/constants';
import type { Agency } from '@/types';

export const metadata = { title: 'Admin - Détail agence' };

export default async function AdminAgencyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!agency) notFound();

  const a = agency as Agency;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/agencies"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-heading-3 font-bold">{a.name}</h1>
          <p className="text-sm text-muted-foreground">{a.slug}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{a.email ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Téléphone</dt><dd>{a.phone ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Wilaya</dt><dd>{a.wilaya ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Adresse</dt><dd>{a.address ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">N° RC</dt><dd>{a.license_number ?? '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Vérifiée</dt><dd>{a.is_verified ? 'Oui' : 'Non'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Créée le</dt><dd>{formatDate(a.created_at)}</dd></div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Abonnement</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">{SUBSCRIPTION_PLAN_LABELS[a.active_plan]}</span>
              <Badge variant={a.subscription_status === 'active' ? 'success' : 'warning'}>
                {a.subscription_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
