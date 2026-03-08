// ============================================================
// TabibPro — Nouvelle Ordonnance
// Formulaire complet de création d'ordonnance médicale
// Types : Standard | Bizone | Chronique | Stupéfiant
// Conforme Pharmacopée DZ + Tiers-Payant CNAS/CASNOS
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeOrdonnance = 'Standard' | 'Bizone' | 'Chronique' | 'Stupéfiant';
type Assurance = 'Aucune' | 'CNAS' | 'CASNOS' | 'Mutuelle';

interface LigneMedicament {
  id: string;
  nom: string;
  dosage: string;
  forme: string;
  posologieMatin: string;
  posologieMidi: string;
  posologieSoir: string;
  posologieCoucher: string;
  duree: string;
  quantite: string;
  instructions: string;
  substituable: boolean;
  remboursable: boolean;
}

const MEDICAMENTS_SAMPLE = [
  { nom: 'Amoxicilline 500mg', dosage: '500mg', forme: 'Gélules' },
  { nom: 'Amoxicilline 1g', dosage: '1g', forme: 'Comprimés' },
  { nom: 'Ibuprofène 400mg', dosage: '400mg', forme: 'Comprimés' },
  { nom: 'Paracétamol 1g', dosage: '1g', forme: 'Comprimés' },
  { nom: 'Amlodipine 5mg', dosage: '5mg', forme: 'Comprimés' },
  { nom: 'Metformine 500mg', dosage: '500mg', forme: 'Comprimés' },
  { nom: 'Metformine 850mg', dosage: '850mg', forme: 'Comprimés' },
  { nom: 'Oméprazole 20mg', dosage: '20mg', forme: 'Gélules' },
  { nom: 'Cétirizine 10mg', dosage: '10mg', forme: 'Comprimés' },
  { nom: 'Salbutamol 100µg', dosage: '100µg', forme: 'Spray inhalateur' },
  { nom: 'Atorvastatine 20mg', dosage: '20mg', forme: 'Comprimés' },
  { nom: 'Lisinopril 5mg', dosage: '5mg', forme: 'Comprimés' },
  { nom: 'Tramadol 50mg', dosage: '50mg', forme: 'Gélules' },
  { nom: 'Codéine 30mg + Paracétamol 500mg', dosage: '30mg/500mg', forme: 'Comprimés' },
  { nom: 'Azithromycine 250mg', dosage: '250mg', forme: 'Gélules' },
];

