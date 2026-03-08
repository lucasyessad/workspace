// ============================================================
// TabibPro — Prise de rendez-vous (portail patient)
// Réservation en ligne avec le médecin traitant
// ============================================================

'use client';

import { useState } from 'react';

type EtapeRDV = 'motif' | 'creneau' | 'confirmation' | 'succes';
type TypeConsultation = 'Générale' | 'Suivi' | 'Urgence' | 'Bilan';

const JOURS_DISPONIBLES = [
  { date: '2026-03-09', jour: 'Lundi 9 mars', creneaux: ['09:00', '10:00', '14:00', '15:30'] },
  { date: '2026-03-10', jour: 'Mardi 10 mars', creneaux: ['08:30', '11:00', '16:00'] },
  { date: '2026-03-11', jour: 'Mercredi 11 mars', creneaux: ['09:00', '09:30', '10:30'] },
  { date: '2026-03-12', jour: 'Jeudi 12 mars', creneaux: ['14:00', '14:30', '15:00', '16:30'] },
  { date: '2026-03-16', jour: 'Lundi 16 mars', creneaux: ['08:30', '10:00', '11:00', '15:00'] },
];

export default function RDVPatientPage() {
  const [etape, setEtape] = useState<EtapeRDV>('motif');
  const [type, setType] = useState<TypeConsultation>('Générale');
  const [motif, setMotif] = useState('');
  const [jourSelectionne, setJourSelectionne] = useState<typeof JOURS_DISPONIBLES[0] | null>(null);
  const [heureSelectionnee, setHeureSelectionnee] = useState('');
  const [chargement, setChargement] = useState(false);

  function confirmerRDV() {
    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      setEtape('succes');
    }, 1200);
  }

  const TYPE_INFO: Record<TypeConsultation, { desc: string; icon: string; duree: string }> = {
    'Générale': { desc: 'Consultation pour un problème de santé général', icon: '🩺', duree: '30 min' },
    'Suivi': { desc: 'Suivi d\'un traitement ou pathologie chronique', icon: '📋', duree: '20 min' },
    'Urgence': { desc: 'Situation médicale nécessitant une attention rapide', icon: '🚨', duree: '30 min' },
    'Bilan': { desc: 'Bilan de santé complet ou résultats d\'analyses', icon: '🔬', duree: '45 min' },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prendre un rendez-vous</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cabinet de Dr. Ahmed Benaissa — Médecin généraliste
        </p>
      </div>

      {/* Indicateur d'étapes */}
      {etape !== 'succes' && (
        <div className="flex items-center gap-2">
          {(['motif', 'creneau', 'confirmation'] as EtapeRDV[]).map((e, i) => (
            <div key={e} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                etape === e
                  ? 'bg-emerald-600 text-white'
                  : ['creneau', 'confirmation'].indexOf(etape) > ['creneau', 'confirmation'].indexOf(e)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${etape === e ? 'text-emerald-700' : 'text-gray-400'}`}>
                {e === 'motif' ? 'Motif' : e === 'creneau' ? 'Créneau' : 'Confirmation'}
              </span>
              {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 w-8" />}
            </div>
          ))}
        </div>
      )}

      {/* Étape 1 — Motif */}
      {etape === 'motif' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Quel est le motif de votre consultation ?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(TYPE_INFO) as TypeConsultation[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  type === t
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{TYPE_INFO[t].icon}</span>
                  <span className="text-xs text-gray-400">{TYPE_INFO[t].duree}</span>
                </div>
                <p className="font-medium text-gray-900">{t}</p>
                <p className="text-xs text-gray-500 mt-0.5">{TYPE_INFO[t].desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Décrivez brièvement votre problème <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Douleur à la gorge depuis 3 jours, fièvre modérée…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {type === 'Urgence' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-800">⚠️ En cas d&apos;urgence vitale</p>
              <p className="text-sm text-red-600 mt-1">
                Appelez le <strong>15 (SAMU)</strong> ou le <strong>14 (Protection Civile)</strong> immédiatement.
              </p>
            </div>
          )}

          <button
            onClick={() => setEtape('creneau')}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Choisir un créneau →
          </button>
        </div>
      )}

      {/* Étape 2 — Créneau */}
      {etape === 'creneau' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Choisissez un créneau disponible</h2>
            <button onClick={() => setEtape('motif')} className="text-sm text-gray-500 hover:text-gray-700">
              ← Retour
            </button>
          </div>

          <div className="space-y-4">
            {JOURS_DISPONIBLES.map((jour) => (
              <div key={jour.date}>
                <p className="text-sm font-medium text-gray-700 mb-2">{jour.jour}</p>
                <div className="flex flex-wrap gap-2">
                  {jour.creneaux.map((heure) => (
                    <button
                      key={`${jour.date}-${heure}`}
                      onClick={() => {
                        setJourSelectionne(jour);
                        setHeureSelectionnee(heure);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        jourSelectionne?.date === jour.date && heureSelectionnee === heure
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      {heure}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setEtape('confirmation')}
            disabled={!jourSelectionne || !heureSelectionnee}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmer le créneau →
          </button>
        </div>
      )}

      {/* Étape 3 — Confirmation */}
      {etape === 'confirmation' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Récapitulatif du rendez-vous</h2>
            <button onClick={() => setEtape('creneau')} className="text-sm text-gray-500 hover:text-gray-700">
              ← Modifier
            </button>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xl">🩺</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dr. Ahmed Benaissa</p>
                <p className="text-sm text-gray-500">Médecin généraliste</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{jourSelectionne?.jour}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Heure</p>
                <p className="font-medium text-gray-900">{heureSelectionnee}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Durée estimée</p>
                <p className="font-medium text-gray-900">{TYPE_INFO[type].duree}</p>
              </div>
            </div>

            {motif && (
              <div className="pt-2 border-t border-emerald-100">
                <p className="text-xs text-gray-500">Motif</p>
                <p className="text-sm text-gray-700 mt-0.5">{motif}</p>
              </div>
            )}

            <div className="pt-2 border-t border-emerald-100">
              <p className="text-xs text-gray-500">Adresse du cabinet</p>
              <p className="text-sm text-gray-700">14 rue Didouche Mourad, Alger Centre</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span>📱</span>
            <p>Un SMS de confirmation vous sera envoyé sur votre numéro enregistré.</p>
          </div>

          <button
            onClick={confirmerRDV}
            disabled={chargement}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {chargement ? 'Réservation en cours…' : 'Confirmer le rendez-vous ✓'}
          </button>
        </div>
      )}

      {/* Étape 4 — Succès */}
      {etape === 'succes' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
          <div className="text-6xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Rendez-vous confirmé !</h2>
          <p className="text-gray-500">
            Votre rendez-vous avec Dr. Benaissa le{' '}
            <strong>{jourSelectionne?.jour}</strong> à <strong>{heureSelectionnee}</strong> a bien été enregistré.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm text-gray-700">
              📍 14 rue Didouche Mourad, Alger Centre
            </p>
            <p className="text-sm text-gray-700">
              📱 Un rappel SMS vous sera envoyé 24h avant
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="../mes-rdv"
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Voir mes RDV
            </a>
            <a
              href="../"
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Accueil
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
