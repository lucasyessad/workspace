// ============================================================
// TabibPro — Consultations
// Historique et gestion des consultations médicales
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeConsultation = 'Générale' | 'Suivi' | 'Urgence' | 'Bilan' | 'Spécialisée';
type StatutConsultation = 'Terminée' | 'En cours' | 'Annulée';

interface Consultation {
  id: string;
  patient: string;
  patientId: string;
  date: string;
  heure: string;
  type: TypeConsultation;
  motif: string;
  statut: StatutConsultation;
  diagnostic?: string;
  ordonnance?: string;
}

const CONSULTATIONS: Consultation[] = [
  {
    id: 'cons-001',
    patient: 'Amina Boulahia',
    patientId: 'pat-001',
    date: '2026-03-05',
    heure: '09:00',
    type: 'Générale',
    motif: 'Fièvre et maux de gorge depuis 3 jours',
    statut: 'Terminée',
    diagnostic: 'Angine bactérienne',
    ordonnance: 'ORD-2026-00045',
  },
  {
    id: 'cons-002',
    patient: 'Mohamed Khelifi',
    patientId: 'pat-002',
    date: '2026-03-05',
    heure: '10:00',
    type: 'Suivi',
    motif: 'Contrôle diabète type 2 — bilan trimestriel',
    statut: 'Terminée',
    diagnostic: 'Diabète type 2 équilibré (HbA1c 6.8%)',
    ordonnance: 'ORD-2026-00046',
  },
  {
    id: 'cons-003',
    patient: 'Fatima Zerrouki',
    patientId: 'pat-003',
    date: '2026-03-05',
    heure: '11:00',
    type: 'Bilan',
    motif: 'Bilan de santé annuel',
    statut: 'En cours',
  },
  {
    id: 'cons-004',
    patient: 'Karim Mansouri',
    patientId: 'pat-004',
    date: '2026-03-04',
    heure: '14:30',
    type: 'Urgence',
    motif: 'Douleur thoracique aiguë',
    statut: 'Terminée',
    diagnostic: 'Douleur musculo-squelettique, ECG normal',
  },
  {
    id: 'cons-005',
    patient: 'Nadia Hamidi',
    patientId: 'pat-005',
    date: '2026-03-04',
    heure: '15:30',
    type: 'Suivi',
    motif: 'Suivi hypertension artérielle',
    statut: 'Terminée',
    diagnostic: 'HTA contrôlée sous traitement',
    ordonnance: 'ORD-2026-00047',
  },
  {
    id: 'cons-006',
    patient: 'Omar Benatia',
    patientId: 'pat-006',
    date: '2026-03-04',
    heure: '16:00',
    type: 'Spécialisée',
    motif: 'Avis dermatologique — éruption cutanée',
    statut: 'Annulée',
  },
  {
    id: 'cons-007',
    patient: 'Leila Boudiaf',
    patientId: 'pat-007',
    date: '2026-03-03',
    heure: '09:30',
    type: 'Générale',
    motif: 'Toux persistante, dyspnée légère',
    statut: 'Terminée',
    diagnostic: 'Bronchite aiguë',
    ordonnance: 'ORD-2026-00048',
  },
  {
    id: 'cons-008',
    patient: 'Youcef Sahraoui',
    patientId: 'pat-008',
    date: '2026-03-03',
    heure: '11:00',
    type: 'Bilan',
    motif: 'Bilan pré-opératoire — appendicectomie',
    statut: 'Terminée',
    diagnostic: 'Patient apte à la chirurgie',
  },
];

const TYPE_COLORS: Record<TypeConsultation, string> = {
  'Générale': 'bg-blue-100 text-blue-800',
  'Suivi': 'bg-purple-100 text-purple-800',
  'Urgence': 'bg-red-100 text-red-800',
  'Bilan': 'bg-amber-100 text-amber-800',
  'Spécialisée': 'bg-teal-100 text-teal-800',
};

