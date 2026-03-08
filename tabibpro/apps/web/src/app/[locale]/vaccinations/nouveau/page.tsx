// ============================================================
// TabibPro — Enregistrer une vaccination
// Programme élargi de vaccination (PEV Algérie)
// Calendrier MSPRH + vaccins voyageurs
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

const PATIENTS_SAMPLE = [
  { id: 'pat-001', nom: 'Amina Boulahia', age: 37, dateNaissance: '15/06/1988', sexe: 'F' },
  { id: 'pat-002', nom: 'Karim Benali', age: 35, dateNaissance: '22/03/1990', sexe: 'M' },
  { id: 'pat-003', nom: 'Fatima Zahra Hamidi', age: 52, dateNaissance: '07/11/1973', sexe: 'F' },
  { id: 'pat-004', nom: 'Youcef Mebarki', age: 28, dateNaissance: '14/09/1997', sexe: 'M' },
  { id: 'pat-005', nom: 'Nadia Berkane', age: 44, dateNaissance: '30/01/1982', sexe: 'F' },
];

interface VaccinPEV {
  nom: string;
  abreviation: string;
  categorie: string;
  maladie: string;
  rappel: string;
}

const VACCINS_PEV: VaccinPEV[] = [
  // PEV nourrissons
  { nom: 'BCG (Bacille de Calmette et Guérin)', abreviation: 'BCG', categorie: 'PEV Nourrissons', maladie: 'Tuberculose', rappel: 'Dose unique à la naissance' },
  { nom: 'Vaccin Anti-Poliomyélite oral', abreviation: 'VPO', categorie: 'PEV Nourrissons', maladie: 'Poliomyélite', rappel: 'Rappels à 2, 4, 6 mois + 18 mois' },
  { nom: 'DTC + Hep B + Hib (Pentavalent)', abreviation: 'DTCP-Hib-HB', categorie: 'PEV Nourrissons', maladie: 'Diphtérie/Tétanos/Coqueluche/Hépatite B/Hib', rappel: 'À 2, 4, 6 mois' },
  { nom: 'Vaccin Anti-Rougeoleux (RR)', abreviation: 'RR', categorie: 'PEV Nourrissons', maladie: 'Rougeole/Rubéole', rappel: 'À 12 mois + rappel 18 mois' },
  // Adultes / Femme enceinte
  { nom: 'DT (Diphtérie-Tétanos adulte)', abreviation: 'DT', categorie: 'Adulte', maladie: 'Diphtérie/Tétanos', rappel: 'Rappel tous les 10 ans' },
  { nom: 'Vaccin Tétanique', abreviation: 'VAT', categorie: 'Femme enceinte', maladie: 'Tétanos néonatal', rappel: '2 doses + rappel pour femme enceinte' },
  { nom: 'Vaccin Anti-Hépatite B', abreviation: 'Hep B', categorie: 'Adulte', maladie: 'Hépatite B', rappel: '3 doses (0, 1, 6 mois)' },
  { nom: 'Vaccin Anti-Grippe (saisonnier)', abreviation: 'Grippe', categorie: 'Saisonnier', maladie: 'Grippe saisonnière', rappel: 'Annuel (octobre-novembre)' },
  // Voyages / Hajj
  { nom: 'Vaccin Méningococcique ACYW135', abreviation: 'Mening', categorie: 'Hajj/Omra', maladie: 'Méningite méningococcique', rappel: 'Obligatoire Hajj/Omra' },
  { nom: 'Vaccin Anti-Typhoïde', abreviation: 'Typhoid', categorie: 'Voyageurs', maladie: 'Typhoïde', rappel: 'Rappel tous les 3 ans' },
  { nom: 'Vaccin Anti-Fièvre Jaune', abreviation: 'FJ', categorie: 'Voyageurs', maladie: 'Fièvre jaune', rappel: 'Dose unique — valable à vie' },
  { nom: 'Vaccin Anti-Hépatite A', abreviation: 'Hep A', categorie: 'Voyageurs', maladie: 'Hépatite A', rappel: '2 doses (0, 6 mois)' },
  { nom: 'Vaccin Pneumococcique (PCV13)', abreviation: 'PCV', categorie: 'Personnes âgées', maladie: 'Pneumonie à pneumocoque', rappel: 'Recommandé > 65 ans' },
  { nom: 'Vaccin Anti-COVID-19', abreviation: 'COVID', categorie: 'COVID-19', maladie: 'COVID-19', rappel: 'Selon schéma en vigueur' },
];

