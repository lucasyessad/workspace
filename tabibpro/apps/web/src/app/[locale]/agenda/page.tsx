// ============================================================
// TabibPro — Agenda Semaine
// Vue hebdomadaire + file d'attente
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Jours de travail en Algérie: Dimanche à Jeudi
const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu'];
const JOURS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi'];

// Créneaux 8h00 → 19h00 par tranches de 30min
const CRENEAUX: string[] = [];
for (let h = 8; h < 19; h++) {
  CRENEAUX.push(`${String(h).padStart(2, '0')}:00`);
  CRENEAUX.push(`${String(h).padStart(2, '0')}:30`);
}

type TypeConsultation = 'Générale' | 'Suivi' | 'Urgence' | 'Bilan';

interface RDV {
  id: string;
  jourIndex: number; // 0=Dim, 1=Lun, ...
  heure: string;
  patient: string;
  type: TypeConsultation;
  duree: number; // en minutes
}

const TYPE_COLORS: Record<TypeConsultation, string> = {
  Générale: 'bg-blue-100 border-blue-300 text-blue-800',
  Suivi: 'bg-green-100 border-green-300 text-green-800',
  Urgence: 'bg-red-100 border-red-300 text-red-800',
  Bilan: 'bg-purple-100 border-purple-300 text-purple-800',
};

const RDV_FICTIFS: RDV[] = [
  { id: '1', jourIndex: 0, heure: '08:00', patient: 'Benali Karim', type: 'Générale', duree: 30 },
  { id: '2', jourIndex: 0, heure: '09:00', patient: 'Meziani Fatima', type: 'Suivi', duree: 30 },
  { id: '3', jourIndex: 0, heure: '10:30', patient: 'Boudjelal Youcef', type: 'Bilan', duree: 60 },
  { id: '4', jourIndex: 1, heure: '08:30', patient: 'Amrani Nadia', type: 'Urgence', duree: 30 },
  { id: '5', jourIndex: 1, heure: '10:00', patient: 'Khelifi Omar', type: 'Générale', duree: 30 },
  { id: '6', jourIndex: 1, heure: '14:00', patient: 'Saidi Meriem', type: 'Suivi', duree: 30 },
  { id: '7', jourIndex: 2, heure: '09:00', patient: 'Hadj Ali Rachid', type: 'Générale', duree: 30 },
  { id: '8', jourIndex: 2, heure: '11:00', patient: 'Brahimi Yasmine', type: 'Bilan', duree: 60 },
  { id: '9', jourIndex: 3, heure: '08:00', patient: 'Belkacem Djamel', type: 'Suivi', duree: 30 },
  { id: '10', jourIndex: 3, heure: '15:00', patient: 'Ould Hamouda Sonia', type: 'Générale', duree: 30 },
  { id: '11', jourIndex: 4, heure: '09:30', patient: 'Ferhat Nacer', type: 'Urgence', duree: 30 },
];

const FILE_ATTENTE = [
  { id: 'fa-1', nom: 'Benali Karim', motif: 'Douleurs thoraciques', attente: '15 min' },
  { id: 'fa-2', nom: 'Meziani Fatima', motif: 'Suivi diabète', attente: '32 min' },
  { id: 'fa-3', nom: 'Boudjelal Youcef', motif: 'Renouvellement ordonnance', attente: '48 min' },
];

function getWeekDates(baseMonday: Date): Date[] {
  // Semaine DZ: Dimanche à Jeudi
  const sunday = new Date(baseMonday);
  const dayOfWeek = baseMonday.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? 0 : dayOfWeek === 1 ? -1 : dayOfWeek === 2 ? -2 : dayOfWeek === 3 ? -3 : dayOfWeek === 4 ? -4 : dayOfWeek === 5 ? -5 : -6;
  sunday.setDate(baseMonday.getDate() + diff);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function formatWeekLabel(dates: Date[]): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('fr-DZ', { day: 'numeric', month: 'long' }).format(d);
  return `Semaine du ${fmt(dates[0])} au ${fmt(dates[4])} ${dates[4].getFullYear()}`;
}

