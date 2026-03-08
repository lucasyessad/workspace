// ============================================================
// TabibPro — Détail Ordonnance
// Visualisation, impression PDF et actions
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type TypeOrdonnance = 'Standard' | 'Bizone' | 'Chronique' | 'Stupéfiant';
type StatutOrdonnance = 'Brouillon' | 'Validée' | 'Expirée';

interface LigneMedicament {
  medicament: string;
  dosage: string;
  forme: string;
  posologie: string;
  duree: string;
  quantite: string;
  instructions?: string;
  substituable: boolean;
  remboursable: boolean;
}

const ORDONNANCE_FICTIVE = {
  id: 'ord-001',
  numero: 'ORD-2026-00001',
  date: '2026-03-04',
  type: 'Standard' as TypeOrdonnance,
  statut: 'Validée' as StatutOrdonnance,
  validite: '3 mois',
  expiration: '2026-06-04',
  patient: {
    nom: 'Benali Karim',
    dateNaissance: '15/06/1990',
    age: 35,
    sexe: 'M',
    cnas: '0X1234567890',
    assurance: 'CNAS',
    tiersPayant: true,
  },
  medecin: {
    nom: 'Dr. Ahmed Benaissa',
    specialite: 'Médecin généraliste',
    numeroOrdre: 'MG-16-00234',
    adresse: '14 rue Didouche Mourad, Alger Centre',
    telephone: '021 XX XX XX',
  },
  lignes: [
    {
      medicament: 'Amoxicilline 500mg',
      dosage: '500mg',
      forme: 'Gélules',
      posologie: '1 matin — 1 midi — 1 soir',
      duree: '7 jours',
      quantite: '1 boîte (21 gélules)',
      instructions: 'À prendre pendant les repas',
      substituable: true,
      remboursable: true,
    },
    {
      medicament: 'Paracétamol 1g',
      dosage: '1g',
      forme: 'Comprimés',
      posologie: '1 matin — 1 soir (si douleur)',
      duree: '5 jours',
      quantite: '1 boîte (16 comprimés)',
      substituable: true,
      remboursable: true,
    },
    {
      medicament: 'Ibuprofène 400mg',
      dosage: '400mg',
      forme: 'Comprimés',
      posologie: '1 comprimé en cas de fièvre > 38.5°C',
      duree: '5 jours',
      quantite: '1 boîte (12 comprimés)',
      instructions: 'Ne pas prendre à jeun',
      substituable: true,
      remboursable: false,
    },
  ] as LigneMedicament[],
  commentaire: 'Repos recommandé 2 à 3 jours. Revenir en consultation si persistance des symptômes après 5 jours.',
};

const BADGE_TYPE: Record<TypeOrdonnance, string> = {
  Standard: 'bg-gray-100 text-gray-700',
  Bizone: 'bg-blue-100 text-blue-800',
  Chronique: 'bg-green-100 text-green-700',
  Stupéfiant: 'bg-red-100 text-red-700',
};

const BADGE_STATUT: Record<StatutOrdonnance, string> = {
  Validée: 'bg-green-100 text-green-700',
  Brouillon: 'bg-orange-100 text-orange-700',
  Expirée: 'bg-gray-100 text-gray-500',
};

