// ============================================================
// TabibPro — File d'attente en temps réel
// Patients présents au cabinet — actualisation côté serveur
// ============================================================

import { Clock, UserCheck, UserPlus } from 'lucide-react';

interface PatientAttente {
  id: string;
  nom: string;
  prenom: string;
  heureArrivee: string;
  attenteMin: number;
  estNouveauPatient: boolean;
  motif: string;
  priorite: 'NORMAL' | 'URGENT';
}

async function fetchFilAttente(): Promise<PatientAttente[]> {
  // TODO: fetch API réel (WebSocket en prod)
  return [
    { id: '1', nom: 'Hamidi', prenom: 'Soraya', heureArrivee: '08:55', attenteMin: 5, estNouveauPatient: false, motif: 'Renouvellement', priorite: 'NORMAL' },
    { id: '2', nom: 'Khelif', prenom: 'Yacine', heureArrivee: '09:10', attenteMin: 20, estNouveauPatient: true, motif: 'Bilan de santé', priorite: 'NORMAL' },
    { id: '3', nom: 'Meddah', prenom: 'Fatima', heureArrivee: '09:15', attenteMin: 15, estNouveauPatient: false, motif: 'HTA', priorite: 'URGENT' },
  ];
}

export async function FilAttente() {
  const patients = await fetchFilAttente();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-semibold text-sm">File d'attente</h2>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">{patients.length} patient(s)</span>
        </span>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <UserCheck className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">Salle d'attente vide</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {patients.map((p, index) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3">
              {/* Numéro d'ordre */}
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                p.priorite === 'URGENT'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-primary/10 text-primary'
              }`}>
                {p.priorite === 'URGENT' ? '!' : index + 1}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">
                    {p.prenom} {p.nom}
                  </span>
                  {p.estNouveauPatient && (
                    <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                      <UserPlus className="h-2.5 w-2.5" />
                      Nouveau
                    </span>
                  )}
                  {p.priorite === 'URGENT' && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.motif}</p>
              </div>

              {/* Attente */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className={p.attenteMin > 20 ? 'text-orange-600 font-semibold' : ''}>
                    {p.attenteMin} min
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Arrivée {p.heureArrivee}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border px-5 py-3">
        <button className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          Appeler le suivant
        </button>
      </div>
    </div>
  );
}
