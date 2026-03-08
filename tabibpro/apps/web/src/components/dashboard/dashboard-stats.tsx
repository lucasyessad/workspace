// ============================================================
// TabibPro — Dashboard Stats
// Statistiques du jour : patients, consultations, CA, stock
// ============================================================

import { Users, CalendarCheck, Wallet, AlertTriangle } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

async function fetchStats() {
  // TODO: fetch réel depuis l'API
  return {
    patientsAujourdhui: 12,
    consultationsTerminees: 7,
    caJourDzd: 42000,
    alertesStock: 3,
    rdvRestants: 5,
    nouveauxPatients: 2,
  };
}

export async function DashboardStats() {
  const stats = await fetchStats();

  const cards: StatCard[] = [
    {
      label: 'Patients aujourd\'hui',
      value: stats.patientsAujourdhui,
      sub: `dont ${stats.nouveauxPatients} nouveau(x)`,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Consultations',
      value: `${stats.consultationsTerminees} / ${stats.patientsAujourdhui}`,
      sub: `${stats.rdvRestants} restante(s)`,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'CA du jour',
      value: new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        maximumFractionDigits: 0,
      }).format(stats.caJourDzd),
      sub: 'tiers payant inclus',
      icon: <Wallet className="h-5 w-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Alertes stock',
      value: stats.alertesStock,
      sub: stats.alertesStock > 0 ? 'médicaments en rupture / faible' : 'stock OK',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: stats.alertesStock > 0 ? 'text-red-600' : 'text-gray-400',
      bg: stats.alertesStock > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{card.value}</p>
              {card.sub && (
                <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
              )}
            </div>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <span className={card.color}>{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
