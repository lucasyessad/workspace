// ============================================================
// TabibPro — Tests unitaires — Patients (logique métier)
// ============================================================

import { describe, it, expect } from 'vitest';

// ---- Helpers utilitaires (à extraire dans le service réel) ----

function formatNumeroCnas(cnas: string): string {
  return cnas.replace(/\s/g, '').toUpperCase();
}

function calculerAge(dateNaissance: string): number {
  const naissance = new Date(dateNaissance);
  const aujourd_hui = new Date();
  let age = aujourd_hui.getFullYear() - naissance.getFullYear();
  const mois = aujourd_hui.getMonth() - naissance.getMonth();
  if (mois < 0 || (mois === 0 && aujourd_hui.getDate() < naissance.getDate())) {
    age--;
  }
  return age;
}

function validerTelephoneAlgerien(tel: string): boolean {
  // Format algérien : 0X XX XX XX XX (10 chiffres)
  const cleaned = tel.replace(/\s/g, '');
  return /^0[5-7]\d{8}$/.test(cleaned);
}

// ---- Tests ----

describe('Patients — Numéro CNAS', () => {
  it('normalise un numéro CNAS avec espaces', () => {
    expect(formatNumeroCnas('0x 1234 567 890')).toBe('0X1234567890');
  });

  it('conserve un numéro déjà normalisé', () => {
    expect(formatNumeroCnas('0X1234567890')).toBe('0X1234567890');
  });
});

describe('Patients — Calcul d\'âge', () => {
  it('calcule correctement l\'âge', () => {
    const dateNaissance = `${new Date().getFullYear() - 30}-01-01`;
    const age = calculerAge(dateNaissance);
    expect(age).toBeGreaterThanOrEqual(29);
    expect(age).toBeLessThanOrEqual(30);
  });

  it('retourne 0 pour un nouveau-né aujourd\'hui', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculerAge(today)).toBe(0);
  });
});

describe('Patients — Téléphone algérien', () => {
  it('valide un numéro Mobilis (05)', () => {
    expect(validerTelephoneAlgerien('0551234567')).toBe(true);
  });

  it('valide un numéro Djezzy (06)', () => {
    expect(validerTelephoneAlgerien('0661234567')).toBe(true);
  });

  it('valide un numéro Ooredoo (07)', () => {
    expect(validerTelephoneAlgerien('0771234567')).toBe(true);
  });

  it('rejette un numéro fixe (02)', () => {
    expect(validerTelephoneAlgerien('0211234567')).toBe(false);
  });

  it('rejette un numéro trop court', () => {
    expect(validerTelephoneAlgerien('055123')).toBe(false);
  });

  it('tolère les espaces', () => {
    expect(validerTelephoneAlgerien('0551 23 45 67')).toBe(true);
  });
});
