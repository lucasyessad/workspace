'use client';

// ============================================================
// TabibPro — Portail Patient — Mes Ordonnances
// Liste avec filtres, badges type/statut, téléchargement PDF
// ============================================================

import { useState } from 'react';

type TypeOrd = 'Chronique' | 'Standard' | 'Bizone';
type StatutOrd = 'Valide' | 'Expiree';
type FiltreOrd = 'En cours' | 'Expirees' | 'Toutes';

interface Medicament {
  nom: string;
  posologie: string;
  duree: string;
}

interface Ordonnance {
  id: string;
  numero: string;
  date: string;
  medecin: string;
  specialite: string;
  type: TypeOrd;
  statut: StatutOrd;
  medicaments: Medicament[];
  renouvelable: boolean;
}

const ordonnances: Ordonnance[] = [
  {
    id: '1',
    numero: 'ORD-2026-001',
    date: '2026-02-10',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    type: 'Chronique',
    statut: 'Valide',
    renouvelable: true,
    medicaments: [
      { nom: 'Metformine 850mg', posologie: '1 comprimé matin et soir au repas', duree: '3 mois' },
      { nom: 'Amlodipine 5mg', posologie: '1 comprimé le matin', duree: '3 mois' },
      { nom: 'Aspirine 100mg', posologie: '1 comprimé le soir', duree: '3 mois' },
    ],
  },
  {
    id: '2',
    numero: 'ORD-2026-002',
    date: '2026-01-22',
    medecin: 'Dr. Boudiaf Sara',
    specialite: 'Cardiologue',
    type: 'Standard',
    statut: 'Valide',
    renouvelable: false,
    medicaments: [
      { nom: 'Amoxicilline 1g', posologie: '1 comprimé 3 fois par jour', duree: '7 jours' },
      { nom: 'Ibuprofène 400mg', posologie: '1 comprimé si douleur (max 3/j)', duree: '5 jours' },
    ],
  },
  {
    id: '3',
    numero: 'ORD-2025-045',
    date: '2025-08-15',
    medecin: 'Dr. Meziane Ahmed',
    specialite: 'Médecin Généraliste',
    type: 'Bizone',
    statut: 'Expiree',
    renouvelable: false,
    medicaments: [
      { nom: 'Atorvastatine 20mg', posologie: '1 comprimé le soir', duree: '1 mois' },
      { nom: 'Pantoprazole 40mg', posologie: '1 comprimé le matin à jeun', duree: '1 mois' },
    ],
  },
];

function badgeType(type: TypeOrd) {
  const styles: Record<TypeOrd, string> = {
    Chronique: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Standard: 'bg-blue-100 text-blue-700 border border-blue-200',
    Bizone: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  };
  return styles[type];
}

function badgeStatut(statut: StatutOrd) {
  return statut === 'Valide'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-red-100 text-red-700 border border-red-200';
}

function IconDownload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export default function MesOrdonnancesPage() {
  const [filtre, setFiltre] = useState<FiltreOrd>('Toutes');

  const ordonnancesFiltrees = ordonnances.filter((ord) => {
    if (filtre === 'En cours') return ord.statut === 'Valide';
    if (filtre === 'Expirees') return ord.statut === 'Expiree';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mes Ordonnances</h1>
        <p className="text-sm text-gray-500 mt-0.5">Consultez et téléchargez vos ordonnances</p>
      </div>

      {/* Filtres */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(['Toutes', 'En cours', 'Expirees'] as FiltreOrd[]).map((f) => {
          const label = f === 'Expirees' ? 'Expirées' : f;
          const count =
            f === 'Toutes'
              ? ordonnances.length
              : f === 'En cours'
              ? ordonnances.filter((o) => o.statut === 'Valide').length
              : ordonnances.filter((o) => o.statut === 'Expiree').length;
          return (
            <button
              key={f}
              onClick={() => setFiltre(f)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium transition-colors ${
                filtre === f
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                filtre === f ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Liste ordonnances */}
      <div className="space-y-4">
        {ordonnancesFiltrees.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Aucune ordonnance dans cette catégorie</p>
          </div>
        )}
        {ordonnancesFiltrees.map((ord) => (
          <div
            key={ord.id}
            className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
              ord.statut === 'Expiree' ? 'border-gray-200 opacity-80' : 'border-gray-100'
            }`}
          >
            {/* En-tête ordonnance */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 font-mono">{ord.numero}</p>
                <p className="font-semibold text-gray-800">{ord.medecin}</p>
                <p className="text-xs text-gray-500">
                  {ord.specialite} — {new Date(ord.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeType(ord.type)}`}>
                  {ord.type}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeStatut(ord.statut)}`}>
                  {ord.statut === 'Valide' ? '✓ Valide' : '✗ Expirée'}
                </span>
              </div>
            </div>

            {/* Médicaments */}
            <div className="px-4 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Médicaments ({ord.medicaments.length})
              </h3>
              <div className="space-y-2">
                {ord.medicaments.map((med, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1 bg-emerald-200 rounded-full shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{med.nom}</p>
                      <p className="text-xs text-gray-500">{med.posologie}</p>
                      <p className="text-xs text-emerald-600 font-medium">Durée : {med.duree}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-wrap">
              <button className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                <IconDownload />
                Télécharger PDF
              </button>
              {ord.renouvelable && ord.statut === 'Valide' && (
                <button className="flex items-center gap-1.5 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-colors">
                  <IconRefresh />
                  Renouveler
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
