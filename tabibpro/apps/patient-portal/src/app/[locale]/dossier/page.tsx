// ============================================================
// TabibPro — Dossier médical patient
// Consultation du dossier médical personnel (portail patient)
// ============================================================

'use client';

import { useState } from 'react';

type OngletDossier = 'resume' | 'antecedents' | 'traitements' | 'examens' | 'vaccins';

const PATIENT = {
  nom: 'Amina Boulahia',
  dateNaissance: '15 mars 1988',
  age: 37,
  sexe: 'F',
  groupeSanguin: 'B+',
  taille: 165,
  poids: 62,
  imc: 22.8,
  medecin: 'Dr. Ahmed Benaissa',
  cnas: '061234567890',
};

const ANTECEDENTS = {
  personnels: [
    { annee: '2019', diagnostic: 'Angine à répétition (3 épisodes)', type: 'ORL' },
    { annee: '2022', diagnostic: 'Anémie ferriprive (Hb 9.2 g/dL) — traitée', type: 'Hématologie' },
    { annee: '2024', diagnostic: 'Rhinite allergique saisonnière', type: 'Allergologie' },
  ],
  familiaux: [
    { lien: 'Père', pathologie: 'Diabète type 2, HTA' },
    { lien: 'Mère', pathologie: 'Hypothyroïdie sous traitement' },
    { lien: 'Sœur', pathologie: 'Asthme' },
  ],
  allergies: ['Pénicilline (réaction cutanée)', 'Aspirine (intolérance digestive)'],
  chirurgies: [
    { annee: '2015', acte: 'Appendicectomie', etablissement: 'CHU Mustapha Alger' },
  ],
};

const TRAITEMENTS_EN_COURS = [
  {
    medicament: 'Cétirizine 10mg',
    posologie: '1 comprimé le soir',
    indication: 'Rhinite allergique',
    prescripteur: 'Dr. Benaissa',
    depuis: 'Mars 2024',
  },
  {
    medicament: 'Fer + Vitamine C (Tardyferon B9)',
    posologie: '1 comprimé matin et soir',
    indication: 'Supplémentation en fer',
    prescripteur: 'Dr. Benaissa',
    depuis: 'Janv. 2025',
  },
];

const EXAMENS_RECENTS = [
  {
    date: '2026-02-15',
    type: 'Biologie',
    examen: 'NFS — Numération Formule Sanguine',
    resultat: 'Normal (Hb 12.8 g/dL)',
    statut: 'normal',
  },
  {
    date: '2026-02-15',
    type: 'Biologie',
    examen: 'Ferritine sérique',
    resultat: '35 µg/L (normal)',
    statut: 'normal',
  },
  {
    date: '2026-01-20',
    type: 'Imagerie',
    examen: 'Radiographie thoracique',
    resultat: 'Poumons clairs, pas d\'anomalie',
    statut: 'normal',
  },
  {
    date: '2025-12-10',
    type: 'Biologie',
    examen: 'Glycémie à jeun',
    resultat: '0.95 g/L (légèrement élevée)',
    statut: 'attention',
  },
  {
    date: '2025-11-05',
    type: 'Biologie',
    examen: 'Bilan lipidique complet',
    resultat: 'Cholestérol total 2.1 g/L — Normal',
    statut: 'normal',
  },
];

const VACCINS = [
  { vaccin: 'BCG (Tuberculose)', date: '1988', statut: 'Immunisée' },
  { vaccin: 'DTP — Diphtérie-Tétanos-Polio', date: '1988-1992', statut: 'Immunisée' },
  { vaccin: 'ROR — Rougeole-Oreillons-Rubéole', date: '1989', statut: 'Immunisée' },
  { vaccin: 'Rappel Tétanos-Diphtérie', date: '2018', statut: 'Immunisée' },
  { vaccin: 'COVID-19 (AstraZeneca)', date: 'Juin 2021', statut: 'Immunisée' },
  { vaccin: 'Grippe saisonnière', date: 'Oct. 2025', statut: 'À renouveler 2026' },
];

const STATUT_EXAMEN: Record<string, string> = {
  normal: 'text-green-700 bg-green-50',
  attention: 'text-amber-700 bg-amber-50',
  anormal: 'text-red-700 bg-red-50',
};

