// ============================================================
// TabibPro — Nouvelle Facture
// Facturation Algérienne : DZD, CNAS/CASNOS, Tiers-Payant
// Moyens de paiement : Espèces, CIB, Edahabia, BaridiMob, CCP
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type ModePaiement = 'Espèces' | 'CIB' | 'Edahabia' | 'BaridiMob' | 'CCP' | 'Chèque';
type Assurance = 'Aucune' | 'CNAS' | 'CASNOS' | 'Mutuelle';
type TypeActe = string;

const PATIENTS_SAMPLE = [
  { id: 'pat-001', nom: 'Amina Boulahia', telephone: '0551 23 45 67', cnas: '0X1234567890', assurance: 'CNAS' as Assurance },
  { id: 'pat-002', nom: 'Karim Benali', telephone: '0771 98 76 54', cnas: '0X9876543210', assurance: 'CNAS' as Assurance },
  { id: 'pat-003', nom: 'Fatima Zahra Hamidi', telephone: '0661 55 44 33', cnas: 'CASNOS-00441', assurance: 'CASNOS' as Assurance },
  { id: 'pat-004', nom: 'Youcef Mebarki', telephone: '0550 11 22 33', cnas: '—', assurance: 'Aucune' as Assurance },
  { id: 'pat-005', nom: 'Nadia Berkane', telephone: '0770 66 77 88', cnas: '0X4448765432', assurance: 'Mutuelle' as Assurance },
];

interface LigneActe {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaireDzd: number;
}

const ACTES_NOMENCLATURE = [
  { designation: 'Consultation médicale générale (C)', prix: 1000 },
  { designation: 'Consultation spécialisée (CS)', prix: 1500 },
  { designation: 'Consultation de nuit / urgence', prix: 2000 },
  { designation: 'Visite à domicile', prix: 1500 },
  { designation: 'Électrocardiogramme (ECG)', prix: 1200 },
  { designation: 'Certificat médical', prix: 500 },
  { designation: 'Certificat de repos (arrêt de travail)', prix: 500 },
  { designation: 'Vaccination — injection', prix: 300 },
  { designation: 'Injection intraveineuse', prix: 500 },
  { designation: 'Petite chirurgie — suture', prix: 2500 },
  { designation: 'Spirométrie', prix: 1500 },
  { designation: 'Échographie abdominale', prix: 3000 },
  { designation: 'Radiographie thoracique', prix: 2000 },
];

const PAIEMENTS: { val: ModePaiement; icon: string; label: string }[] = [
  { val: 'Espèces', icon: '💵', label: 'Espèces' },
  { val: 'CIB', icon: '💳', label: 'Carte CIB' },
  { val: 'Edahabia', icon: '📱', label: 'Edahabia' },
  { val: 'BaridiMob', icon: '📱', label: 'BaridiMob' },
  { val: 'CCP', icon: '🏦', label: 'CCP' },
  { val: 'Chèque', icon: '📄', label: 'Chèque' },
];

// Taux de remboursement CNAS/CASNOS par acte (simulés)
const TAUX_REMBOURSEMENT: Record<Assurance, number> = {
  'CNAS': 0.80,
  'CASNOS': 0.80,
  'Mutuelle': 0.60,
  'Aucune': 0,
};

