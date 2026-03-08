// ============================================================
// TabibPro — Utilitaires partagés
// ============================================================

import { WEEKEND_DAYS_DZ } from '../constants';

// ---- Formatage DZD ----

export function formatDZD(amount: number, locale: string = 'fr-DZ'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---- Formatage numéro de téléphone algérien ----

export function formatPhoneDZ(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('213')) {
    const local = cleaned.slice(3);
    return `+213 (0)${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `0${cleaned.slice(1, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  return phone;
}

// ---- Calcul IMC ----

export function calculateIMC(poids: number, tailleEnCm: number): number {
  if (poids <= 0 || tailleEnCm <= 0) return 0;
  const tailleEnM = tailleEnCm / 100;
  return Math.round((poids / (tailleEnM * tailleEnM)) * 10) / 10;
}

export function getIMCCategory(imc: number, locale: string = 'fr'): string {
  const categories = {
    fr: {
      underweight: 'Insuffisance pondérale',
      normal: 'Poids normal',
      overweight: 'Surpoids',
      obese1: 'Obésité modérée',
      obese2: 'Obésité sévère',
      obese3: 'Obésité morbide',
    },
    ar: {
      underweight: 'نقص الوزن',
      normal: 'وزن طبيعي',
      overweight: 'زيادة الوزن',
      obese1: 'سمنة معتدلة',
      obese2: 'سمنة شديدة',
      obese3: 'سمنة مفرطة',
    },
  };
  const cat = categories[locale as keyof typeof categories] ?? categories.fr;

  if (imc < 18.5) return cat.underweight;
  if (imc < 25) return cat.normal;
  if (imc < 30) return cat.overweight;
  if (imc < 35) return cat.obese1;
  if (imc < 40) return cat.obese2;
  return cat.obese3;
}

// ---- Weekend algérien ----

export function isWeekendDZ(date: Date): boolean {
  const day = date.getDay(); // 0=Dimanche, ..., 5=Vendredi, 6=Samedi
  return (WEEKEND_DAYS_DZ as readonly number[]).includes(day);
}

export function isWorkDayDZ(date: Date): boolean {
  return !isWeekendDZ(date);
}

// ---- Génération de numéros séquentiels ----

export function generatePatientNumber(year: number, sequence: number): string {
  return `PAT-${year}-${String(sequence).padStart(5, '0')}`;
}

export function generateConsultationNumber(year: number, month: number, sequence: number): string {
  return `CONS-${year}${String(month).padStart(2, '0')}-${String(sequence).padStart(5, '0')}`;
}

export function generatePrescriptionNumber(year: number, sequence: number): string {
  return `ORD-${year}-${String(sequence).padStart(6, '0')}`;
}

export function generateInvoiceNumber(year: number, sequence: number): string {
  return `FACT-${year}-${String(sequence).padStart(6, '0')}`;
}

// ---- Validation Chifa ----

export function isValidChifaNumber(chifa: string): boolean {
  return /^[0-9]{20}$/.test(chifa);
}

// ---- Formatage des noms (contexte algérien bilingue) ----

export function formatPatientName(
  nomFr: string,
  prenomFr: string,
  nomAr?: string,
  prenomAr?: string,
  locale: string = 'fr'
): string {
  if (locale === 'ar' && nomAr && prenomAr) {
    return `${prenomAr} ${nomAr}`;
  }
  return `${prenomFr} ${nomFr.toUpperCase()}`;
}

// ---- Calcul de l'âge ----

export function calculateAge(dateNaissance: Date | string): { annees: number; mois: number } {
  const birth = typeof dateNaissance === 'string' ? new Date(dateNaissance) : dateNaissance;
  const now = new Date();
  let annees = now.getFullYear() - birth.getFullYear();
  let mois = now.getMonth() - birth.getMonth();
  if (mois < 0 || (mois === 0 && now.getDate() < birth.getDate())) {
    annees--;
    mois += 12;
  }
  return { annees, mois };
}

export function formatAge(dateNaissance: Date | string, locale: string = 'fr'): string {
  const { annees, mois } = calculateAge(dateNaissance);
  if (locale === 'ar') {
    if (annees < 2) return `${mois} أشهر`;
    return `${annees} سنة`;
  }
  if (annees < 2) return `${mois} mois`;
  return `${annees} ans`;
}

// ---- Détection darija ----

export function detectDarija(text: string): boolean {
  const darijaPatterns = [
    /\b(rani|rabi|wach|kifach|bezzaf|marid|sda3|wja3|shkhana|baraka)\b/i,
    /\b(3andi|3andek|3andha|3ayndna)\b/i,
    /\b(machi|mabghatsh|makansh|ma9dartch)\b/i,
    /\bw(el|al)\b/i,
    /\b(karchi|rasi|tbti|qalbi|kifak|kahba)\b/i,
  ];
  return darijaPatterns.some((p) => p.test(text));
}
