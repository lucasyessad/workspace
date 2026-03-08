// ============================================================
// TabibPro — Activités Récentes (Audit Trail)
// Journal des actions du médecin
// ============================================================

import { FileText, UserPlus, Pill, Syringe, CreditCard, Bot } from 'lucide-react';

type TypeActivite =
  | 'CONSULTATION'
  | 'NOUVEAU_PATIENT'
  | 'ORDONNANCE'
  | 'VACCINATION'
  | 'PAIEMENT'
  | 'IA';

interface Activite {
  id: string;
  type: TypeActivite;
  description: string;
  patient?: string;
  montantDzd?: number;
  heure: string;
}

async function fetchActivites(): Promise<Activite[]> {
  // TODO: fetch API réel
  return [
    { id: '1', type: 'CONSULTATION', description: 'Consultation terminée', patient: 'Benali Amina', heure: '08:22' },
    { id: '2', type: 'ORDONNANCE', description: 'Ordonnance générée', patient: 'Benali Amina', heure: '08:24' },
    { id: '3', type: 'PAIEMENT', description: 'Paiement reçu (CIB)', patient: 'Benali Amina', montantDzd: 2500, heure: '08:25' },
    { id: '4', type: 'CONSULTATION', description: 'Consultation terminée', patient: 'Boudiaf Karim', heure: '09:02' },
    { id: '5', type: 'IA', description: 'Aide au diagnostic utilisée', patient: 'Boudiaf Karim', heure: '08:55' },
    { id: '6', type: 'NOUVEAU_PATIENT', description: 'Nouveau patient enregistré', patient: 'Khelif Yacine', heure: '09:12' },
    { id: '7', type: 'VACCINATION', description: 'Vaccin Hépatite B administré', patient: 'Khelif Yacine', heure: '09:28' },
  ];
}

const TYPE_CONFIG: Record<TypeActivite, { icon: React.ReactNode; couleur: string }> = {
  CONSULTATION: { icon: <FileText className="h-3.5 w-3.5" />, couleur: 'bg-blue-100 text-blue-700' },
  NOUVEAU_PATIENT: { icon: <UserPlus className="h-3.5 w-3.5" />, couleur: 'bg-emerald-100 text-emerald-700' },
  ORDONNANCE: { icon: <Pill className="h-3.5 w-3.5" />, couleur: 'bg-violet-100 text-violet-700' },
  VACCINATION: { icon: <Syringe className="h-3.5 w-3.5" />, couleur: 'bg-amber-100 text-amber-700' },
  PAIEMENT: { icon: <CreditCard className="h-3.5 w-3.5" />, couleur: 'bg-green-100 text-green-700' },
  IA: { icon: <Bot className="h-3.5 w-3.5" />, couleur: 'bg-purple-100 text-purple-700' },
};

export async function RecentesActivites() {
  const activites = await fetchActivites();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-sm">Activités récentes</h2>
      </div>

      <div className="divide-y divide-border">
        {activites.map((a) => {
          const config = TYPE_CONFIG[a.type];
          return (
            <div key={a.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.couleur}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {a.description}
                  {a.montantDzd && (
                    <span className="ml-1 text-emerald-600 font-bold">
                      +{new Intl.NumberFormat('fr-DZ').format(a.montantDzd)} DA
                    </span>
                  )}
                </p>
                {a.patient && (
                  <p className="text-[11px] text-muted-foreground truncate">{a.patient}</p>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{a.heure}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