export default function AgendaPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [semaineCourante, setSemaineCourante] = useState<Date>(() => {
    const today = new Date();
    return today;
  });
  const [fileAttente, setFileAttente] = useState(FILE_ATTENTE);

  const weekDates = getWeekDates(semaineCourante);
  const today = new Date();

  const goSemainePrecedente = () => {
    const prev = new Date(semaineCourante);
    prev.setDate(prev.getDate() - 7);
    setSemaineCourante(prev);
  };

  const goSemaineSuivante = () => {
    const next = new Date(semaineCourante);
    next.setDate(next.getDate() + 7);
    setSemaineCourante(next);
  };

  const appellerSuivant = () => {
    setFileAttente((prev) => prev.slice(1));
  };

  const getRDV = (jourIndex: number, heure: string): RDV | undefined =>
    RDV_FICTIFS.find((r) => r.jourIndex === jourIndex && r.heure === heure);

  const isToday = (date: Date): boolean =>
    date.toDateString() === today.toDateString();

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planning des rendez-vous
          </p>
        </div>
        <Link
          href={`/${locale}/rdv/nouveau`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span>+</span>
          Nouveau RDV
        </Link>
      </div>

      <div className="flex gap-4">
        {/* Grille agenda */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Navigation semaine */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <button
              onClick={goSemainePrecedente}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              ← Précédente
            </button>
            <span className="text-sm font-medium">{formatWeekLabel(weekDates)}</span>
            <button
              onClick={goSemaineSuivante}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              Suivante →
            </button>
          </div>

          {/* Grille */}
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-card">
                <tr>
                  <th className="w-16 border-b border-r px-2 py-2 text-center text-muted-foreground">
                    Heure
                  </th>
                  {weekDates.map((date, i) => (
                    <th
                      key={i}
                      className={`border-b border-r px-2 py-2 text-center font-medium ${
                        isToday(date) ? 'bg-blue-50 text-blue-700' : 'text-muted-foreground'
                      }`}
                    >
                      <div>{JOURS[i]}</div>
                      <div className={`text-base font-bold ${isToday(date) ? 'text-blue-700' : 'text-foreground'}`}>
                        {date.getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRENEAUX.map((creneau) => (
                  <tr key={creneau} className="h-10">
                    <td className="border-b border-r px-2 py-1 text-center text-muted-foreground font-mono">
                      {creneau}
                    </td>
                    {weekDates.map((date, jourIndex) => {
                      const rdv = getRDV(jourIndex, creneau);
                      return (
                        <td
                          key={jourIndex}
                          className={`border-b border-r px-1 py-0.5 ${
                            isToday(date) ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          {rdv && (
                            <div
                              className={`rounded border px-1.5 py-0.5 text-xs font-medium leading-tight ${
                                TYPE_COLORS[rdv.type]
                              }`}
                            >
                              <div className="font-semibold truncate">{rdv.patient}</div>
                              <div className="opacity-75">
                                {rdv.type} · {rdv.duree}min
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* File d'attente */}
        <div className="w-64 shrink-0">
          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">File d&apos;attente</h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {fileAttente.length}
              </span>
            </div>

            {fileAttente.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                File d&apos;attente vide
              </p>
            ) : (
              <>
                <ol className="space-y-2">
                  {fileAttente.map((patient, index) => (
                    <li
                      key={patient.id}
                      className={`rounded-lg border p-3 ${
                        index === 0 ? 'border-blue-200 bg-blue-50' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            index === 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{patient.nom}</p>
                          <p className="text-xs text-muted-foreground truncate">{patient.motif}</p>
                          <p className="text-xs text-orange-600 mt-0.5">
                            Attente: {patient.attente}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                <button
                  onClick={appellerSuivant}
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Appeler suivant
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
