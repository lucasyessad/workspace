// ============================================================
// TabibPro — Agenda du Jour
// Liste des RDV — weekend DZ : VEN + SAM
// ============================================================

import { Clock, User, Phone, CheckCircle2, XCircle, Circle } from 'lucide-react';

type StatutRdv = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE' | 'NON_VENU';

interface Rdv {
  id: string;
  heure: string;
  patient: { nom: string; prenom: string; tel: string };
  motif: string;
  statut: StatutRdv;
  typePaiement: 'CNAS' | 'CASNOS' | 'AUCUN';
  dureeMin: number;
}

async function fetchAgenda(): Promise<Rdv[]> {
  // TODO: fetch API réel
  return [
    { id: '1', heure: '08:00', patient: { nom: 'Benali', prenom: 'Amina', tel: '0555 12 34 56' }, motif: 'Consultation générale', statut: 'TERMINE', typePaiement: 'CNAS', dureeMin: 20 },
    { id: '2', heure: '08:30', patient: { nom: 'Boudiaf', prenom: 'Karim', tel: '0661 98 76 54' }, motif: 'Suivi diabète', statut: 'TERMINE', typePaiement: 'CASNOS', dureeMin: 30 },
    { id: '3', heure: '09:00', patient: { nom: 'Hamidi', prenom: 'Soraya', tel: '0770 11 22 33' }, motif: 'Renouvellement ordonnance', statut: 'EN_COURS', typePaiement: 'AUCUN', dureeMin: 15 },
    { id: '4', heure: '09:30', patient: { nom: 'Khelif', prenom: 'Yacine', tel: '0550 44 55 66' }, motif: 'Bilan de santé', statut: 'EN_ATTENTE', typePaiement: 'CNAS', dureeMin: 30 },
    { id: '5', heure: '10:00', patient: { nom: 'Meddah', prenom: 'Fatima', tel: '0663 77 88 99' }, motif: 'Consultation HTA', statut: 'EN_ATTENTE', typePaiement: 'CASNOS', dureeMin: 20 },
    { id: '6', heure: '10:30', patient: { nom: 'Zouaoui', prenom: 'Ahmed', tel: '0555 00 11 22' }, motif: 'Urgence — douleur thoracique', statut: 'EN_ATTENTE', typePaiement: 'AUCUN', dureeMin: 45 },
  ];
}

const STATUT_CONFIG: Record<StatutRdv, { label: string; icon: React.ReactNode; classe: string }> = {
  EN_ATTENTE: { label: 'En attente', icon: <Circle className="h-3.5 w-3.5" />, classe: 'text-gray-500 bg-gray-100' },
  EN_COURS: { label: 'En cours', icon: <Clock className="h-3.5 w-3.5" />, classe: 'text-blue-700 bg-blue-100' },
  TERMINE: { label: 'Terminé', icon: <CheckCircle2 className="h-3.5 w-3.5" />, classe: 'text-emerald-700 bg-emerald-100' },
  ANNULE: { label: 'Annulé', icon: <XCircle className="h-3.5 w-3.5" />, classe: 'text-red-600 bg-red-100' },
  NON_VENU: { label: 'Non venu', icon: <XCircle className="h-3.5 w-3.5" />, classe: 'text-orange-600 bg-orange-100' },
};

const TIERS_BADGE: Record<string, string> = {
  CNAS: 'bg-green-100 text-green-700',
  CASNOS: 'bg-purple-100 text-purple-700',
  AUCUN: 'bg-gray-100 text-gray-500',
};

export async function AgendaAujourdhui() {
  const rdvs = await fetchAgenda();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-semibold text-sm">Agenda du jour</h2>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {rdvs.length} RDV
        </span>
      </div>

      <div className="divide-y divide-border">
        {rdvs.map((rdv) => {
          const statut = STATUT_CONFIG[rdv.statut];
          return (
            <div
              key={rdv.id}
              className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors ${
                rdv.statut === 'EN_COURS' ? 'bg-blue-50/50' : ''
              }`}
            >
              {/* Heure */}
              <div className="w-12 shrink-0 text-right">
                <span className="text-sm font-bold tabular-nums">{rdv.heure}</span>
                <p className="text-xs text-muted-foreground">{rdv.dureeMin}min</p>
              </div>

              {/* Ligne verticale colorée */}
              <div
                className={`w-0.5 h-10 rounded-full shrink-0 ${
                  rdv.statut === 'TERMINE' ? 'bg-emerald-400'
                  : rdv.statut === 'EN_COURS' ? 'bg-blue-500'
                  : rdv.statut === 'ANNULE' ? 'bg-red-400'
                  : 'bg-gray-200'
                }`}
              />

              {/* Infos patient */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-semibold truncate">
                    {rdv.patient.prenom} {rdv.patient.nom}
                  </span>
                  {rdv.typePaiement !== 'AUCUN' && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${TIERS_BADGE[rdv.typePaiement]}`}>
                      {rdv.typePaiement}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{rdv.motif}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{rdv.patient.tel}</span>
                </div>
              </div>

              {/* Statut */}
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statut.classe}`}>
                {statut.icon}
                {statut.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
