// ============================================================
// TabibPro — Facturation
// Gestion des actes, honoraires et règlements (DZD)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type StatutFacture = 'Payée' | 'En attente' | 'Impayée' | 'Remboursée';
type TypePaiement = 'Espèces' | 'CCP' | 'Chèque' | 'CNAS' | 'CASNOS' | 'Mutuelle';

interface Facture {
  id: string;
  numero: string;
  patient: string;
  patientId: string;
  date: string;
  acte: string;
  montant: number;
  montantRembourse?: number;
  statut: StatutFacture;
  modePaiement?: TypePaiement;
}

const FACTURES: Facture[] = [
  {
    id: 'fac-001',
    numero: 'FAC-2026-00089',
    patient: 'Amina Boulahia',
    patientId: 'pat-001',
    date: '2026-03-05',
    acte: 'Consultation générale',
    montant: 1500,
    statut: 'Payée',
    modePaiement: 'Espèces',
  },
  {
    id: 'fac-002',
    numero: 'FAC-2026-00090',
    patient: 'Mohamed Khelifi',
    patientId: 'pat-002',
    date: '2026-03-05',
    acte: 'Consultation + bilan glycémique',
    montant: 2500,
    montantRembourse: 1800,
    statut: 'Remboursée',
    modePaiement: 'CNAS',
  },
  {
    id: 'fac-003',
    numero: 'FAC-2026-00091',
    patient: 'Fatima Zerrouki',
    patientId: 'pat-003',
    date: '2026-03-05',
    acte: 'Bilan de santé complet',
    montant: 4000,
    statut: 'En attente',
  },
  {
    id: 'fac-004',
    numero: 'FAC-2026-00088',
    patient: 'Karim Mansouri',
    patientId: 'pat-004',
    date: '2026-03-04',
    acte: 'Consultation urgence',
    montant: 2000,
    statut: 'Impayée',
  },
  {
    id: 'fac-005',
    numero: 'FAC-2026-00087',
    patient: 'Nadia Hamidi',
    patientId: 'pat-005',
    date: '2026-03-04',
    acte: 'Suivi HTA + ECG',
    montant: 3000,
    montantRembourse: 2400,
    statut: 'Remboursée',
    modePaiement: 'CASNOS',
  },
  {
    id: 'fac-006',
    numero: 'FAC-2026-00086',
    patient: 'Leila Boudiaf',
    patientId: 'pat-007',
    date: '2026-03-03',
    acte: 'Consultation + radiographie pulmonaire',
    montant: 3500,
    statut: 'Payée',
    modePaiement: 'CCP',
  },
  {
    id: 'fac-007',
    numero: 'FAC-2026-00085',
    patient: 'Youcef Sahraoui',
    patientId: 'pat-008',
    date: '2026-03-03',
    acte: 'Bilan pré-opératoire',
    montant: 5000,
    statut: 'En attente',
  },
];

const STATUT_STYLES: Record<StatutFacture, string> = {
  'Payée': 'bg-green-100 text-green-800',
  'En attente': 'bg-amber-100 text-amber-800',
  'Impayée': 'bg-red-100 text-red-800',
  'Remboursée': 'bg-blue-100 text-blue-800',
};

function formatDZD(montant: number) {
  return montant.toLocaleString('fr-DZ') + ' DA';
}

export default function FacturationPage() {
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutFacture | 'Tous'>('Tous');

  const facturesFiltrees = FACTURES.filter((f) => {
    const matchSearch =
      f.patient.toLowerCase().includes(search.toLowerCase()) ||
      f.numero.toLowerCase().includes(search.toLowerCase()) ||
      f.acte.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === 'Tous' || f.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const totalEncaissé = FACTURES.filter((f) => f.statut === 'Payée' || f.statut === 'Remboursée')
    .reduce((acc, f) => acc + f.montant, 0);
  const totalEnAttente = FACTURES.filter((f) => f.statut === 'En attente')
    .reduce((acc, f) => acc + f.montant, 0);
  const totalImpayé = FACTURES.filter((f) => f.statut === 'Impayée')
    .reduce((acc, f) => acc + f.montant, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
          <p className="text-sm text-gray-500 mt-1">Honoraires et règlements des actes médicaux</p>
        </div>
        <Link
          href="./facturation/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Nouvelle facture
        </Link>
      </div>

      {/* Statistiques financières */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-sm text-green-700 font-medium">Total encaissé (mars)</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{formatDZD(totalEncaissé)}</p>
          <p className="text-xs text-green-600 mt-1">{FACTURES.filter((f) => f.statut === 'Payée' || f.statut === 'Remboursée').length} actes réglés</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <p className="text-sm text-amber-700 font-medium">En attente de règlement</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{formatDZD(totalEnAttente)}</p>
          <p className="text-xs text-amber-600 mt-1">{FACTURES.filter((f) => f.statut === 'En attente').length} factures en cours</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-100">
          <p className="text-sm text-red-700 font-medium">Impayés</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{formatDZD(totalImpayé)}</p>
          <p className="text-xs text-red-600 mt-1">{FACTURES.filter((f) => f.statut === 'Impayée').length} facture(s) impayée(s)</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher patient, numéro, acte…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutFacture | 'Tous')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Tous">Tous les statuts</option>
          {(['Payée', 'En attente', 'Impayée', 'Remboursée'] as StatutFacture[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          Exporter CSV
        </button>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">N° Facture</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Acte</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Montant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Paiement</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {facturesFiltrees.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{f.numero}</td>
                <td className="px-4 py-3">
                  <Link href={`./patients/${f.patientId}`} className="font-medium text-blue-600 hover:underline">
                    {f.patient}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">{f.acte}</td>
                <td className="px-4 py-3 text-gray-600">{f.date}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatDZD(f.montant)}
                  {f.montantRembourse && (
                    <p className="text-xs text-blue-600 font-normal">remb. {formatDZD(f.montantRembourse)}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell text-xs">
                  {f.modePaiement ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[f.statut]}`}>
                    {f.statut}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">PDF</button>
                  {f.statut === 'En attente' && (
                    <button className="text-green-600 hover:text-green-800 text-xs font-medium">Encaisser</button>
                  )}
                  {f.statut === 'Impayée' && (
                    <button className="text-red-600 hover:text-red-800 text-xs font-medium">Relancer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {facturesFiltrees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">🧾</p>
            <p>Aucune facture trouvée</p>
          </div>
        )}
      </div>

      {/* Tarifs des actes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Grille tarifaire</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { acte: 'Consultation générale', tarif: 1500 },
            { acte: 'Consultation spécialisée', tarif: 2500 },
            { acte: 'Consultation urgence', tarif: 2000 },
            { acte: 'Bilan de santé complet', tarif: 4000 },
            { acte: 'ECG + interprétation', tarif: 1500 },
            { acte: 'Injection / Soin', tarif: 800 },
          ].map((a) => (
            <div key={a.acte} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{a.acte}</span>
              <span className="text-sm font-semibold text-gray-900">{formatDZD(a.tarif)}</span>
            </div>
          ))}
        </div>
        <button className="mt-3 text-sm text-blue-600 hover:underline">Modifier les tarifs →</button>
      </div>
    </div>
  );
}
