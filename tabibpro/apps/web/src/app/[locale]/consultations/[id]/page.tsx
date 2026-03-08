// ============================================================
// TabibPro — Détail / Saisie d'une consultation
// Constantes vitales + Examen clinique + Diagnostic + Ordonnance
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type OngletConsultation = 'constantes' | 'examen' | 'diagnostic' | 'ordonnance' | 'documents';

interface Constantes {
  tension: string;
  pouls: string;
  temperature: string;
  saturation: string;
  poids: string;
  taille: string;
  glycemie: string;
}

interface Examen {
  plainte: string;
  histoire: string;
  examenGeneral: string;
  cardio: string;
  pulmonaire: string;
  abdominal: string;
  neurologique: string;
  autre: string;
}

const CONSULTATION_FICTIVE = {
  id: 'cons-001',
  patient: 'Amina Boulahia',
  patientId: 'pat-001',
  age: 37,
  sexe: 'F',
  date: '2026-03-05',
  heure: '09:00',
  type: 'Générale',
  motif: 'Fièvre et maux de gorge depuis 3 jours',
  statut: 'En cours',
  antecedents: 'Angine récidivante (3×/an), allergie Pénicilline',
  traitements: 'Cétirizine 10mg le soir',
};

const CIM10_SAMPLE = [
  { code: 'J02.9', libelle: 'Pharyngite aiguë, sans précision' },
  { code: 'J03.9', libelle: 'Amygdalite aiguë, sans précision' },
  { code: 'J06.9', libelle: 'Infection aiguë des voies respiratoires supérieures' },
  { code: 'I10', libelle: 'Hypertension essentielle (primitive)' },
  { code: 'E11', libelle: 'Diabète sucré de type 2' },
  { code: 'J45.9', libelle: 'Asthme, sans précision' },
  { code: 'K21.0', libelle: 'Reflux gastro-oesophagien avec oesophagite' },
  { code: 'M54.5', libelle: 'Lombalgie basse' },
  { code: 'F41.1', libelle: 'Trouble anxieux généralisé' },
  { code: 'N39.0', libelle: 'Infection urinaire, siège non précisé' },
];

function evaluerIMC(poids: string, taille: string) {
  const p = parseFloat(poids);
  const t = parseFloat(taille) / 100;
  if (!p || !t) return null;
  const imc = p / (t * t);
  return imc.toFixed(1);
}

function evaluerTA(tension: string) {
  const parts = tension.split('/');
  if (parts.length !== 2) return null;
  const sys = parseInt(parts[0]);
  const dias = parseInt(parts[1]);
  if (!sys || !dias) return null;
  if (sys < 120 && dias < 80) return { label: 'Normale', color: 'text-green-600' };
  if (sys < 130 && dias < 80) return { label: 'Élevée', color: 'text-amber-600' };
  if (sys >= 130 || dias >= 80) return { label: 'HTA', color: 'text-red-600' };
  return null;
}

