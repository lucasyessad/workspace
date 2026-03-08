// ============================================================
// TabibPro — Ordonnances
// Liste des ordonnances avec filtres et actions
// ============================================================

import Link from 'next/link';

interface OrdonnancesPageProps {
  params: Promise<{ locale: string }>;
}

type TypeOrdonnance = 'Standard' | 'Bizone' | 'Chronique' | 'Stupéfiant';
type StatutOrdonnance = 'Brouillon' | 'Validée' | 'Expirée';

interface Ordonnance {
  id: string;
  numero: string;
  patient: string;
  patientId: string;
  date: string;
  type: TypeOrdonnance;
  nbMedicaments: number;
  validite: string;
  statut: StatutOrdonnance;
}

const ORDONNANCES_FICTIVES: Ordonnance[] = [
  {
    id: 'ord-001',
    numero: 'ORD-2026-00001',
    patient: 'Benali Karim',
    patientId: 'demo',
    date: '2026-03-04',
    type: 'Standard',
    nbMedicaments: 3,
    validite: '3 mois',
    statut: 'Validée',
  },
  {
    id: 'ord-002',
    numero: 'ORD-2026-00002',
    patient: 'Meziani Fatima',
    patientId: 'pat-002',
    date: '2026-03-03',
    type: 'Bizone',
    nbMedicaments: 5,
    validite: '3 mois',
    statut: 'Validée',
  },
  {
    id: 'ord-003',
    numero: 'ORD-2026-00003',
    patient: 'Boudjelal Youcef',
    patientId: 'pat-003',
    date: '2026-03-01',
    type: 'Chronique',
    nbMedicaments: 6,
    validite: '6 mois',
    statut: 'Validée',
  },
  {
    id: 'ord-004',
    numero: 'ORD-2026-00004',
    patient: 'Amrani Nadia',
    patientId: 'pat-004',
    date: '2026-02-28',
    type: 'Stupéfiant',
    nbMedicaments: 1,
    validite: '7 jours',
    statut: 'Expirée',
  },
  {
    id: 'ord-005',
    numero: 'ORD-2026-00005',
    patient: 'Khelifi Omar',
    patientId: 'pat-005',
    date: '2026-03-05',
    type: 'Standard',
    nbMedicaments: 2,
    validite: '3 mois',
    statut: 'Brouillon',
  },
];

const BADGE_TYPE: Record<TypeOrdonnance, string> = {
  Standard: 'bg-gray-100 text-gray-700 border-gray-200',
  Bizone: 'bg-blue-100 text-blue-800 border-blue-200',
  Chronique: 'bg-green-100 text-green-700 border-green-200',
  Stupéfiant: 'bg-red-100 text-red-700 border-red-200',
};

const BADGE_STATUT: Record<StatutOrdonnance, string> = {
  Validée: 'bg-green-100 text-green-700',
  Brouillon: 'bg-orange-100 text-orange-700',
  Expirée: 'bg-gray-100 text-gray-500',
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default async function OrdonnancesPage({ params }: OrdonnancesPageProps) {
  const { locale } = await params;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordonnances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion des prescriptions médicales
          </p>
        </div>
        <Link
          href={`/${locale}/ordonnances/nouveau`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span>+</span>
          Nouvelle ordonnance
        </Link>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border bg-card shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Type:</label>
            <select className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Tous les types</option>
              <option value="Standard">Standard</option>
              <option value="Bizone">Bizone</option>
              <option value="Chronique">Chronique</option>
              <option value="Stupéfiant">Stupéfiant</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Statut:</label>
            <select className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Tous les statuts</option>
              <option value="Brouillon">Brouillon</option>
              <option value="Validée">Validée</option>
              <option value="Expirée">Expirée</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="search"
              placeholder="Rechercher par patient ou numéro..."
              className="w-full border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tableau ordonnances */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  N° Ordonnance
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Patient
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Médicaments
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Validité
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ORDONNANCES_FICTIVES.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {ord.numero}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/patients/${ord.patientId}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {ord.patient}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(ord.date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_TYPE[ord.type]
                      }`}
                    >
                      {ord.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {ord.nbMedicaments}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ord.validite}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_STATUT[ord.statut]
                      }`}
                    >
                      {ord.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors">
                        Voir PDF
                      </button>
                      <button className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors">
                        Dupliquer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Résumé */}
        <div className="border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{ORDONNANCES_FICTIVES.length} ordonnances</span>{' '}
            affichées — dont{' '}
            <span className="font-medium text-orange-600">
              {ORDONNANCES_FICTIVES.filter((o) => o.statut === 'Brouillon').length} brouillon(s)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
