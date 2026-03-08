// ============================================================
// TabibPro — Vaccinations
// Suivi du Programme Élargi de Vaccination (PEV Algérie)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type StatutVaccin = 'Administré' | 'En retard' | 'Planifié' | 'Refusé';

interface Vaccination {
  id: string;
  patient: string;
  patientId: string;
  age: string;
  vaccin: string;
  dose: string;
  dateAdministration?: string;
  datePlanifiee?: string;
  statut: StatutVaccin;
  lot?: string;
  site?: string;
}

const VACCINATIONS: Vaccination[] = [
  {
    id: 'vac-001',
    patient: 'Yasmine Kaci',
    patientId: 'pat-010',
    age: '3 mois',
    vaccin: 'DTCoq-Hib-VHB (Pentavalent)',
    dose: '1ère dose',
    dateAdministration: '2026-03-04',
    statut: 'Administré',
    lot: 'LOT-PV-2025-442',
    site: 'Cuisse gauche (IM)',
  },
  {
    id: 'vac-002',
    patient: 'Amine Zerara',
    patientId: 'pat-011',
    age: '4 mois',
    vaccin: 'DTCoq-Hib-VHB (Pentavalent)',
    dose: '2ème dose',
    datePlanifiee: '2026-03-06',
    statut: 'Planifié',
  },
  {
    id: 'vac-003',
    patient: 'Sara Bouabdellah',
    patientId: 'pat-012',
    age: '18 mois',
    vaccin: 'ROR (Rougeole-Oreillons-Rubéole)',
    dose: '1ère dose',
    datePlanifiee: '2026-02-20',
    statut: 'En retard',
  },
  {
    id: 'vac-004',
    patient: 'Ryad Hamami',
    patientId: 'pat-013',
    age: '6 mois',
    vaccin: 'VPO (Polio oral)',
    dose: '3ème dose',
    dateAdministration: '2026-03-03',
    statut: 'Administré',
    lot: 'LOT-VPO-2025-118',
    site: 'Voie orale',
  },
  {
    id: 'vac-005',
    patient: 'Malak Tirichine',
    patientId: 'pat-014',
    age: '9 mois',
    vaccin: 'Fièvre typhoïde (Vi polysaccharide)',
    dose: 'Dose unique',
    datePlanifiee: '2026-03-10',
    statut: 'Planifié',
  },
  {
    id: 'vac-006',
    patient: 'Ibrahim Hadj',
    patientId: 'pat-015',
    age: '5 ans',
    vaccin: 'DTC (Rappel)',
    dose: 'Rappel 5 ans',
    datePlanifiee: '2026-03-01',
    statut: 'En retard',
  },
  {
    id: 'vac-007',
    patient: 'Nour Seddik',
    patientId: 'pat-016',
    age: '2 mois',
    vaccin: 'BCG (Tuberculose)',
    dose: 'Dose unique',
    dateAdministration: '2026-03-05',
    statut: 'Administré',
    lot: 'LOT-BCG-2025-287',
    site: 'Bras gauche (ID)',
  },
  {
    id: 'vac-008',
    patient: 'Wissem Chaker',
    patientId: 'pat-017',
    age: '11 ans',
    vaccin: 'HPV (Papillomavirus)',
    dose: '1ère dose',
    datePlanifiee: '2026-03-08',
    statut: 'Refusé',
  },
];

const CALENDRIER_PEV = [
  { age: 'Naissance', vaccins: ['BCG', 'VHB (1ère dose)', 'VPO (dose 0)'] },
  { age: '2 mois', vaccins: ['Pentavalent 1', 'VPO 1', 'Pneumocoque 1'] },
  { age: '3 mois', vaccins: ['Pentavalent 2', 'VPO 2', 'Pneumocoque 2'] },
  { age: '4 mois', vaccins: ['Pentavalent 3', 'VPO 3', 'Pneumocoque 3'] },
  { age: '9 mois', vaccins: ['ROR 1', 'Fièvre typhoïde', 'Méningocoque A'] },
  { age: '18 mois', vaccins: ['ROR 2', 'DTC rappel 1', 'VPO 4'] },
  { age: '5 ans', vaccins: ['DTC rappel 2', 'VPO 5'] },
  { age: '11 ans', vaccins: ['DT (rappel)', 'HPV (filles)'] },
];