function genId() {
  return `acte-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export default function NouvelleFacturePage() {
  const [recherchePatient, setRecherchePatient] = useState('');
  const [patientSelectionne, setPatientSelectionne] = useState<typeof PATIENTS_SAMPLE[0] | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [assurance, setAssurance] = useState<Assurance>('CNAS');
  const [tiersPayant, setTiersPayant] = useState(false);
  const [lignes, setLignes] = useState<LigneActe[]>([
    { id: genId(), designation: 'Consultation médicale générale (C)', quantite: 1, prixUnitaireDzd: 1000 },
  ]);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [rechercheActe, setRechercheActe] = useState<string | null>(null);
  const [soumis, setSoumis] = useState(false);

  const patientsFiltres = PATIENTS_SAMPLE.filter((p) =>
    p.nom.toLowerCase().includes(recherchePatient.toLowerCase())
  );

  function selectionnerPatient(p: typeof PATIENTS_SAMPLE[0]) {
    setPatientSelectionne(p);
    setRecherchePatient(p.nom);
    setAssurance(p.assurance);
    setDropdownVisible(false);
  }

  function updateLigne(id: string, champ: keyof LigneActe, val: string | number) {
    setLignes((prev) => prev.map((l) => (l.id === id ? { ...l, [champ]: val } : l)));
  }

  function supprimerLigne(id: string) {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((l) => l.id !== id));
  }

  function ajouterActe(acte: { designation: string; prix: number }, ligneId: string) {
    setLignes((prev) =>
      prev.map((l) =>
        l.id === ligneId ? { ...l, designation: acte.designation, prixUnitaireDzd: acte.prix } : l
      )
    );
    setRechercheActe(null);
  }

  const totalBrut = lignes.reduce((s, l) => s + l.prixUnitaireDzd * l.quantite, 0);
  const tauxRemb = TAUX_REMBOURSEMENT[assurance];
  const montantRemboursable = tiersPayant ? Math.round(totalBrut * tauxRemb) : 0;
  const montantPatient = totalBrut - montantRemboursable;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSoumis(true);
  }

  function formatDzd(n: number) {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(n);
  }

  if (soumis) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Facture créée</h2>
        <p className="text-sm text-gray-500">
          Facture de <strong>{formatDzd(montantPatient)}</strong> enregistrée pour{' '}
          <strong>{patientSelectionne?.nom || 'le patient'}</strong>.
        </p>
        {tiersPayant && (
          <p className="text-xs text-blue-600">
            Part {assurance} : {formatDzd(montantRemboursable)} · Patient : {formatDzd(montantPatient)}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            🖨️ Imprimer la quittance
          </button>
          <Link
            href="../facturation"
            className="border border-gray-300 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Retour facturation
          </Link>
          <button
            onClick={() => { setSoumis(false); setPatientSelectionne(null); setRecherchePatient(''); }}
            className="border border-blue-300 text-blue-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Nouvelle facture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link href="../facturation" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
          <p className="text-sm text-gray-500 mt-0.5">Facturation actes médicaux — Dinar Algérien (DZD)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Patient + date */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Patient et date</h2>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
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
              placeholder="Rechercher le patient…"
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
                    <p className="text-xs text-gray-400">{p.assurance} · {p.cnas}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {patientSelectionne && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{patientSelectionne.nom}</p>
                <p className="text-xs text-gray-500">{patientSelectionne.assurance} · N° {patientSelectionne.cnas}</p>
              </div>
              <button type="button" onClick={() => { setPatientSelectionne(null); setRecherchePatient(''); }} className="text-xs text-gray-400 hover:text-gray-600">
                Changer
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de facturation</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Couverture sociale */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Couverture sociale</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Aucune', 'CNAS', 'CASNOS', 'Mutuelle'] as Assurance[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAssurance(a); if (a === 'Aucune') setTiersPayant(false); }}
                className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                  assurance === a
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {(assurance === 'CNAS' || assurance === 'CASNOS') && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tiersPayant}
                onChange={(e) => setTiersPayant(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Tiers-payant {assurance}</p>
                <p className="text-xs text-gray-500">Le patient ne paie que le ticket modérateur ({Math.round((1 - tauxRemb) * 100)}%)</p>
              </div>
            </label>
          )}
        </div>

        {/* Actes médicaux */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Actes médicaux</h2>
          </div>

          {lignes.map((ligne, idx) => (
            <div key={ligne.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Acte {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => supprimerLigne(ligne.id)}
                  disabled={lignes.length <= 1}
                  className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-30"
                >
                  Supprimer
                </button>
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">Désignation <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={ligne.designation}
                  onChange={(e) => {
                    updateLigne(ligne.id, 'designation', e.target.value);
                    setRechercheActe(ligne.id);
                  }}
                  onFocus={() => setRechercheActe(ligne.id)}
                  placeholder="Ex: Consultation médicale générale…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {rechercheActe === ligne.id && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {ACTES_NOMENCLATURE.filter((a) =>
                      a.designation.toLowerCase().includes(ligne.designation.toLowerCase())
                    ).map((a) => (
                      <button
                        key={a.designation}
                        type="button"
                        onClick={() => ajouterActe(a, ligne.id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-sm flex justify-between"
                      >
                        <span>{a.designation}</span>
                        <span className="text-gray-400 text-xs">{formatDzd(a.prix)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantité</label>
                  <input
                    type="number"
                    min="1"
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(ligne.id, 'quantite', parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix unitaire (DZD)</label>
                  <input
                    type="number"
                    min="0"
                    value={ligne.prixUnitaireDzd}
                    onChange={(e) => updateLigne(ligne.id, 'prixUnitaireDzd', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sous-total</label>
                  <p className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                    {formatDzd(ligne.quantite * ligne.prixUnitaireDzd)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setLignes((prev) => [...prev, { id: genId(), designation: '', quantite: 1, prixUnitaireDzd: 1000 }])}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Ajouter un acte
          </button>
        </div>

        {/* Récapitulatif financier */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Récapitulatif</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total brut</span>
              <span className="font-medium">{formatDzd(totalBrut)}</span>
            </div>
            {tiersPayant && (
              <>
                <div className="flex justify-between text-blue-600">
                  <span>Part {assurance} ({Math.round(tauxRemb * 100)}%)</span>
                  <span className="font-medium">− {formatDzd(montantRemboursable)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-lg">
                  <span>À encaisser (patient)</span>
                  <span className="text-gray-900">{formatDzd(montantPatient)}</span>
                </div>
              </>
            )}
            {!tiersPayant && (
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-lg">
                <span>Total à encaisser</span>
                <span className="text-gray-900">{formatDzd(totalBrut)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Mode de paiement</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {PAIEMENTS.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setModePaiement(p.val)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  modePaiement === p.val
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xl mb-0.5">{p.icon}</p>
                <p className="text-xs font-medium">{p.label}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Référence virement, numéro chèque…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Feuille de soins CNAS */}
        {(assurance === 'CNAS' || assurance === 'CASNOS') && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">📋 Feuille de soins {assurance}</p>
            <p className="text-xs text-blue-600">
              Une feuille de soins {assurance} sera générée automatiquement avec la facture.
              Assurez-vous d&apos;avoir vérifié le numéro d&apos;immatriculation du patient.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="../facturation"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!patientSelectionne || lignes.some((l) => !l.designation)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            💰 Valider et encaisser
          </button>
        </div>
      </form>
    </div>
  );
}
