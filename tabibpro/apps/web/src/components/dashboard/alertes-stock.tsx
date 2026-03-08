// ============================================================
// TabibPro — Alertes Stock Cabinet
// Médicaments en rupture / stock faible
// ============================================================

import { Package, AlertTriangle, XCircle } from 'lucide-react';

type NiveauAlerte = 'RUPTURE' | 'FAIBLE' | 'PERIME';

interface AlerteStock {
  id: string;
  nomMedicament: string;
  stockActuel: number;
  stockMinimum: number;
  niveau: NiveauAlerte;
  datePeremption?: string;
}

async function fetchAlertes(): Promise<AlerteStock[]> {
  // TODO: fetch API réel
  return [
    { id: '1', nomMedicament: 'Amoxicilline 500mg', stockActuel: 0, stockMinimum: 10, niveau: 'RUPTURE' },
    { id: '2', nomMedicament: 'Paracétamol 1g', stockActuel: 3, stockMinimum: 20, niveau: 'FAIBLE' },
    { id: '3', nomMedicament: 'Metformine 850mg', stockActuel: 2, stockMinimum: 15, niveau: 'FAIBLE' },
    { id: '4', nomMedicament: 'Aspirine 100mg', stockActuel: 8, stockMinimum: 5, niveau: 'PERIME', datePeremption: '2026-02-28' },
  ];
}

const NIVEAU_CONFIG: Record<NiveauAlerte, { label: string; icon: React.ReactNode; classe: string; bordure: string }> = {
  RUPTURE: {
    label: 'Rupture',
    icon: <XCircle className="h-4 w-4" />,
    classe: 'text-red-700 bg-red-50',
    bordure: 'border-l-2 border-l-red-500',
  },
  FAIBLE: {
    label: 'Stock faible',
    icon: <AlertTriangle className="h-4 w-4" />,
    classe: 'text-orange-700 bg-orange-50',
    bordure: 'border-l-2 border-l-orange-400',
  },
  PERIME: {
    label: 'Périmé',
    icon: <AlertTriangle className="h-4 w-4" />,
    classe: 'text-purple-700 bg-purple-50',
    bordure: 'border-l-2 border-l-purple-400',
  },
};

export async function AlertesStock() {
  const alertes = await fetchAlertes();
  const ruptures = alertes.filter((a) => a.niveau === 'RUPTURE').length;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Stock cabinet</h2>
        </div>
        {ruptures > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
            {ruptures} rupture(s)
          </span>
        )}
      </div>

      {alertes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Package className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">Stock en ordre</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {alertes.map((alerte) => {
            const config = NIVEAU_CONFIG[alerte.niveau];
            return (
              <div key={alerte.id} className={`flex items-center gap-3 px-5 py-3 ${config.bordure}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alerte.nomMedicament}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stock : {alerte.stockActuel} / min {alerte.stockMinimum}
                    {alerte.datePeremption && ` — Péremption : ${alerte.datePeremption}`}
                  </p>
                </div>
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${config.classe}`}>
                  {config.icon}
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border px-5 py-3">
        <button className="text-xs font-medium text-primary hover:underline">
          Gérer le stock →
        </button>
      </div>
    </div>
  );
}
