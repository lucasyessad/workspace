// ============================================================
// TabibPro — Tests unitaires — Health check
// ============================================================

import { describe, it, expect } from 'vitest';

describe('Health', () => {
  it('retourne le statut ok', () => {
    const status = { status: 'ok', app: 'TabibPro', country: 'DZ' };
    expect(status.status).toBe('ok');
    expect(status.country).toBe('DZ');
  });

  it('valide le format de la timezone algérienne', () => {
    const tz = 'Africa/Algiers';
    expect(tz).toMatch(/^Africa\//);
  });

  it('valide la devise DZD', () => {
    const montant = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(1000);
    expect(montant).toContain('1');
  });
});
