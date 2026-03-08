// ============================================================
// TabibPro — Dossier Patient
// Onglets: Résumé, Consultations, Ordonnances, Vaccinations
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const PATIENT_DEMO = {
  id: 'demo',
  numeroPatient: 'PAT-2026-00001',
  civilite: 'M',
  nomFr: 'Benali',
  prenomFr: 'Karim',
  nomAr: 'بن علي',
  prenomAr: 'كريم',
  dateNaissance: '1985-03-15',
  telephoneMobile: '0555 12 34 56',
  email: 'karim.benali@email.dz',
  wilaya: '16',
  commune: 'Alger Centre',
  groupeSanguin: 'A',
  rhesus: 'POSITIF',
  allergiesConnues: ['Pénicilline', 'AINS'],
  organismeAssurance: 'CNAS',
  numeroCarteChifa: '12345678901234567890',
  languePreferee: 'FR',
};

const CONSULTATIONS_DEMO = [
  {
    id: 'cons-001',
    date: '2026-02-28',
    motif: 'Douleurs abdominales',
    diagnostic: 'Gastrite aiguë',
    statut: 'Terminée',
  },
  {
    id: 'cons-002',
    date: '2026-01-15',
    motif: 'Suivi hypertension',
    diagnostic: 'HTA contrôlée',
    statut: 'Terminée',
  },
  {
    id: 'cons-003',
    date: '2025-12-10',
    motif: 'Renouvellement ordonnance',
    diagnostic: 'Diabète type 2',
    statut: 'Terminée',
  },
  {
    id: 'cons-004',
    date: '2025-11-22',
    motif: 'Toux persistante',
    diagnostic: 'Bronchite virale',
    statut: 'Terminée',
  },
  {
    id: 'cons-005',
    date: '2025-10-08',
    motif: 'Bilan annuel',
    diagnostic: 'RAS',
    statut: 'Terminée',
  },
];

const ORDONNANCES_DEMO = [
  {
    id: 'ord-001',
    date: '2026-02-28',
    type: 'Standard',
    nbMedicaments: 3,
    validite: '3 mois',
    statut: 'Validée',
  },
  {
    id: 'ord-002',
    date: '2025-12-10',
    type: 'Chronique',
    nbMedicaments: 5,
    validite: '6 mois',
    statut: 'Validée',
  },
  {
    id: 'ord-003',
    date: '2025-11-22',
    type: 'Bizone',
    nbMedicaments: 4,
    validite: '3 mois',
    statut: 'Expirée',
  },
];

const VACCINS_PEV = [
  { nom: 'BCG', doses: 1, recu: true, date: '1985-04-20' },
  { nom: 'Polio (VPO)', doses: 4, recu: true, date: '1986-01-15' },
  { nom: 'DTC (Diphtérie-Tétanos-Coqueluche)', doses: 3, recu: true, date: '1986-03-10' },
  { nom: 'Rougeole', doses: 2, recu: true, date: '1987-05-20' },
  { nom: 'Hépatite B', doses: 3, recu: true, date: '1990-08-12' },
  { nom: 'Pneumocoque', doses: 2, recu: false, date: null },
  { nom: 'Méningocoque', doses: 1, recu: false, date: null },
  { nom: 'Grippe saisonnière', doses: 1, recu: false, date: null },
];

const BADGE_STATUT_CONS: Record<string, string> = {
  Terminée: 'bg-green-100 text-green-700',
  'En cours': 'bg-orange-100 text-orange-700',
  Annulée: 'bg-red-100 text-red-700',
};

const BADGE_TYPE_ORD: Record<string, string> = {
  Standard: 'bg-gray-100 text-gray-700',
  Bizone: 'bg-blue-100 text-blue-800',
  Chronique: 'bg-green-100 text-green-700',
  Stupéfiant: 'bg-red-100 text-red-700',
};

const BADGE_STATUT_ORD: Record<string, string> = {
  Validée: 'bg-green-100 text-green-700',
  Brouillon: 'bg-orange-100 text-orange-700',
  Expirée: 'bg-gray-100 text-gray-500',
};

