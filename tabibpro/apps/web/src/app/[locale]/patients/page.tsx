// ============================================================
// TabibPro — Liste des Patients
// ============================================================

import Link from 'next/link';
import { PatientRow } from '@/components/patients/patient-row';

interface PatientsPageProps {
  params: Promise<{ locale: string }>;
}

const PATIENTS_FICTIFS = [
  {
    id: 'demo',
    numeroPatient: 'PAT-2026-00001',
    nomFr: 'Benali',
    prenomFr: 'Karim',
    telephoneMobile: '0555 12 34 56',
    wilaya: '16',
    organismeAssurance: 'CNAS' as const,
    derniereConsultation: '2026-02-28',
  },
  {
    id: 'pat-002',
    numeroPatient: 'PAT-2026-00002',
    nomFr: 'Meziani',
    prenomFr: 'Fatima',
    telephoneMobile: '0661 98 76 54',
    wilaya: '31',
    organismeAssurance: 'CASNOS' as const,
    derniereConsultation: '2026-03-01',
  },
  {
    id: 'pat-003',
    numeroPatient: 'PAT-2026-00003',
    nomFr: 'Boudjelal',
    prenomFr: 'Youcef',
    telephoneMobile: '0770 45 67 89',
    wilaya: '09',
    organismeAssurance: 'Aucun' as const,
    derniereConsultation: '2026-03-03',
  },
  {
    id: 'pat-004',
    numeroPatient: 'PAT-2026-00004',
    nomFr: 'Amrani',
    prenomFr: 'Nadia',
    telephoneMobile: '0551 23 45 67',
    wilaya: '16',
    organismeAssurance: 'CNAS' as const,
    derniereConsultation: '2026-03-04',
  },
  {
    id: 'pat-005',
    numeroPatient: 'PAT-2026-00005',
    nomFr: 'Khelifi',
    prenomFr: 'Omar',
    telephoneMobile: '0699 87 65 43',
    wilaya: '23',
    organismeAssurance: 'CASNOS' as const,
    derniereConsultation: '2026-02-20',
  },
];

const WILAYAS = [
  { code: '01', nom: 'Adrar' },
  { code: '02', nom: 'Chlef' },
  { code: '03', nom: 'Laghouat' },
  { code: '04', nom: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna' },
  { code: '06', nom: 'Béjaïa' },
  { code: '07', nom: 'Biskra' },
  { code: '08', nom: 'Béchar' },
  { code: '09', nom: 'Blida' },
  { code: '10', nom: 'Bouira' },
  { code: '11', nom: 'Tamanrasset' },
  { code: '12', nom: 'Tébessa' },
  { code: '13', nom: 'Tlemcen' },
  { code: '14', nom: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou' },
  { code: '16', nom: 'Alger' },
  { code: '17', nom: 'Djelfa' },
  { code: '18', nom: 'Jijel' },
  { code: '19', nom: 'Sétif' },
  { code: '20', nom: 'Saïda' },
  { code: '21', nom: 'Skikda' },
  { code: '22', nom: 'Sidi Bel Abbès' },
  { code: '23', nom: 'Annaba' },
  { code: '24', nom: 'Guelma' },
  { code: '25', nom: 'Constantine' },
  { code: '26', nom: 'Médéa' },
  { code: '27', nom: 'Mostaganem' },
  { code: '28', nom: "M'Sila" },
  { code: '29', nom: 'Mascara' },
  { code: '30', nom: 'Ouargla' },
  { code: '31', nom: 'Oran' },
  { code: '32', nom: 'El Bayadh' },
  { code: '33', nom: 'Illizi' },
  { code: '34', nom: 'Bordj Bou Arréridj' },
  { code: '35', nom: 'Boumerdès' },
  { code: '36', nom: 'El Tarf' },
  { code: '37', nom: 'Tindouf' },
  { code: '38', nom: 'Tissemsilt' },
  { code: '39', nom: 'El Oued' },
  { code: '40', nom: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras' },
  { code: '42', nom: 'Tipaza' },
  { code: '43', nom: 'Mila' },
  { code: '44', nom: 'Aïn Defla' },
  { code: '45', nom: 'Naâma' },
  { code: '46', nom: 'Aïn Témouchent' },
  { code: '47', nom: 'Ghardaïa' },
  { code: '48', nom: 'Relizane' },
  { code: '49', nom: 'Timimoun' },
  { code: '50', nom: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal' },
  { code: '52', nom: 'Béni Abbès' },
  { code: '53', nom: 'In Salah' },
  { code: '54', nom: 'In Guezzam' },
  { code: '55', nom: 'Touggourt' },
  { code: '56', nom: 'Djanet' },
  { code: '57', nom: "El M'Ghair" },
  { code: '58', nom: 'El Meniaa' },
];

export default async function PatientsPage({ params }: PatientsPageProps) {
  const { locale } = await params;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion du dossier patient
          </p>
        </div>
        <Link
          href={`/${locale}/patients/nouveau`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span>+</span>
          Nouveau patient
        </Link>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="rounded-xl border bg-card shadow-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Rechercher par nom, téléphone, N° Chifa..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Toutes les wilayas</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.nom}
                </option>
              ))}
            </select>
            <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">Toute assurance</option>
              <option value="CNAS">CNAS</option>
              <option value="CASNOS">CASNOS</option>
              <option value="Aucun">Aucun</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau patients */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  N° Patient
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nom complet
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Wilaya
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Assurance
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Dernière consultation
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {PATIENTS_FICTIFS.map((patient) => (
                <PatientRow key={patient.id} patient={patient} locale={locale} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium">20 patients</span> sur{' '}
            <span className="font-medium">142</span>
          </p>
          <div className="flex gap-1">
            <button
              disabled
              className="rounded border px-3 py-1 text-sm text-muted-foreground disabled:opacity-50"
            >
              Précédent
            </button>
            <button className="rounded border bg-blue-600 px-3 py-1 text-sm text-white">
              1
            </button>
            <button className="rounded border px-3 py-1 text-sm hover:bg-muted">
              2
            </button>
            <button className="rounded border px-3 py-1 text-sm hover:bg-muted">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
