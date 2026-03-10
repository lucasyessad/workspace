/**
 * Format a price in DZD (Algerian Dinars).
 * Examples: 35 000 000 DA, 150 000 DA/mois
 */
export function formatPrice(amount: number, currency = 'DZD', perMonth = false): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);

  const suffix = currency === 'DZD' ? ' DA' : ` ${currency}`;
  return `${formatted}${suffix}${perMonth ? '/mois' : ''}`;
}

/**
 * Format surface area.
 */
export function formatSurface(surface: number | null | undefined): string {
  if (!surface) return '-';
  return `${surface} m²`;
}

/**
 * Format a date for display (French locale).
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format a relative date (il y a 2 jours, etc.)
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return formatDate(date);
}

/**
 * Format a phone number for display.
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+213')) {
    const local = cleaned.slice(4);
    return `+213 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`.trim();
  }
  return phone;
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