function calculateAge(dateNaissance: string): number {
  const today = new Date();
  const birth = new Date(dateNaissance);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

type OngletId = 'resume' | 'consultations' | 'ordonnances' | 'vaccinations';

const ONGLETS: { id: OngletId; label: string }[] = [
  { id: 'resume', label: 'Résumé' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'ordonnances', label: 'Ordonnances' },
  { id: 'vaccinations', label: 'Vaccinations' },
];

export default function PatientDossierPage() {
  const params = useParams();
  const locale = params.locale as string;
  const patientId = params.id as string;

  const [ongletActif, setOngletActif] = useState<OngletId>('resume');

  // Pour la démo, on utilise toujours PATIENT_DEMO
  const patient = PATIENT_DEMO;
  const age = calculateAge(patient.dateNaissance);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href={`/${locale}/patients`} className="hover:text-foreground">
              Patients
            </Link>
            <span>/</span>
            <span>
              {patient.civilite}. {patient.nomFr} {patient.prenomFr}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {patient.civilite}. {patient.nomFr} {patient.prenomFr}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {patient.numeroPatient} &bull; {age} ans &bull;{' '}
            {patient.groupeSanguin}
            {patient.rhesus === 'POSITIF' ? '+' : '-'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/consultations/nouvelle?patient=${patientId}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Nouvelle consultation
          </Link>
          <Link
            href={`/${locale}/ordonnances/nouvelle?patient=${patientId}`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Nouvelle ordonnance
          </Link>
          <Link
            href={`/${locale}/patients/${patientId}/modifier`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b">
        <nav className="flex gap-1" role="tablist">
          {ONGLETS.map((onglet) => (
            <button
              key={onglet.id}
              role="tab"
              aria-selected={ongletActif === onglet.id}
              onClick={() => setOngletActif(onglet.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                ongletActif === onglet.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              {onglet.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu onglet */}
      {ongletActif === 'resume' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Identité */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="text-sm font-semibold text-blue-700 mb-4">Identité</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nom (FR)</dt>
                <dd className="font-medium">
                  {patient.nomFr} {patient.prenomFr}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nom (AR)</dt>
                <dd className="font-medium" dir="rtl">
                  {patient.nomAr} {patient.prenomAr}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date de naissance</dt>
                <dd className="font-medium">
                  {formatDate(patient.dateNaissance)} ({age} ans)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Wilaya</dt>
                <dd className="font-medium">{patient.wilaya} — {patient.commune}</dd>
              </div>
            </dl>
          </div>

          {/* Contact */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="text-sm font-semibold text-blue-700 mb-4">Contact</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd className="font-medium">{patient.telephoneMobile}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{patient.email}</dd>
              </div>
            </dl>
          </div>

          {/* Données médicales */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="text-sm font-semibold text-blue-700 mb-4">Données médicales</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Groupe sanguin</dt>
                <dd className="font-medium">
                  {patient.groupeSanguin}{' '}
                  {patient.rhesus === 'POSITIF' ? '(Rhésus +)' : '(Rhésus -)'}
                </dd>
              </div>
              <div className="flex gap-2 items-start">
                <dt className="text-muted-foreground shrink-0">Allergies</dt>
                <dd className="flex flex-wrap gap-1">
                  {patient.allergiesConnues.map((allergie) => (
                    <span
                      key={allergie}
                      className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                    >
                      {allergie}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Assurance */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h2 className="text-sm font-semibold text-blue-700 mb-4">Assurance</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Organisme</dt>
                <dd className="font-medium">{patient.organismeAssurance}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">N° Carte Chifa</dt>
                <dd className="font-mono text-xs">{patient.numeroCarteChifa}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {ongletActif === 'consultations' && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Historique des consultations</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Motif</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Diagnostic</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {CONSULTATIONS_DEMO.map((cons) => (
                <tr key={cons.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(cons.date)}
                  </td>
                  <td className="px-4 py-3 font-medium">{cons.motif}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cons.diagnostic}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_STATUT_CONS[cons.statut] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cons.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ongletActif === 'ordonnances' && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Ordonnances</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">N°</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Médicaments</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Validité</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ORDONNANCES_DEMO.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {ord.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(ord.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_TYPE_ORD[ord.type] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ord.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{ord.nbMedicaments}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ord.validite}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_STATUT_ORD[ord.statut] ?? 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {ord.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-blue-600 hover:underline">
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ongletActif === 'vaccinations' && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Calendrier vaccinal (PEV)</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vaccin</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doses</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {VACCINS_PEV.map((vaccin) => (
                <tr key={vaccin.nom} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{vaccin.nom}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{vaccin.doses}</td>
                  <td className="px-4 py-3 text-lg">
                    {vaccin.recu ? '✅' : '⏳'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {vaccin.date ? formatDate(vaccin.date) : 'À planifier'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