const STATUT_STYLES: Record<StatutConsultation, string> = {
  'Terminée': 'bg-green-100 text-green-800',
  'En cours': 'bg-blue-100 text-blue-700 animate-pulse',
  'Annulée': 'bg-gray-100 text-gray-600',
};

export default function ConsultationsPage() {
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState<TypeConsultation | 'Tous'>('Tous');
  const [filtreStatut, setFiltreStatut] = useState<StatutConsultation | 'Tous'>('Tous');
  const [consultationOuverte, setConsultationOuverte] = useState<Consultation | null>(null);

  const consultationsFiltrees = CONSULTATIONS.filter((c) => {
    const matchSearch =
      c.patient.toLowerCase().includes(search.toLowerCase()) ||
      c.motif.toLowerCase().includes(search.toLowerCase()) ||
      (c.diagnostic?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchType = filtreType === 'Tous' || c.type === filtreType;
    const matchStatut = filtreStatut === 'Tous' || c.statut === filtreStatut;
    return matchSearch && matchType && matchStatut;
  });

  const stats = {
    total: CONSULTATIONS.length,
    terminées: CONSULTATIONS.filter((c) => c.statut === 'Terminée').length,
    enCours: CONSULTATIONS.filter((c) => c.statut === 'En cours').length,
    annulées: CONSULTATIONS.filter((c) => c.statut === 'Annulée').length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-sm text-gray-500 mt-1">Historique des consultations médicales</p>
        </div>
        <Link
          href="./consultations/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <span>+</span> Nouvelle consultation
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Terminées', value: stats.terminées, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'En cours', value: stats.enCours, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Annulées', value: stats.annulées, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher patient, motif, diagnostic…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value as TypeConsultation | 'Tous')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Tous">Tous les types</option>
          {(['Générale', 'Suivi', 'Urgence', 'Bilan', 'Spécialisée'] as TypeConsultation[]).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutConsultation | 'Tous')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Tous">Tous les statuts</option>
          {(['Terminée', 'En cours', 'Annulée'] as StatutConsultation[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Date / Heure</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Motif</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {consultationsFiltrees.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900">
                  <p className="font-medium">{c.date}</p>
                  <p className="text-gray-500 text-xs">{c.heure}</p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`./patients/${c.patientId}`} className="font-medium text-blue-600 hover:underline">
                    {c.patient}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-xs truncate">
                  {c.motif}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[c.type]}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[c.statut]}`}>
                    {c.statut}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setConsultationOuverte(c)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                  >
                    Voir
                  </button>
                  {c.statut === 'Terminée' && (
                    <button className="text-gray-500 hover:text-gray-700 text-xs">
                      PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {consultationsFiltrees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">🩺</p>
            <p>Aucune consultation trouvée</p>
          </div>
        )}
      </div>

      {/* Modal détail consultation */}
      {consultationOuverte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Détail de la consultation
              </h2>
              <button
                onClick={() => setConsultationOuverte(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {consultationOuverte.patient.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{consultationOuverte.patient}</p>
                  <p className="text-sm text-gray-500">{consultationOuverte.date} à {consultationOuverte.heure}</p>
                </div>
                <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[consultationOuverte.type]}`}>
                  {consultationOuverte.type}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Motif de consultation</p>
                <p className="text-gray-900">{consultationOuverte.motif}</p>
              </div>

              {consultationOuverte.diagnostic && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Diagnostic</p>
                  <p className="text-gray-900">{consultationOuverte.diagnostic}</p>
                </div>
              )}

              {consultationOuverte.ordonnance && (
                <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Ordonnance associée</p>
                    <p className="text-gray-900 font-medium">{consultationOuverte.ordonnance}</p>
                  </div>
                  <Link
                    href="./ordonnances"
                    className="text-green-700 hover:text-green-900 text-sm font-medium"
                  >
                    Voir →
                  </Link>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Modifier
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
