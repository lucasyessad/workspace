'use client';

// ============================================================
// TabibPro — Portail Patient — Mes Rendez-vous
// Onglets À venir / Passés + modal confirmation annulation
// ============================================================

import { useState } from 'react';
import Link from 'next/link';

type Statut = 'CONFIRME' | 'EN_ATTENTE';

interface RdvAvenir {
  id: string;
  date: string;
  medecin: string;
  specialite: string;
  motif: string;
  statut: Statut;
  adresse: string;
}

interface RdvPasse {
  id: string;
  date: string;
  medecin: string;
  specialite: string;
  motif: string;
  diagnostic: string;
  ordonnanceId?: string;
}

const rdvAvenir: RdvAvenir[] = [
  {
    id: '1',
    date: '2026-03-15T10:30:00',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    motif: 'Contrôle tension',
    statut: 'CONFIRME',
    adresse: '12 Rue Didouche Mourad, Alger',
  },
  {
    id: '2',
    date: '2026-04-02T14:00:00',
    medecin: 'Dr. Boudiaf Sara',
    specialite: 'Cardiologue',
    motif: 'Suivi cardiaque',
    statut: 'EN_ATTENTE',
    adresse: 'CHU Mustapha, Alger',
  },
];

const rdvPassés: RdvPasse[] = [
  {
    id: '3',
    date: '2026-01-20T09:00:00',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    motif: 'Renouvellement ordonnance',
    diagnostic: 'HTA stable — traitement reconduit',
    ordonnanceId: 'ORD-001',
  },
  {
    id: '4',
    date: '2025-12-05T11:00:00',
    medecin: 'Dr. Boudiaf Sara',
    specialite: 'Cardiologue',
    motif: 'Bilan cardiaque annuel',
    diagnostic: 'ECG normal, Holter 24h prescrit',
    ordonnanceId: 'ORD-000',
  },
  {
    id: '5',
    date: '2025-10-14T15:30:00',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    motif: 'Angine',
    diagnostic: 'Pharyngite virale — traitement symptomatique',
    ordonnanceId: undefined,
  },
];

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatHeure(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function MesRdvPage() {
  const [onglet, setOnglet] = useState<'avenir' | 'passes'>('avenir');
  const [rdvAnnulerModal, setRdvAnnulerModal] = useState<RdvAvenir | null>(null);
  const [rdvsAnnules, setRdvsAnnules] = useState<Set<string>>(new Set());

  function handleConfirmAnnulation() {
    if (rdvAnnulerModal) {
      setRdvsAnnules((prev) => new Set([...prev, rdvAnnulerModal.id]));
      setRdvAnnulerModal(null);
    }
  }

  const rdvsVisibles = rdvAvenir.filter((r) => !rdvsAnnules.has(r.id));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos consultations médicales</p>
        </div>
        <Link
          href="#"
          className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Prendre un RDV
        </Link>
      </div>

      {/* Onglets */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {([
          { key: 'avenir', label: 'À venir', count: rdvsVisibles.length },
          { key: 'passes', label: 'Passés', count: rdvPassés.length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setOnglet(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              onglet === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
              onglet === tab.key
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste À venir */}
      {onglet === 'avenir' && (
        <div className="space-y-3">
          {rdvsVisibles.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <IconCalendar />
              <p className="mt-2 text-sm">Aucun rendez-vous à venir</p>
            </div>
          )}
          {rdvsVisibles.map((rdv) => (
            <div key={rdv.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{rdv.medecin}</p>
                  <p className="text-sm text-gray-500">{rdv.specialite}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  rdv.statut === 'CONFIRME'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {rdv.statut === 'CONFIRME' ? '✓ Confirmé' : '⏳ En attente'}
                </span>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                  <IconCalendar />
                  <span className="capitalize">{formatDateLong(rdv.date)} — {formatHeure(rdv.date)}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Motif : <span className="font-medium">{rdv.motif}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <IconPin />
                  {rdv.adresse}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Voir détails
                </button>
                <button
                  onClick={() => setRdvAnnulerModal(rdv)}
                  className="flex-1 border border-red-200 text-red-600 rounded-xl py-2 text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste Passés */}
      {onglet === 'passes' && (
        <div className="space-y-3">
          {rdvPassés.map((rdv) => (
            <div key={rdv.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{rdv.medecin}</p>
                  <p className="text-sm text-gray-500">{rdv.specialite}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(rdv.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Motif : <span className="font-medium">{rdv.motif}</span>
              </p>
              <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                <p className="text-xs text-gray-500">Diagnostic</p>
                <p className="text-sm text-gray-700 font-medium">{rdv.diagnostic}</p>
              </div>
              {rdv.ordonnanceId && (
                <Link
                  href="/fr/mes-ordonnances"
                  className="inline-flex items-center gap-1.5 text-emerald-600 text-sm hover:underline font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Voir l'ordonnance
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal annulation */}
      {rdvAnnulerModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setRdvAnnulerModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Annuler ce rendez-vous ?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              {rdvAnnulerModal.medecin}
            </p>
            <p className="text-sm text-gray-600 text-center font-medium mb-6 capitalize">
              {formatDateLong(rdvAnnulerModal.date)} — {formatHeure(rdvAnnulerModal.date)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRdvAnnulerModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 font-medium hover:bg-gray-50 transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={handleConfirmAnnulation}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 font-medium hover:bg-red-700 transition-colors"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