export default function DossierPage() {
  const [onglet, setOnglet] = useState<OngletDossier>('resume');

  const imc = PATIENT.imc;
  const imcLabel = imc < 18.5 ? 'Insuffisance pondérale' : imc < 25 ? 'Poids normal' : imc < 30 ? 'Surpoids' : 'Obésité';
  const imcColor = imc < 18.5 ? 'text-blue-600' : imc < 25 ? 'text-green-600' : imc < 30 ? 'text-amber-600' : 'text-red-600';

  const ONGLETS: { key: OngletDossier; label: string }[] = [
    { key: 'resume', label: 'Résumé' },
    { key: 'antecedents', label: 'Antécédents' },
    { key: 'traitements', label: 'Traitements en cours' },
    { key: 'examens', label: 'Examens' },
    { key: 'vaccins', label: 'Vaccinations' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* En-tête identité */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
            {PATIENT.nom.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{PATIENT.nom}</h1>
            <p className="text-sm text-gray-500">
              Née le {PATIENT.dateNaissance} • {PATIENT.age} ans • CNAS {PATIENT.cnas}
            </p>
            <p className="text-sm text-emerald-700 mt-0.5">Médecin traitant : {PATIENT.medecin}</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-medium">Groupe sanguin</p>
            <p className="text-2xl font-bold text-red-700">{PATIENT.groupeSanguin}</p>
          </div>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Taille</p>
            <p className="text-lg font-bold text-gray-900">{PATIENT.taille} cm</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Poids</p>
            <p className="text-lg font-bold text-gray-900">{PATIENT.poids} kg</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">IMC</p>
            <p className={`text-lg font-bold ${imcColor}`}>{imc}</p>
            <p className={`text-xs ${imcColor}`}>{imcLabel}</p>
          </div>
        </div>

        {/* Alertes allergies */}
        {ANTECEDENTS.allergies.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-red-500 flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Allergies connues</p>
              <p className="text-xs text-red-600 mt-0.5">{ANTECEDENTS.allergies.join(' · ')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-t-xl px-2">
        {ONGLETS.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              onglet === o.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Contenu onglets */}
      <div className="bg-white rounded-b-xl rounded-t-none border border-gray-200 border-t-0 p-6">
        {onglet === 'resume' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Résumé du dossier médical</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-2">Pathologies actives</p>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-700">• Rhinite allergique saisonnière</li>
                  <li className="text-sm text-gray-700">• Supplémentation en fer (en cours)</li>
                </ul>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">Surveillance</p>
                <ul className="space-y-1">
                  <li className="text-sm text-gray-700">• Glycémie à jeun à surveiller (0.95 g/L)</li>
                  <li className="text-sm text-gray-700">• Rappel grippe 2026 à planifier</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Prochaine consultation recommandée</p>
              <p className="text-sm text-gray-900">Contrôle trimestriel — Revoir glycémie et bilan iron</p>
              <p className="text-xs text-gray-500 mt-1">Dr. Benaissa recommande un suivi dans 3 mois</p>
            </div>
          </div>
        )}

        {onglet === 'antecedents' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Antécédents personnels</h3>
              <div className="space-y-2">
                {ANTECEDENTS.personnels.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-400 w-10 flex-shrink-0 mt-0.5">{a.annee}</span>
                    <div>
                      <p className="text-sm text-gray-900">{a.diagnostic}</p>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{a.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Antécédents familiaux</h3>
              <div className="space-y-2">
                {ANTECEDENTS.familiaux.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50">
                    <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">{f.lien}</span>
                    <p className="text-sm text-gray-700">{f.pathologie}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Chirurgies</h3>
              {ANTECEDENTS.chirurgies.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{c.acte} ({c.annee})</p>
                  <p className="text-xs text-gray-500">{c.etablissement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {onglet === 'traitements' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Traitements en cours</h3>
            {TRAITEMENTS_EN_COURS.map((t, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{t.medicament}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{t.posologie}</p>
                    <p className="text-xs text-blue-600 mt-1">Indication : {t.indication}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{t.depuis}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Prescrit par {t.prescripteur}</p>
              </div>
            ))}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠️ Ne jamais arrêter ou modifier un traitement sans l&apos;accord de votre médecin.
            </div>
          </div>
        )}

        {onglet === 'examens' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Résultats d&apos;examens récents</h3>
            {EXAMENS_RECENTS.map((e, i) => (
              <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="text-xs text-gray-400 w-24 flex-shrink-0">
                  <p>{e.date}</p>
                  <span className="inline-block mt-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.type}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.examen}</p>
                  <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${STATUT_EXAMEN[e.statut]}`}>
                    {e.resultat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {onglet === 'vaccins' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Carnet de vaccination</h3>
            {VACCINS.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.vaccin}</p>
                  <p className="text-xs text-gray-500">{v.date}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  v.statut === 'Immunisée' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {v.statut}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pied de page sécurité */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🔒 Dossier médical confidentiel — Loi 18-07 sur la protection des données personnelles
        </p>
      </div>
    </div>
  );
}