export default function OrdonnanceDetailPage() {
  const params = useParams();
  const [mode, setMode] = useState<'apercu' | 'impression'>('apercu');
  const ord = ORDONNANCE_FICTIVE;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="../ordonnances" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {ord.numero}
            </h1>
            <p className="text-sm text-gray-500">
              {ord.date} · {ord.patient.nom}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${BADGE_TYPE[ord.type]}`}>
            {ord.type}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${BADGE_STATUT[ord.statut]}`}>
            {ord.statut}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          🖨️ Imprimer / PDF
        </button>
        {ord.statut === 'Brouillon' && (
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            ✓ Valider et signer
          </button>
        )}
        <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          📋 Dupliquer (renouvellement)
        </button>
        <Link
          href={`../ordonnances/nouveau?dupliquer=${params?.id}`}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ✎ Modifier
        </Link>
      </div>

      {/* Aperçu ordonnance — style document médical */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm print:shadow-none print:rounded-none print:border-none">
        {/* En-tête cabinet */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-gray-900 text-lg">{ord.medecin.nom}</p>
              <p className="text-sm text-gray-600">{ord.medecin.specialite}</p>
              <p className="text-xs text-gray-400 mt-1">N° Ordre : {ord.medecin.numeroOrdre}</p>
              <p className="text-xs text-gray-500 mt-0.5">{ord.medecin.adresse}</p>
              <p className="text-xs text-gray-500">Tél : {ord.medecin.telephone}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs text-gray-400">{ord.numero}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                Alger, le {ord.date}
              </p>
              <div className="mt-2 flex flex-col items-end gap-1">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${BADGE_TYPE[ord.type]}`}>
                  Ordonnance {ord.type}
                </span>
                {ord.patient.tiersPayant && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    Tiers-payant {ord.patient.assurance}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Identité patient */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Patient</p>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <div>
              <span className="text-xs text-gray-400">Nom :</span>{' '}
              <span className="text-sm font-semibold text-gray-900">{ord.patient.nom}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400">Né(e) le :</span>{' '}
              <span className="text-sm text-gray-700">{ord.patient.dateNaissance} ({ord.patient.age} ans)</span>
            </div>
            <div>
              <span className="text-xs text-gray-400">N° CNAS :</span>{' '}
              <span className="text-sm font-mono text-gray-700">{ord.patient.cnas}</span>
            </div>
          </div>
        </div>

        {/* Corps — médicaments */}
        <div className="p-6 space-y-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prescriptions</p>
          {ord.lignes.map((ligne, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 space-y-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">
                    {i + 1}. {ligne.medicament}
                    <span className="font-normal text-gray-500 text-sm ml-2">— {ligne.forme}</span>
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    <span className="font-medium">Posologie :</span> {ligne.posologie}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Durée :</span> {ligne.duree}
                    {' · '}
                    <span className="font-medium">Qté :</span> {ligne.quantite}
                  </p>
                  {ligne.instructions && (
                    <p className="text-xs text-amber-700 mt-0.5 italic">{ligne.instructions}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {ligne.substituable && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Substituable</span>
                  )}
                  {ligne.remboursable ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">Remboursable</span>
                  ) : (
                    <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded">Non remboursé</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {ord.commentaire && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Remarques / Conseils</p>
              <p className="text-sm text-gray-700">{ord.commentaire}</p>
            </div>
          )}
        </div>

        {/* Pied — validité + signature */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500">
              Validité : <span className="font-medium text-gray-700">{ord.validite}</span>
              {' '}(jusqu&apos;au {ord.expiration})
            </p>
            {ord.statut === 'Expirée' && (
              <p className="text-xs text-red-600 font-medium mt-0.5">
                ⚠️ Cette ordonnance est expirée
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              {ord.statut === 'Validée' ? (
                <p className="text-xs text-green-600 font-medium text-center">
                  ✅ Signé<br />électroniquement
                </p>
              ) : (
                <p className="text-xs text-gray-400 text-center">Cachet &<br />Signature</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Historique</h2>
        <div className="space-y-2">
          {[
            { action: 'Ordonnance créée', date: '2026-03-04 09:15', auteur: 'Dr. Benaissa' },
            { action: 'Ordonnance validée et signée', date: '2026-03-04 09:18', auteur: 'Dr. Benaissa' },
            { action: 'Envoyée au patient par messagerie', date: '2026-03-04 09:20', auteur: 'Système' },
          ].map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-gray-900">{h.action}</span>
                <span className="text-gray-400 text-xs ml-2">{h.date} · {h.auteur}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
