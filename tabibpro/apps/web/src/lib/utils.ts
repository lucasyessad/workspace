import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format DZD
export function formatDZD(amount: number, locale: string = 'fr'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date Algérie
export function formatDateDZ(date: Date | string, locale: string = 'fr'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Algiers',
  }).format(d);
}

// Format téléphone DZ
export function formatPhoneDZ(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('213') && cleaned.length === 12) {
    const local = cleaned.slice(3);
    return `+213 (0)${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)}`;
  }
  return phone;
}

// Direction du texte selon locale
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
