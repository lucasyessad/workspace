// ============================================================
// TabibPro — Dashboard Principal
// Adapté au contexte algérien (DZD, CNAS, weekend VEN-SAM)
// ============================================================

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { AgendaAujourdhui } from '@/components/dashboard/agenda-aujourdhui';
import { FilAttente } from '@/components/dashboard/fil-attente';
import { AlertesStock } from '@/components/dashboard/alertes-stock';
import { RecentesActivites } from '@/components/dashboard/recentes-activites';
import { PanneauIA } from '@/components/ai/panneau-ia';
import { ConnectivityBadge } from '@/components/layout/connectivity-badge';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  return { title: t('title') };
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  return (
    <div className="space-y-6 p-6">
      {/* Header avec indicateur de connectivité */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('greeting')} 👨‍⚕️
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'Africa/Algiers',
            }).format(new Date())}
          </p>
        </div>
        <ConnectivityBadge />
      </div>

      {/* Statistiques du jour */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-muted" />}>
        <DashboardStats />
      </Suspense>

      {/* Grille principale */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agenda du jour — col 2 */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
            <AgendaAujourdhui />
          </Suspense>
        </div>

        {/* File d'attente */}
        <div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
            <FilAttente />
          </Suspense>
        </div>
      </div>

      {/* Alertes stock + Activités récentes */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
          <AlertesStock />
        </Suspense>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
          <RecentesActivites />
        </Suspense>
      </div>
    </div>
  );
}