export default function ConsultationDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [onglet, setOnglet] = useState<OngletConsultation>('constantes');
  const [constantes, setConstantes] = useState<Constantes>({
    tension: '',
    pouls: '',
    temperature: '',
    saturation: '',
    poids: '',
    taille: '',
    glycemie: '',
  });
  const [examen, setExamen] = useState<Examen>({
    plainte: CONSULTATION_FICTIVE.motif,
    histoire: '',
    examenGeneral: '',
    cardio: '',
    pulmonaire: '',
    abdominal: '',
    neurologique: '',
    autre: '',
  });
  const [diagnosticPrincipal, setDiagnosticPrincipal] = useState('');
  const [codeCim10, setCodeCim10] = useState('');
  const [diagnosticsSecondaires, setDiagnostiquesSecondaires] = useState('');
  const [rechercheCode, setRechercheCode] = useState('');
  const [conducteTenue, setConducteTenue] = useState('');
  const [sauvegarde, setSauvegarde] = useState(false);

  const imcCalc = evaluerIMC(constantes.poids, constantes.taille);
  const taEval = evaluerTA(constantes.tension);

  const cimFiltres = CIM10_SAMPLE.filter(
    (c) =>
      c.code.toLowerCase().includes(rechercheCode.toLowerCase()) ||
      c.libelle.toLowerCase().includes(rechercheCode.toLowerCase())
  );

  function handleSave() {
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 3000);
  }

  const ONGLETS: { key: OngletConsultation; label: string; icon: string }[] = [
    { key: 'constantes', label: 'Constantes', icon: '📊' },
    { key: 'examen', label: 'Examen clinique', icon: '🔍' },
    { key: 'diagnostic', label: 'Diagnostic', icon: '🩺' },
    { key: 'ordonnance', label: 'Ordonnance', icon: '📄' },
    { key: 'documents', label: 'Documents', icon: '📎' },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      {/* En-tête patient */}
      <div className="flex items-start gap-4">
        <Link href="../consultations" className="text-gray-400 hover:text-gray-600 text-lg mt-1">←</Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              Consultation — {CONSULTATION_FICTIVE.patient}
            </h1>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full font-medium">
              {CONSULTATION_FICTIVE.type}
            </span>
            <span className="text-sm bg-amber-100 text-amber-700 px-3 py-0.5 rounded-full font-medium animate-pulse">
              En cours
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {CONSULTATION_FICTIVE.age} ans · {CONSULTATION_FICTIVE.sexe} ·
            {' '}{CONSULTATION_FICTIVE.date} à {CONSULTATION_FICTIVE.heure}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Enregistrer
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Clôturer ✓
          </button>
        </div>
      </div>

      {sauvegarde && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
          ✅ Consultation sauvegardée
        </div>
      )}

      {/* Bandeau antécédents */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-sm">
        <span className="flex-shrink-0">⚠️</span>
        <div>
          <span className="font-semibold text-amber-800">Antécédents :</span>{' '}
          <span className="text-amber-700">{CONSULTATION_FICTIVE.antecedents}</span>
          {' · '}
          <span className="font-semibold text-amber-800">Traitements en cours :</span>{' '}
          <span className="text-amber-700">{CONSULTATION_FICTIVE.traitements}</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex overflow-x-auto border-b border-gray-200">
        {ONGLETS.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className={`flex items-center gap-2 flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              onglet === o.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>

      {/* Onglet Constantes */}
      {onglet === 'constantes' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Mesures et constantes vitales</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tension artérielle */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tension artérielle (mmHg)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={constantes.tension}
                  onChange={(e) => setConstantes({ ...constantes, tension: e.target.value })}
                  placeholder="120/80"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                />
                {taEval && (
                  <span className={`absolute right-3 top-2.5 text-xs font-medium ${taEval.color}`}>
                    {taEval.label}
                  </span>
                )}
              </div>
            </div>

            {/* Pouls */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pouls (bpm)</label>
              <input
                type="number"
                value={constantes.pouls}
                onChange={(e) => setConstantes({ ...constantes, pouls: e.target.value })}
                placeholder="72"
                min="30"
                max="250"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  constantes.pouls && (parseInt(constantes.pouls) < 60 || parseInt(constantes.pouls) > 100)
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-gray-300'
                }`}
              />
              {constantes.pouls && parseInt(constantes.pouls) < 60 && (
                <p className="text-xs text-amber-600 mt-0.5">Bradycardie</p>
              )}
              {constantes.pouls && parseInt(constantes.pouls) > 100 && (
                <p className="text-xs text-amber-600 mt-0.5">Tachycardie</p>
              )}
            </div>

            {/* Température */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Température (°C)</label>
              <input
                type="number"
                value={constantes.temperature}
                onChange={(e) => setConstantes({ ...constantes, temperature: e.target.value })}
                placeholder="37.0"
                step="0.1"
                min="34"
                max="42"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  constantes.temperature && parseFloat(constantes.temperature) >= 38
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {constantes.temperature && parseFloat(constantes.temperature) >= 38 && (
                <p className="text-xs text-red-600 mt-0.5">Fièvre</p>
              )}
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SpO₂ (%)</label>
              <input
                type="number"
                value={constantes.saturation}
                onChange={(e) => setConstantes({ ...constantes, saturation: e.target.value })}
                placeholder="98"
                min="70"
                max="100"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  constantes.saturation && parseInt(constantes.saturation) < 95
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {constantes.saturation && parseInt(constantes.saturation) < 95 && (
                <p className="text-xs text-red-600 mt-0.5">Hypoxémie</p>
              )}
            </div>

            {/* Poids */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Poids (kg)</label>
              <input
                type="number"
                value={constantes.poids}
                onChange={(e) => setConstantes({ ...constantes, poids: e.target.value })}
                placeholder="70"
                step="0.1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Taille */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Taille (cm)</label>
              <input
                type="number"
                value={constantes.taille}
                onChange={(e) => setConstantes({ ...constantes, taille: e.target.value })}
                placeholder="170"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Glycémie */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Glycémie (g/L)</label>
              <input
                type="number"
                value={constantes.glycemie}
                onChange={(e) => setConstantes({ ...constantes, glycemie: e.target.value })}
                placeholder="0.90"
                step="0.01"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  constantes.glycemie && parseFloat(constantes.glycemie) >= 1.26
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {constantes.glycemie && parseFloat(constantes.glycemie) >= 1.26 && (
                <p className="text-xs text-red-600 mt-0.5">Hyperglycémie</p>
              )}
            </div>
          </div>

          {/* IMC calculé */}
          {imcCalc && (
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">IMC calculé</p>
                <p className="text-2xl font-bold text-gray-900">{imcCalc}</p>
              </div>
              <div className="text-sm text-gray-600">
                {parseFloat(imcCalc) < 18.5 && <span className="text-blue-600 font-medium">Insuffisance pondérale</span>}
                {parseFloat(imcCalc) >= 18.5 && parseFloat(imcCalc) < 25 && <span className="text-green-600 font-medium">Poids normal</span>}
                {parseFloat(imcCalc) >= 25 && parseFloat(imcCalc) < 30 && <span className="text-amber-600 font-medium">Surpoids</span>}
                {parseFloat(imcCalc) >= 30 && <span className="text-red-600 font-medium">Obésité</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onglet Examen clinique */}
      {onglet === 'examen' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Examen clinique</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif de consultation / Plainte principale
            </label>
            <textarea
              rows={2}
              value={examen.plainte}
              onChange={(e) => setExamen({ ...examen, plainte: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Histoire de la maladie
            </label>
            <textarea
              rows={3}
              value={examen.histoire}
              onChange={(e) => setExamen({ ...examen, histoire: e.target.value })}
              placeholder="Décrivez l'évolution, le début, les circonstances, les traitements déjà essayés…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examen général</label>
            <input
              type="text"
              value={examen.examenGeneral}
              onChange={(e) => setExamen({ ...examen, examenGeneral: e.target.value })}
              placeholder="État général, conscience, coloration, hydratation…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'cardio', label: 'Examen cardio-vasculaire' },
              { key: 'pulmonaire', label: 'Examen pulmonaire' },
              { key: 'abdominal', label: 'Examen abdominal' },
              { key: 'neurologique', label: 'Examen neurologique' },
            ].map((s) => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                <textarea
                  rows={2}
                  value={examen[s.key as keyof Examen]}
                  onChange={(e) => setExamen({ ...examen, [s.key]: e.target.value })}
                  placeholder="RAS si normal, sinon détailler…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autres constatations</label>
            <textarea
              rows={2}
              value={examen.autre}
              onChange={(e) => setExamen({ ...examen, autre: e.target.value })}
              placeholder="ORL, ophtalmologique, dermatologique, ostéo-articulaire…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Onglet Diagnostic */}
      {onglet === 'diagnostic' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Diagnostic et conduite tenue</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnostic principal <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={diagnosticPrincipal}
              onChange={(e) => setDiagnosticPrincipal(e.target.value)}
              placeholder="Ex: Angine bactérienne — Streptocoque A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Code CIM-10 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code CIM-10
            </label>
            <div className="relative">
              <input
                type="text"
                value={rechercheCode}
                onChange={(e) => setRechercheCode(e.target.value)}
                placeholder="Rechercher un code ou libellé CIM-10…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {rechercheCode.length >= 2 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {cimFiltres.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCodeCim10(c.code);
                        setRechercheMed && null;
                        setRechercheCode(`${c.code} — ${c.libelle}`);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0"
                    >
                      <span className="font-mono font-bold text-blue-700">{c.code}</span>{' '}
                      <span className="text-gray-700">{c.libelle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {codeCim10 && (
              <p className="text-xs text-blue-600 mt-1">Code sélectionné : <strong>{codeCim10}</strong></p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostics secondaires</label>
            <textarea
              rows={2}
              value={diagnosticsSecondaires}
              onChange={(e) => setDiagnostiquesSecondaires(e.target.value)}
              placeholder="Comorbidités, pathologies associées…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conduite tenue</label>
            <textarea
              rows={3}
              value={conducteTenue}
              onChange={(e) => setConducteTenue(e.target.value)}
              placeholder="Traitement prescrit, examens complémentaires demandés, conseils hygiéno-diététiques, orientation spécialisée, arrêt de travail…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">🤖 Aide au diagnostic IA</p>
            <p className="text-xs text-blue-600 mb-3">
              Basé sur les symptômes saisis, l&apos;IA suggère les diagnostics les plus probables.
            </p>
            <button type="button" className="text-sm text-blue-700 font-medium border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              Activer l&apos;aide IA
            </button>
          </div>
        </div>
      )}

      {/* Onglet Ordonnance */}
      {onglet === 'ordonnance' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Ordonnance associée</h2>
          <p className="text-sm text-gray-500">
            Créez une ordonnance directement liée à cette consultation.
          </p>
          <Link
            href={`../../ordonnances/nouveau?patientId=${CONSULTATION_FICTIVE.patientId}&consultationId=${id}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            📄 Créer une ordonnance
          </Link>
          <div className="text-sm text-gray-400 pt-2">
            <p>Aucune ordonnance liée à cette consultation pour le moment.</p>
          </div>
        </div>
      )}

      {/* Onglet Documents */}
      {onglet === 'documents' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Documents et pièces jointes</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <p className="text-4xl mb-2">📎</p>
            <p className="text-sm font-medium text-gray-700">Glissez vos fichiers ici</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — Max 10 Mo par fichier</p>
            <button type="button" className="mt-3 text-sm text-blue-600 font-medium border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              Parcourir les fichiers
            </button>
          </div>
          <div className="space-y-2">
            {[
              { nom: 'Résultats NFS — 15/02/2026.pdf', taille: '245 Ko', type: 'Biologie' },
              { nom: 'Echo abdominale — 2025.pdf', taille: '1.2 Mo', type: 'Imagerie' },
            ].map((doc) => (
              <div key={doc.nom} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <span className="text-xl">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.nom}</p>
                  <p className="text-xs text-gray-400">{doc.type} · {doc.taille}</p>
                </div>
                <button className="text-xs text-blue-600 hover:underline">Voir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre d'actions fixe bas */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">Dernière sauvegarde : automatique</p>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Sauvegarder
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            Clôturer la consultation
          </button>
        </div>
      </div>
    </div>
  );
}