const STATUT_STYLES: Record<StatutVaccin, string> = {
  'Administré': 'bg-green-100 text-green-800',
  'En retard': 'bg-red-100 text-red-800',
  'Planifié': 'bg-blue-100 text-blue-800',
  'Refusé': 'bg-gray-100 text-gray-600',
};

const STATUT_ICON: Record<StatutVaccin, string> = {
  'Administré': '✅',
  'En retard': '⚠️',
  'Planifié': '📅',
  'Refusé': '❌',
};

export default function VaccinationsPage() {
  const [onglet, setOnglet] = useState<'suivi' | 'calendrier'>('suivi');
  const [filtreStatut, setFiltreStatut] = useState<StatutVaccin | 'Tous'>('Tous');
  const [search, setSearch] = useState('');

  const vaccinationsFiltrees = VACCINATIONS.filter((v) => {
    const matchSearch =
      v.patient.toLowerCase().includes(search.toLowerCase()) ||
      v.vaccin.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === 'Tous' || v.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: VACCINATIONS.length,
    administrés: VACCINATIONS.filter((v) => v.statut === 'Administré').length,
    enRetard: VACCINATIONS.filter((v) => v.statut === 'En retard').length,
    planifiés: VACCINATIONS.filter((v) => v.statut === 'Planifié').length,
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vaccinations</h1>
          <p className="text-sm text-gray-500 mt-1">Programme Élargi de Vaccination — PEV Algérie</p>
        </div>
        <Link
          href="./vaccinations/nouveau"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Enregistrer vaccination
        </Link>
      </div>

      {/* Alertes en retard */}
      {stats.enRetard > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">
              {stats.enRetard} vaccination{stats.enRetard > 1 ? 's' : ''} en retard
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              Contacter les familles pour planifier les vaccinations manquées.
            </p>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total actes', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Administrés', value: stats.administrés, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'En retard', value: stats.enRetard, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Planifiés', value: stats.planifiés, color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'suivi', label: 'Suivi patients' },
          { key: 'calendrier', label: 'Calendrier PEV' },
        ].map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key as 'suivi' | 'calendrier')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              onglet === o.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === 'suivi' && (
        <>
          {/* Filtres */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
            <input
              type="search"
              placeholder="Rechercher patient ou vaccin…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as StatutVaccin | 'Tous')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tous">Tous les statuts</option>
              {(['Administré', 'En retard', 'Planifié', 'Refusé'] as StatutVaccin[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Patient / Âge</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Vaccin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Dose</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vaccinationsFiltrees.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`./patients/${v.patientId}`} className="font-medium text-blue-600 hover:underline">
                        {v.patient}
                      </Link>
                      <p className="text-xs text-gray-500">{v.age}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-xs">{v.vaccin}</p>
                      {v.lot && <p className="text-xs text-gray-400">Lot: {v.lot}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">{v.dose}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {v.dateAdministration ?? (
                        <span className={v.statut === 'En retard' ? 'text-red-600 font-medium' : ''}>
                          {v.datePlanifiee ?? '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_STYLES[v.statut]}`}>
                        {STATUT_ICON[v.statut]} {v.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {v.statut === 'En retard' && (
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-2">Planifier</button>
                      )}
                      {v.statut === 'Planifié' && (
                        <button className="text-green-600 hover:text-green-800 text-xs font-medium mr-2">Valider</button>
                      )}
                      {v.statut === 'Administré' && (
                        <button className="text-gray-500 hover:text-gray-700 text-xs">Carnet</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {onglet === 'calendrier' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <p className="text-sm font-medium text-blue-800">
              Calendrier officiel du Programme Élargi de Vaccination — Ministère de la Santé algérien
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {CALENDRIER_PEV.map((periode) => (
              <div key={periode.age} className="px-6 py-4 flex items-start gap-6">
                <div className="w-24 flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {periode.age}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {periode.vaccins.map((vaccin) => (
                    <span
                      key={vaccin}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-700 font-medium"
                    >
                      {vaccin}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Source : INSP Algérie — Programme National d&apos;Immunisation. Mise à jour 2025.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
