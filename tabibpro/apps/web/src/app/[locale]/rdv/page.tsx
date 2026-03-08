// ============================================================
// TabibPro — Prise de rendez-vous (côté médecin)
// Création et gestion des rendez-vous patients
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeRDV = 'Générale' | 'Suivi' | 'Urgence' | 'Bilan' | 'Spécialisée';
type StatutRDV = 'Confirmé' | 'En attente' | 'Annulé' | 'Honoré';

interface RDV {
  id: string;
  patient: string;
  patientId: string;
  telephone: string;
  date: string;
  heure: string;
  duree: number; // minutes
  type: TypeRDV;
  motif: string;
  statut: StatutRDV;
  nouveau: boolean;
}

const RDV_LISTE: RDV[] = [
  {
    id: 'rdv-001',
    patient: 'Amina Boulahia',
    patientId: 'pat-001',
    telephone: '0555 12 34 56',
    date: '2026-03-06',
    heure: '09:00',
    duree: 30,
    type: 'Suivi',
    motif: 'Contrôle post-traitement angine',
    statut: 'Confirmé',
    nouveau: false,
  },
  {
    id: 'rdv-002',
    patient: 'Khaled Meziane',
    patientId: 'pat-020',
    telephone: '0661 98 76 54',
    date: '2026-03-06',
    heure: '09:30',
    duree: 30,
    type: 'Générale',
    motif: 'Douleurs lombaires chroniques',
    statut: 'Confirmé',
    nouveau: true,
  },
  {
    id: 'rdv-003',
    patient: 'Fatima Zerrouki',
    patientId: 'pat-003',
    telephone: '0770 23 45 67',
    date: '2026-03-06',
    heure: '10:30',
    duree: 60,
    type: 'Bilan',
    motif: 'Résultats analyse sanguine complète',
    statut: 'En attente',
    nouveau: false,
  },
  {
    id: 'rdv-004',
    patient: 'Rachid Aoun',
    patientId: 'pat-021',
    telephone: '0553 87 65 43',
    date: '2026-03-06',
    heure: '14:00',
    duree: 30,
    type: 'Générale',
    motif: 'Toux persistante, rhinite',
    statut: 'Confirmé',
    nouveau: true,
  },
  {
    id: 'rdv-005',
    patient: 'Nadia Hamidi',
    patientId: 'pat-005',
    telephone: '0771 34 56 78',
    date: '2026-03-07',
    heure: '09:00',
    duree: 30,
    type: 'Suivi',
    motif: 'Contrôle mensuel HTA',
    statut: 'Confirmé',
    nouveau: false,
  },
  {
    id: 'rdv-006',
    patient: 'Omar Benatia',
    patientId: 'pat-006',
    telephone: '0662 11 22 33',
    date: '2026-03-07',
    heure: '10:00',
    duree: 45,
    type: 'Spécialisée',
    motif: 'Avis dermatologie — psoriasis',
    statut: 'En attente',
    nouveau: false,
  },
];

const TYPE_COLORS: Record<TypeRDV, string> = {
  'Générale': 'bg-blue-500',
  'Suivi': 'bg-purple-500',
  'Urgence': 'bg-red-500',
  'Bilan': 'bg-amber-500',
  'Spécialisée': 'bg-teal-500',
};

const STATUT_STYLES: Record<StatutRDV, string> = {
  'Confirmé': 'bg-green-100 text-green-800',
  'En attente': 'bg-amber-100 text-amber-800',
  'Annulé': 'bg-gray-100 text-gray-500',
  'Honoré': 'bg-blue-100 text-blue-800',
};

const HEURES = Array.from({ length: 22 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export default function RDVPage() {
  const [vue, setVue] = useState<'liste' | 'nouveau'>('liste');
  const [dateFiltre, setDateFiltre] = useState('2026-03-06');
  const [form, setForm] = useState({
    patient: '',
    telephone: '',
    date: '',
    heure: '',
    duree: '30',
    type: 'Générale' as TypeRDV,
    motif: '',
    nouveau: true,
  });

  const rdvDuJour = RDV_LISTE.filter((r) => r.date === dateFiltre && r.statut !== 'Annulé');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: appel API
    setVue('liste');
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rendez-vous</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion du planning et des rendez-vous patients</p>
        </div>
        <div className="flex gap-3">
          <Link href="../agenda" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Voir l'agenda
          </Link>
          <button
            onClick={() => setVue(vue === 'liste' ? 'nouveau' : 'liste')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {vue === 'liste' ? '+ Nouveau RDV' : '← Retour liste'}
          </button>
        </div>
      </div>

      {vue === 'nouveau' ? (
        /* Formulaire nouveau RDV */
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Nouveau rendez-vous</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du patient <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.patient}
                  onChange={(e) => setForm({ ...form, patient: e.target.value })}
                  placeholder="Rechercher un patient…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="0555 XX XX XX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min="2026-03-05"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.heure}
                  onChange={(e) => setForm({ ...form, heure: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Heure --</option>
                  {HEURES.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                <select
                  value={form.duree}
                  onChange={(e) => setForm({ ...form, duree: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 heure</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de consultation</label>
              <div className="flex flex-wrap gap-2">
                {(['Générale', 'Suivi', 'Urgence', 'Bilan', 'Spécialisée'] as TypeRDV[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      form.type === t
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                placeholder="Décrivez brièvement le motif de la consultation…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="nouveau-patient"
                checked={form.nouveau}
                onChange={(e) => setForm({ ...form, nouveau: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="nouveau-patient" className="text-sm text-gray-700">
                Nouveau patient (première consultation)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVue('liste')}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Confirmer le RDV
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Sélecteur de date + stats du jour */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Jour :</label>
              <input
                type="date"
                value={dateFiltre}
                onChange={(e) => setDateFiltre(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <span className="text-sm text-gray-600">
                <strong>{rdvDuJour.length}</strong> RDV ce jour
              </span>
              <span className="text-sm text-gray-600">
                <strong>{rdvDuJour.filter((r) => r.nouveau).length}</strong> nouveaux patients
              </span>
            </div>
          </div>

          {/* Liste des RDV */}
          <div className="space-y-3">
            {rdvDuJour.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">📅</p>
                <p>Aucun rendez-vous ce jour</p>
              </div>
            ) : (
              rdvDuJour.map((rdv) => (
                <div key={rdv.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                  {/* Indicateur type */}
                  <div className={`w-1.5 h-16 rounded-full ${TYPE_COLORS[rdv.type]} flex-shrink-0`} />

                  {/* Heure */}
                  <div className="flex-shrink-0 text-center w-16">
                    <p className="text-lg font-bold text-gray-900">{rdv.heure}</p>
                    <p className="text-xs text-gray-400">{rdv.duree} min</p>
                  </div>

                  {/* Infos patient */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`./patients/${rdv.patientId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {rdv.patient}
                      </Link>
                      {rdv.nouveau && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Nouveau
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_STYLES[rdv.statut]}`}>
                        {rdv.statut}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 truncate">{rdv.motif}</p>
                    <p className="text-xs text-gray-400">{rdv.telephone} · {rdv.type}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    <button className="text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                      Démarrer
                    </button>
                    <button className="text-gray-400 hover:text-red-600 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