const DUREES = ['3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '1 mois', '2 mois', '3 mois', '6 mois', '1 an', 'Indéfinie'];
const FORMES = ['Comprimés', 'Gélules', 'Sirop', 'Spray inhalateur', 'Crème', 'Pommade', 'Collyre', 'Gouttes', 'Injectable', 'Suppositoires', 'Patch'];

function genId() {
  return `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nouvelleLigne(): LigneMedicament {
  return {
    id: genId(),
    nom: '',
    dosage: '',
    forme: 'Comprimés',
    posologieMatin: '',
    posologieMidi: '',
    posologieSoir: '',
    posologieCoucher: '',
    duree: '7 jours',
    quantite: '',
    instructions: '',
    substituable: true,
    remboursable: true,
  };
}

export default function NouvelleOrdonnancePage() {
  const [type, setType] = useState<TypeOrdonnance>('Standard');
  const [patient, setPatient] = useState('');
  const [assurance, setAssurance] = useState<Assurance>('CNAS');
  const [tiersPayant, setTiersPayant] = useState(false);
  const [lignes, setLignes] = useState<LigneMedicament[]>([nouvelleLigne()]);
  const [commentaire, setCommentaire] = useState('');
  const [rechercheOuverte, setRechercheOuverte] = useState<string | null>(null);
  const [rechercheMed, setRechercheMed] = useState('');
  const [statut, setStatut] = useState<'brouillon' | 'valider'>('valider');

  const medicamentsFiltres = MEDICAMENTS_SAMPLE.filter((m) =>
    m.nom.toLowerCase().includes(rechercheMed.toLowerCase())
  );

  function updateLigne(id: string, champ: keyof LigneMedicament, valeur: string | boolean) {
    setLignes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l))
    );
  }

  function supprimerLigne(id: string) {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((l) => l.id !== id));
  }

  function selectionnerMedicament(ligneId: string, med: typeof MEDICAMENTS_SAMPLE[0]) {
    setLignes((prev) =>
      prev.map((l) =>
        l.id === ligneId
          ? { ...l, nom: med.nom, dosage: med.dosage, forme: med.forme }
          : l
      )
    );
    setRechercheOuverte(null);
    setRechercheMed('');
  }

  function handleSubmit(e: React.FormEvent, action: 'brouillon' | 'valider') {
    e.preventDefault();
    setStatut(action);
    // TODO: appel API
    console.log('Ordonnance soumise', { type, patient, assurance, tiersPayant, lignes, action });
  }

  const TYPE_INFO: Record<TypeOrdonnance, { desc: string; couleur: string }> = {
    'Standard': { desc: 'Médicaments courants', couleur: 'border-blue-500 bg-blue-50 text-blue-800' },
    'Bizone': { desc: 'Affection longue durée (ALD)', couleur: 'border-purple-500 bg-purple-50 text-purple-800' },
    'Chronique': { desc: 'Traitement au long cours — renouvellement', couleur: 'border-teal-500 bg-teal-50 text-teal-800' },
    'Stupéfiant': { desc: 'Médicaments à prescription spéciale', couleur: 'border-red-500 bg-red-50 text-red-800' },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="../ordonnances" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle ordonnance</h1>
            <p className="text-sm text-gray-500 mt-0.5">Rédaction et signature électronique</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, statut)} className="space-y-6">
        {/* Section 1 — Type + Patient */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Informations générales</h2>

          {/* Type d'ordonnance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d&apos;ordonnance</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(TYPE_INFO) as TypeOrdonnance[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    type === t ? TYPE_INFO[t].couleur : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">{t}</p>
                  <p className="text-xs opacity-70 mt-0.5">{TYPE_INFO[t].desc}</p>
                </button>
              ))}
            </div>
          </div>

          {type === 'Stupéfiant' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              ⚠️ <strong>Ordonnance sécurisée obligatoire</strong> — Numérotation préremplie requise. Rédaction manuscrite partielle exigée par la réglementation algérienne.
            </div>
          )}

          {/* Patient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
                placeholder="Rechercher un patient…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couverture sociale</label>
              <select
                value={assurance}
                onChange={(e) => setAssurance(e.target.value as Assurance)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Aucune">Aucune (paiement direct)</option>
                <option value="CNAS">CNAS (salarié)</option>
                <option value="CASNOS">CASNOS (non-salarié)</option>
                <option value="Mutuelle">Mutuelle / Autre</option>
              </select>
            </div>
          </div>

          {(assurance === 'CNAS' || assurance === 'CASNOS') && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tiers-payant"
                checked={tiersPayant}
                onChange={(e) => setTiersPayant(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="tiers-payant" className="text-sm text-gray-700">
                Tiers-payant — Le patient ne paie que le ticket modérateur
              </label>
            </div>
          )}
        </div>

        {/* Section 2 — Médicaments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Médicaments
              <span className="ml-2 text-xs font-normal text-gray-400">({lignes.length} ligne{lignes.length > 1 ? 's' : ''})</span>
            </h2>
          </div>

          {lignes.map((ligne, idx) => (
            <div key={ligne.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
              {/* En-tête ligne */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Médicament {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => supprimerLigne(ligne.id)}
                  disabled={lignes.length <= 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 text-sm"
                >
                  Supprimer
                </button>
              </div>

              {/* Nom du médicament avec autocomplete */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nom du médicament <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ligne.nom}
                  onChange={(e) => {
                    updateLigne(ligne.id, 'nom', e.target.value);
                    setRechercheMed(e.target.value);
                    setRechercheOuverte(ligne.id);
                  }}
                  onFocus={() => {
                    setRechercheOuverte(ligne.id);
                    setRechercheMed(ligne.nom);
                  }}
                  placeholder="Ex: Amoxicilline 500mg"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {rechercheOuverte === ligne.id && rechercheMed.length >= 2 && medicamentsFiltres.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {medicamentsFiltres.slice(0, 8).map((med) => (
                      <button
                        key={med.nom}
                        type="button"
                        onClick={() => selectionnerMedicament(ligne.id, med)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
                      >
                        <p className="font-medium text-gray-900">{med.nom}</p>
                        <p className="text-xs text-gray-400">{med.forme}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage + Forme */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={ligne.dosage}
                    onChange={(e) => updateLigne(ligne.id, 'dosage', e.target.value)}
                    placeholder="Ex: 500mg"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Forme galénique</label>
                  <select
                    value={ligne.forme}
                    onChange={(e) => updateLigne(ligne.id, 'forme', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FORMES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Posologie */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Posologie <span className="text-gray-400">(nombre de prises)</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'posologieMatin', label: 'Matin' },
                    { key: 'posologieMidi', label: 'Midi' },
                    { key: 'posologieSoir', label: 'Soir' },
                    { key: 'posologieCoucher', label: 'Coucher' },
                  ].map((p) => (
                    <div key={p.key}>
                      <label className="block text-xs text-gray-500 mb-1 text-center">{p.label}</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={ligne[p.key as keyof LigneMedicament] as string}
                        onChange={(e) => updateLigne(ligne.id, p.key as keyof LigneMedicament, e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Durée + Quantité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Durée du traitement</label>
                  <select
                    value={ligne.duree}
                    onChange={(e) => updateLigne(ligne.id, 'duree', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DUREES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantité à délivrer</label>
                  <input
                    type="text"
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(ligne.id, 'quantite', e.target.value)}
                    placeholder="Ex: 2 boîtes"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Instructions particulières <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={ligne.instructions}
                  onChange={(e) => updateLigne(ligne.id, 'instructions', e.target.value)}
                  placeholder="Ex: À prendre au cours des repas, ne pas écraser"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ligne.substituable}
                    onChange={(e) => updateLigne(ligne.id, 'substituable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs text-gray-600">Substituable par le pharmacien</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ligne.remboursable}
                    onChange={(e) => updateLigne(ligne.id, 'remboursable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs text-gray-600">Remboursable (liste positive)</span>
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setLignes((prev) => [...prev, nouvelleLigne()])}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Ajouter un médicament
          </button>
        </div>

        {/* Section 3 — Commentaire */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Commentaire pour le pharmacien</h2>
          <textarea
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Instructions particulières, remarques spéciales pour le pharmacien…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Section 4 — Aperçu et actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Récapitulatif</h2>
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2 mb-5">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">{type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Patient</span>
              <span className="font-medium">{patient || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Médicaments</span>
              <span className="font-medium">{lignes.filter((l) => l.nom).length} prescrit(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assurance</span>
              <span className="font-medium">{assurance}{tiersPayant ? ' — Tiers-payant' : ''}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              onClick={() => setStatut('brouillon')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Enregistrer en brouillon
            </button>
            <button
              type="submit"
              onClick={() => setStatut('valider')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Valider et signer ✓
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            La validation génère un PDF signé électroniquement avec le cachet du médecin
          </p>
        </div>
      </form>
    </div>
  );
}
