// ============================================================
// TabibPro — Rapports & Statistiques
// Tableau de bord analytique pour le cabinet médical
// ============================================================

'use client';

import { useState } from 'react';

type PeriodeRapport = 'semaine' | 'mois' | 'trimestre' | 'annee';

export default function RapportsPage() {
  const [periode, setPeriode] = useState<PeriodeRapport>('mois');

  const stats = {
    semaine: {
      consultations: 34,
      nouveauxPatients: 8,
      revenu: 52000,
      tauxPresence: 88,
      ordonnances: 28,
    },
    mois: {
      consultations: 142,
      nouveauxPatients: 31,
      revenu: 213000,
      tauxPresence: 91,
      ordonnances: 118,
    },
    trimestre: {
      consultations: 421,
      nouveauxPatients: 89,
      revenu: 631500,
      tauxPresence: 90,
      ordonnances: 352,
    },
    annee: {
      consultations: 1687,
      nouveauxPatients: 312,
      revenu: 2530000,
      tauxPresence: 89,
      ordonnances: 1405,
    },
  };

  const s = stats[periode];

  const typesConsultation = [
    { type: 'Consultation générale', nombre: Math.round(s.consultations * 0.45), pct: 45 },
    { type: 'Suivi chronique', nombre: Math.round(s.consultations * 0.28), pct: 28 },
    { type: 'Bilan de santé', nombre: Math.round(s.consultations * 0.15), pct: 15 },
    { type: 'Urgence', nombre: Math.round(s.consultations * 0.08), pct: 8 },
    { type: 'Spécialisée', nombre: Math.round(s.consultations * 0.04), pct: 4 },
  ];

  const assurances = [
    { nom: 'CNAS', nombre: Math.round(s.consultations * 0.48), pct: 48, couleur: 'bg-blue-500' },
    { nom: 'CASNOS', nombre: Math.round(s.consultations * 0.22), pct: 22, couleur: 'bg-purple-500' },
    { nom: 'Mutuelle', nombre: Math.round(s.consultations * 0.12), pct: 12, couleur: 'bg-teal-500' },
    { nom: 'Sans assurance', nombre: Math.round(s.consultations * 0.18), pct: 18, couleur: 'bg-gray-400' },
  ];

  const pathologiesFrequentes = [
    { diagnostic: 'Hypertension artérielle', cas: Math.round(s.consultations * 0.18) },
    { diagnostic: 'Diabète type 2', cas: Math.round(s.consultations * 0.14) },
    { diagnostic: 'Infections respiratoires', cas: Math.round(s.consultations * 0.12) },
    { diagnostic: 'Lombalgie', cas: Math.round(s.consultations * 0.09) },
    { diagnostic: 'Gastrite / RGO', cas: Math.round(s.consultations * 0.07) },
    { diagnostic: 'Dépression / Anxiété', cas: Math.round(s.consultations * 0.06) },
  ];

  function formatDZD(n: number) {
    return n.toLocaleString('fr-DZ') + ' DA';
  }

  const PERIODE_LABELS: Record<PeriodeRapport, string> = {
    semaine: 'Cette semaine',
    mois: 'Ce mois',
    trimestre: 'Ce trimestre',
    annee: 'Cette année',
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">Analyse d&apos;activité du cabinet médical</p>
        </div>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Exporter PDF
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {(['semaine', 'mois', 'trimestre', 'annee'] as PeriodeRapport[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriode(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              periode === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {PERIODE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Consultations',
            value: s.consultations,
            suffix: '',
            trend: '+12%',
            color: 'blue',
            icon: '🩺',
          },
          {
            label: 'Nouveaux patients',
            value: s.nouveauxPatients,
            suffix: '',
            trend: '+8%',
            color: 'green',
            icon: '👤',
          },
          {
            label: 'Revenus',
            value: formatDZD(s.revenu),
            suffix: '',
            trend: '+15%',
            color: 'purple',
            icon: '💰',
          },
          {
            label: 'Taux de présence',
            value: s.tauxPresence,
            suffix: '%',
            trend: '+2%',
            color: 'amber',
            icon: '✅',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-${kpi.color}-50 rounded-xl p-5 border border-${kpi.color}-100`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {kpi.trend}
              </span>
            </div>
            <p className={`text-2xl font-bold text-${kpi.color}-900`}>
              {kpi.value}{kpi.suffix}
            </p>
            <p className={`text-sm text-${kpi.color}-700 mt-1`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Types de consultations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Types de consultations</h2>
          <div className="space-y-3">
            {typesConsultation.map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{t.type}</span>
                  <span className="text-gray-500">{t.nombre} ({t.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition assurances */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Couverture sociale patients</h2>
          <div className="space-y-3">
            {assurances.map((a) => (
              <div key={a.nom}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${a.couleur}`} />
                    <span className="text-gray-700">{a.nom}</span>
                  </div>
                  <span className="text-gray-500">{a.nombre} ({a.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${a.couleur} h-2 rounded-full transition-all`}
                    style={{ width: `${a.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pathologies fréquentes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Diagnostics les plus fréquents</h2>
          <div className="space-y-2">
            {pathologiesFrequentes.map((p, i) => (
              <div key={p.diagnostic} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700">{p.diagnostic}</span>
                <span className="text-sm font-semibold text-gray-900">{p.cas} cas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité par jour de la semaine */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Activité par jour (moyenne)</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {[
              { jour: 'Dim', val: 18 },
              { jour: 'Lun', val: 28 },
              { jour: 'Mar', val: 32 },
              { jour: 'Mer', val: 24 },
              { jour: 'Jeu', val: 22 },
            ].map((j) => (
              <div key={j.jour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{j.val}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md"
                  style={{ height: `${(j.val / 32) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{j.jour}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Jours ouvrables en Algérie : Dimanche → Jeudi
          </p>
        </div>
      </div>

      {/* Résumé ordonnances */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Activité ordonnances</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Ordonnances émises', value: s.ordonnances, color: 'text-gray-900' },
            { label: 'Ordonnances bizone', value: Math.round(s.ordonnances * 0.22), color: 'text-blue-700' },
            { label: 'Chroniques', value: Math.round(s.ordonnances * 0.31), color: 'text-purple-700' },
            { label: 'Renouvellements', value: Math.round(s.ordonnances * 0.18), color: 'text-green-700' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