const SITES_INJECTION = [
  'Deltoïde gauche (bras)',
  'Deltoïde droit (bras)',
  'Cuisse gauche (face antéro-latérale)',
  'Cuisse droite (face antéro-latérale)',
  'Fesse gauche (quadrant supéro-externe)',
  'Fesse droite (quadrant supéro-externe)',
  'Intraderme — avant-bras gauche (BCG)',
  'Intraderme — avant-bras droit (BCG)',
  'Oral (polio)',
];

const VOIES_ADMIN = ['Intramusculaire (IM)', 'Sous-cutané (SC)', 'Intradermique (ID)', 'Oral', 'Intranasale'];

const CATEGORIES = Array.from(new Set(VACCINS_PEV.map((v) => v.categorie)));

export default function NouvelleVaccinationPage() {
  const [recherchePatient, setRecherchePatient] = useState('');
  const [patientSelectionne, setPatientSelectionne] = useState<typeof PATIENTS_SAMPLE[0] | null>(null);
  const [dropdownPatient, setDropdownPatient] = useState(false);
  const [vaccin, setVaccin] = useState<VaccinPEV | null>(null);
  const [rechercheVaccin, setRechercheVaccin] = useState('');
  const [dropdownVaccin, setDropdownVaccin] = useState(false);
  const [categorieFiltree, setCategorieFiltree] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lot, setLot] = useState('');
  const [fabricant, setFabricant] = useState('');
  const [site, setSite] = useState(SITES_INJECTION[0]);
  const [voie, setVoie] = useState(VOIES_ADMIN[0]);
  const [rappelPrevu, setRappelPrevu] = useState('');
  const [note, setNote] = useState('');
  const [reactionPost, setReactionPost] = useState('Aucune');
  const [soumis, setSoumis] = useState(false);

  const patientsFiltres = PATIENTS_SAMPLE.filter((p) =>
    p.nom.toLowerCase().includes(recherchePatient.toLowerCase())
  );

  const vaccinsFiltres = VACCINS_PEV.filter(
    (v) =>
      (v.nom.toLowerCase().includes(rechercheVaccin.toLowerCase()) ||
        v.abreviation.toLowerCase().includes(rechercheVaccin.toLowerCase()) ||
        v.maladie.toLowerCase().includes(rechercheVaccin.toLowerCase())) &&
      (!categorieFiltree || v.categorie === categorieFiltree)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSoumis(true);
  }

  if (soumis) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">💉</div>
        <h2 className="text-xl font-bold text-gray-900">Vaccination enregistrée</h2>
        <p className="text-sm text-gray-500">
          <strong>{vaccin?.abreviation}</strong> administré à{' '}
          <strong>{patientSelectionne?.nom}</strong> le <strong>{date}</strong>.
        </p>
        {rappelPrevu && (
          <p className="text-xs text-blue-600">📅 Prochain rappel prévu le : <strong>{rappelPrevu}</strong></p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="../vaccinations"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Voir le carnet vaccinal
          </Link>
          <button
            onClick={() => { setSoumis(false); setVaccin(null); setRechercheVaccin(''); setLot(''); }}
            className="border border-blue-300 text-blue-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Nouvelle vaccination
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link href="../vaccinations" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enregistrer une vaccination</h1>
          <p className="text-sm text-gray-500 mt-0.5">Programme élargi de vaccination — Algérie (MSPRH)</p>
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
              onChange={(e) => { setRecherchePatient(e.target.value); setPatientSelectionne(null); setDropdownPatient(true); }}
              onFocus={() => setDropdownPatient(true)}
              placeholder="Nom du patient…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dropdownPatient && recherchePatient.length >= 1 && patientsFiltres.length > 0 && !patientSelectionne && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                {patientsFiltres.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPatientSelectionne(p); setRecherchePatient(p.nom); setDropdownPatient(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-sm"
                  >
                    <p className="font-medium text-gray-900">{p.nom}</p>
                    <p className="text-xs text-gray-400">Né(e) le {p.dateNaissance} · {p.age} ans</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {patientSelectionne && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{patientSelectionne.nom}</p>
                <p className="text-xs text-gray-500">Né(e) le {patientSelectionne.dateNaissance} · {patientSelectionne.age} ans · {patientSelectionne.sexe}</p>
              </div>
              <button type="button" onClick={() => { setPatientSelectionne(null); setRecherchePatient(''); }} className="text-xs text-gray-400 hover:text-gray-600">
                Changer
              </button>
            </div>
          )}
        </div>

        {/* Vaccin */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Vaccin administré</h2>

          {/* Filtre catégorie */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategorieFiltree('')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                !categorieFiltree ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              Tous
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategorieFiltree(cat === categorieFiltree ? '' : cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  categorieFiltree === cat ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={vaccin ? vaccin.nom : rechercheVaccin}
              onChange={(e) => { setRechercheVaccin(e.target.value); setVaccin(null); setDropdownVaccin(true); }}
              onFocus={() => setDropdownVaccin(true)}
              placeholder="Rechercher un vaccin…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dropdownVaccin && !vaccin && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {vaccinsFiltres.map((v) => (
                  <button
                    key={v.abreviation}
                    type="button"
                    onClick={() => { setVaccin(v); setDropdownVaccin(false); setRechercheVaccin(''); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {v.abreviation}
                      </span>
                      <span className="font-medium text-gray-900">{v.maladie}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{v.nom}</p>
                    <p className="text-xs text-gray-400">{v.categorie} · {v.rappel}</p>
                  </button>
                ))}
                {vaccinsFiltres.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-400">Aucun vaccin trouvé</p>
                )}
              </div>
            )}
          </div>

          {vaccin && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-900">{vaccin.maladie}</p>
                  <p className="text-xs text-green-700">{vaccin.nom}</p>
                  <p className="text-xs text-green-600 mt-1">💉 {vaccin.rappel}</p>
                </div>
                <button type="button" onClick={() => setVaccin(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  Changer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Administration */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Administration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d&apos;administration <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voie d&apos;administration</label>
              <select
                value={voie}
                onChange={(e) => setVoie(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {VOIES_ADMIN.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site d&apos;injection</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SITES_INJECTION.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° de lot</label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="Ex: B2025-0441"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricant</label>
              <input
                type="text"
                value={fabricant}
                onChange={(e) => setFabricant(e.target.value)}
                placeholder="Ex: Sanofi, GSK, Sinovac…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du prochain rappel</label>
              <input
                type="date"
                value={rappelPrevu}
                min={date}
                onChange={(e) => setRappelPrevu(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Réaction post-vaccinale + notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Suivi post-vaccinal</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Réaction immédiate observée</label>
            <div className="flex flex-wrap gap-2">
              {['Aucune', 'Douleur locale légère', 'Rougeur au site', 'Oedème local', 'Fièvre légère', 'Malaise / choc anaphylactique'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReactionPost(r)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    reactionPost === r
                      ? r === 'Aucune'
                        ? 'bg-green-100 border-green-400 text-green-700 font-medium'
                        : 'bg-red-100 border-red-400 text-red-700 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes complémentaires</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Informations particulières, contexte clinique, refus parental signé…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Info PEV */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p className="font-medium mb-1">📋 Programme élargi de vaccination (PEV — MSPRH)</p>
          <p className="text-xs text-green-600">
            Toutes les vaccinations gratuites du PEV sont prises en charge par l&apos;État algérien.
            L&apos;acte sera enregistré dans le carnet vaccinal électronique du patient.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="../vaccinations"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!patientSelectionne || !vaccin}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            💉 Enregistrer la vaccination
          </button>
        </div>
      </form>
    </div>
  );
}
