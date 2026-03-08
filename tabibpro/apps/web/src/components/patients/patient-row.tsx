// ============================================================
// TabibPro — PatientRow
// Ligne de tableau patient avec badge assurance coloré
// ============================================================

import Link from 'next/link';

type Assurance = 'CNAS' | 'CASNOS' | 'Aucun';

interface Patient {
  id: string;
  numeroPatient: string;
  nomFr: string;
  prenomFr: string;
  telephoneMobile: string;
  wilaya: string;
  organismeAssurance: Assurance;
  derniereConsultation: string;
}

interface PatientRowProps {
  patient: Patient;
  locale: string;
}

const BADGE_ASSURANCE: Record<Assurance, string> = {
  CNAS: 'bg-blue-100 text-blue-700 border-blue-200',
  CASNOS: 'bg-green-100 text-green-700 border-green-200',
  Aucun: 'bg-gray-100 text-gray-600 border-gray-200',
};

const WILAYAS: Record<string, string> = {
  '01': 'Adrar', '02': 'Chlef', '03': 'Laghouat', '04': 'Oum El Bouaghi',
  '05': 'Batna', '06': 'Béjaïa', '07': 'Biskra', '08': 'Béchar',
  '09': 'Blida', '10': 'Bouira', '11': 'Tamanrasset', '12': 'Tébessa',
  '13': 'Tlemcen', '14': 'Tiaret', '15': 'Tizi Ouzou', '16': 'Alger',
  '17': 'Djelfa', '18': 'Jijel', '19': 'Sétif', '20': 'Saïda',
  '21': 'Skikda', '22': 'Sidi Bel Abbès', '23': 'Annaba', '24': 'Guelma',
  '25': 'Constantine', '26': 'Médéa', '27': 'Mostaganem', '28': "M'Sila",
  '29': 'Mascara', '30': 'Ouargla', '31': 'Oran', '32': 'El Bayadh',
  '33': 'Illizi', '34': 'Bordj Bou Arréridj', '35': 'Boumerdès', '36': 'El Tarf',
  '37': 'Tindouf', '38': 'Tissemsilt', '39': 'El Oued', '40': 'Khenchela',
  '41': 'Souk Ahras', '42': 'Tipaza', '43': 'Mila', '44': 'Aïn Defla',
  '45': 'Naâma', '46': 'Aïn Témouchent', '47': 'Ghardaïa', '48': 'Relizane',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function PatientRow({ patient, locale }: PatientRowProps) {
  const badgeClass = BADGE_ASSURANCE[patient.organismeAssurance] ?? BADGE_ASSURANCE['Aucun'];
  const wilayaNom = WILAYAS[patient.wilaya] ?? patient.wilaya;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {patient.numeroPatient}
      </td>
      <td className="px-4 py-3 font-medium">
        {patient.nomFr} {patient.prenomFr}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {patient.telephoneMobile}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <span className="font-mono text-xs">{patient.wilaya}</span> — {wilayaNom}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {patient.organismeAssurance}
        </span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(patient.derniereConsultation)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/patients/${patient.id}`}
            className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
          >
            Voir
          </Link>
          <Link
            href={`/${locale}/consultations/nouvelle?patient=${patient.id}`}
            className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Consulter
          </Link>
        </div>
      </td>
    </tr>
  );
}
