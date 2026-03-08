// ============================================================
// TabibPro — Nouvelle Consultation
// Ouverture d'une fiche consultation : patient, motif, type
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeConsultation = 'Générale' | 'Urgence' | 'Suivi' | 'Pédiatrique' | 'Téléconsultation';

const PATIENTS_SAMPLE = [
  { id: 'pat-001', nom: 'Amina Boulahia', age: 37, sexe: 'F', cnas: '0X1234567890' },
  { id: 'pat-002', nom: 'Karim Benali', age: 35, sexe: 'M', cnas: '0X9876543210' },
  { id: 'pat-003', nom: 'Fatima Zahra Hamidi', age: 52, sexe: 'F', cnas: 'CASNOS-00441' },
  { id: 'pat-004', nom: 'Youcef Mebarki', age: 28, sexe: 'M', cnas: '0X5551230987' },
  { id: 'pat-005', nom: 'Nadia Berkane', age: 44, sexe: 'F', cnas: '0X4448765432' },
];

const MOTIFS_FREQUENTS = [
  'Fièvre',
  'Douleur abdominale',
  'Maux de tête',
  'Douleur thoracique',
  'Toux / dyspnée',
  'Contrôle tension artérielle',
  'Suivi diabète',
  'Renouvellement ordonnance',
  'Certificat médical',
  'Bilan de santé',
  'Consultation pré-opératoire',
  'Douleur dorsale',
];

const TYPE_INFO: Record<TypeConsultation, { icon: string; desc: string; couleur: string }> = {
  'Générale': { icon: '🩺', desc: 'Consultation standard', couleur: 'border-blue-500 bg-blue-50 text-blue-800' },
  'Urgence': { icon: '🚨', desc: 'Prise en charge urgente', couleur: 'border-red-500 bg-red-50 text-red-800' },
  'Suivi': { icon: '📋', desc: 'Contrôle maladie chronique', couleur: 'border-green-500 bg-green-50 text-green-700' },
  'Pédiatrique': { icon: '👶', desc: 'Patient < 16 ans', couleur: 'border-purple-500 bg-purple-50 text-purple-800' },
  'Téléconsultation': { icon: '💻', desc: 'Consultation à distance', couleur: 'border-teal-500 bg-teal-50 text-teal-700' },
};

export default function NouvelleConsultationPage() {
  const [recherchePatient, setRecherchePatient] = useState('');
  const [patientSelectionne, setPatientSelectionne] = useState<typeof PATIENTS_SAMPLE[0] | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [type, setType] = useState<TypeConsultation>('Générale');
  const [motif, setMotif] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [heure, setHeure] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${Math.ceil(now.getMinutes() / 15) * 15 === 60 ? '00' : (Math.ceil(now.getMinutes() / 15) * 15).toString().padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');
  const [soumis, setSoumis] = useState(false);

  const patientsFiltres = PATIENTS_SAMPLE.filter((p) =>
    p.nom.toLowerCase().includes(recherchePatient.toLowerCase())
  );

  function selectionnerPatient(p: typeof PATIENTS_SAMPLE[0]) {
    setPatientSelectionne(p);
    setRecherchePatient(p.nom);
    setDropdownVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSoumis(true);
  }

  // Créneaux horaires de 8h à 19h par pas de 15min
  const CRENEAUX: string[] = [];
  for (let h = 8; h < 19; h++) {
    for (const m of [0, 15, 30, 45]) {
      CRENEAUX.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  if (soumis) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Consultation ouverte</h2>
        <p className="text-gray-500 text-sm">
          La fiche de consultation pour <strong>{patientSelectionne?.nom}</strong> a été créée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="../consultations/cons-new"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ouvrir la consultation
          </Link>
          <Link
            href="../consultations"
            className="border border-gray-300 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link href="../consultations" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle consultation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ouverture d&apos;une fiche de consultation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Patient</h2>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher le patient <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={!patientSelectionne}
              value={recherchePatient}
              onChange={(e) => {
                setRecherchePatient(e.target.value);
                setPatientSelectionne(null);
                setDropdownVisible(true);
              }}
              onFocus={() => setDropdownVisible(true)}
              placeholder="Nom du patient…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dropdownVisible && recherchePatient.length >= 1 && patientsFiltres.length > 0 && !patientSelectionne && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                {patientsFiltres.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectionnerPatient(p)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-sm"
                  >
                    <p className="font-medium text-gray-900">{p.nom}</p>
                    <p className="text-xs text-gray-400">{p.age} ans · {p.sexe} · {p.cnas}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {patientSelectionne && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                {patientSelectionne.nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{patientSelectionne.nom}</p>
                <p className="text-xs text-gray-500">{patientSelectionne.age} ans · {patientSelectionne.cnas}</p>
              </div>
              <button
                type="button"
                onClick={() => { setPatientSelectionne(null); setRecherchePatient(''); }}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Changer
              </button>
            </div>
          )}
        </div>

        {/* Date + Heure */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Date et heure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure <span className="text-red-500">*</span></label>
              <select
                required
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CRENEAUX.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Type de consultation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Type de consultation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(TYPE_INFO) as TypeConsultation[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === t ? TYPE_INFO[t].couleur : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-lg mb-0.5">{TYPE_INFO[t].icon}</p>
                <p className="font-semibold text-sm">{t}</p>
                <p className="text-xs opacity-70">{TYPE_INFO[t].desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Motif */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Motif de consultation</h2>

          {/* Raccourcis motifs fréquents */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Motifs fréquents :</p>
            <div className="flex flex-wrap gap-2">
              {MOTIFS_FREQUENTS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMotif(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    motif === m
                      ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif détaillé <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Décrivez brièvement le motif de la venue du patient…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note initiale <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Observations préliminaires, contexte…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="../consultations"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!patientSelectionne || !motif}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            🩺 Ouvrir la consultation
          </button>
        </div>
      </form>
    </div>
  );
}
