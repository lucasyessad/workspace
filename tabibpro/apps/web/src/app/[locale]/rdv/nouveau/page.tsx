// ============================================================
// TabibPro — Nouveau Rendez-vous
// Prise de RDV : patient, date, créneau, type, motif
// Avec rappel SMS/Email (Mobilis, Djezzy, Ooredoo)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeRdv = 'Consultation' | 'Suivi' | 'Urgence' | 'Bilan' | 'Téléconsultation';
type DureeRdv = 15 | 30 | 45 | 60;

const PATIENTS_SAMPLE = [
  { id: 'pat-001', nom: 'Amina Boulahia', telephone: '0551 23 45 67', email: 'amina@mail.dz' },
  { id: 'pat-002', nom: 'Karim Benali', telephone: '0771 98 76 54', email: 'karim@mail.dz' },
  { id: 'pat-003', nom: 'Fatima Zahra Hamidi', telephone: '0661 55 44 33', email: null },
  { id: 'pat-004', nom: 'Youcef Mebarki', telephone: '0550 11 22 33', email: 'youcef@mail.dz' },
  { id: 'pat-005', nom: 'Nadia Berkane', telephone: '0770 66 77 88', email: null },
];

const TYPE_INFO: Record<TypeRdv, { icon: string; couleur: string }> = {
  'Consultation': { icon: '🩺', couleur: 'border-blue-500 bg-blue-50 text-blue-800' },
  'Suivi': { icon: '📋', couleur: 'border-green-500 bg-green-50 text-green-700' },
  'Urgence': { icon: '🚨', couleur: 'border-red-500 bg-red-50 text-red-700' },
  'Bilan': { icon: '🔬', couleur: 'border-purple-500 bg-purple-50 text-purple-800' },
  'Téléconsultation': { icon: '💻', couleur: 'border-teal-500 bg-teal-50 text-teal-700' },
};

const DUREES: { val: DureeRdv; label: string }[] = [
  { val: 15, label: '15 min' },
  { val: 30, label: '30 min' },
  { val: 45, label: '45 min' },
  { val: 60, label: '1 heure' },
];

// Créneaux libres fictifs
const CRENEAUX_LIBRES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export default function NouveauRdvPage() {
  const [recherchePatient, setRecherchePatient] = useState('');
  const [patientSelectionne, setPatientSelectionne] = useState<typeof PATIENTS_SAMPLE[0] | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [type, setType] = useState<TypeRdv>('Consultation');
  const [duree, setDuree] = useState<DureeRdv>(30);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [creneau, setCreneau] = useState('');
  const [motif, setMotif] = useState('');
  const [rappelSms, setRappelSms] = useState(true);
  const [rappelEmail, setRappelEmail] = useState(false);
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

  if (soumis) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Rendez-vous enregistré</h2>
        <p className="text-sm text-gray-500">
          RDV pour <strong>{patientSelectionne?.nom}</strong> le{' '}
          <strong>{date}</strong> à <strong>{creneau}</strong>.
        </p>
        {rappelSms && patientSelectionne?.telephone && (
          <p className="text-xs text-green-600">📱 Rappel SMS envoyé au {patientSelectionne.telephone}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Link
            href="../agenda"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Voir l&apos;agenda
          </Link>
          <Link
            href="../rdv"
            className="border border-gray-300 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Liste des RDV
          </Link>
          <button
            onClick={() => setSoumis(false)}
            className="border border-blue-300 text-blue-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Nouveau RDV
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link href="../rdv" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-0.5">Planification d&apos;un rendez-vous patient</p>
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
                    <p className="text-xs text-gray-400">{p.telephone}</p>
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
                <p className="text-xs text-gray-500">{patientSelectionne.telephone}</p>
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

          <div>
            <Link
              href="../patients/nouveau"
              className="text-sm text-blue-600 hover:underline"
            >
              + Créer un nouveau patient
            </Link>
          </div>
        </div>

        {/* Type + Durée */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Type de rendez-vous</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {(Object.keys(TYPE_INFO) as TypeRdv[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  type === t ? TYPE_INFO[t].couleur : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xl mb-0.5">{TYPE_INFO[t].icon}</p>
                <p className="font-medium text-xs">{t}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durée estimée</label>
            <div className="flex gap-2">
              {DUREES.map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setDuree(d.val)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    duree === d.val
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date + Créneau */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Date et créneau</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => { setDate(e.target.value); setCreneau(''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Créneau disponible <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {CRENEAUX_LIBRES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCreneau(c)}
                  className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    creneau === c
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {!creneau && (
              <p className="text-xs text-gray-400 mt-2">Sélectionnez un créneau libre</p>
            )}
          </div>
        </div>

        {/* Motif */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Motif et notes</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de la consultation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Suivi hypertension, renouvellement ordonnance…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note interne <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Informations pour le praticien…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Rappels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Rappels automatiques</h2>
          <p className="text-xs text-gray-500">Envoyés 24h avant le rendez-vous</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rappelSms}
                onChange={(e) => setRappelSms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="text-sm text-gray-700 font-medium">📱 Rappel SMS</p>
                {patientSelectionne?.telephone && (
                  <p className="text-xs text-gray-400">Envoyé au {patientSelectionne.telephone}</p>
                )}
                {!patientSelectionne && (
                  <p className="text-xs text-gray-400">Compatibles : Mobilis, Djezzy, Ooredoo</p>
                )}
              </div>
            </label>
            <label className={`flex items-center gap-3 ${patientSelectionne?.email ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}>
              <input
                type="checkbox"
                checked={rappelEmail}
                disabled={!patientSelectionne?.email}
                onChange={(e) => setRappelEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="text-sm text-gray-700 font-medium">✉️ Rappel Email</p>
                {patientSelectionne?.email ? (
                  <p className="text-xs text-gray-400">{patientSelectionne.email}</p>
                ) : (
                  <p className="text-xs text-gray-400">Aucun email enregistré</p>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="../rdv"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!patientSelectionne || !creneau || !motif}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            📅 Confirmer le rendez-vous
          </button>
        </div>
      </form>
    </div>
  );
}
