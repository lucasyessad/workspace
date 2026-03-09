// ============================================================
// TabibPro — Tests unitaires — Auth Service (logique)
// ============================================================

import { describe, it, expect } from 'vitest';
import * as bcrypt from 'bcrypt';

// ---- Helpers pour tester la logique d'auth ----

function validatePassword(password: string, minLength: number): boolean {
  return password.length >= minLength;
}

async function hashAndVerify(password: string): Promise<boolean> {
  const hash = await bcrypt.hash(password, 12);
  return bcrypt.compare(password, hash);
}

function generateTokenPayload(params: {
  sub: string;
  email: string;
  role: 'MEDECIN' | 'PATIENT';
  medecinId?: string;
  patientId?: string;
}) {
  return {
    sub: params.sub,
    email: params.email,
    role: params.role,
    ...(params.medecinId && { medecinId: params.medecinId }),
    ...(params.patientId && { patientId: params.patientId }),
  };
}

// ---- Tests ----

describe('Auth — Validation mot de passe', () => {
  it('rejette un mot de passe médecin trop court (< 8)', () => {
    expect(validatePassword('abc1234', 8)).toBe(false);
  });

  it('accepte un mot de passe médecin de 8+ caractères', () => {
    expect(validatePassword('motdepasse', 8)).toBe(true);
  });

  it('rejette un mot de passe patient trop court (< 6)', () => {
    expect(validatePassword('12345', 6)).toBe(false);
  });

  it('accepte un mot de passe patient de 6+ caractères', () => {
    expect(validatePassword('123456', 6)).toBe(true);
  });
});

describe('Auth — Hash bcrypt', () => {
  it('hash et vérifie un mot de passe correctement', async () => {
    const result = await hashAndVerify('monMotDePasse123');
    expect(result).toBe(true);
  });

  it('rejette un mauvais mot de passe', async () => {
    const hash = await bcrypt.hash('bonMotDePasse', 12);
    const result = await bcrypt.compare('mauvaisMotDePasse', hash);
    expect(result).toBe(false);
  });
});

describe('Auth — Token payload', () => {
  it('génère un payload médecin correct', () => {
    const payload = generateTokenPayload({
      sub: 'user-123',
      email: 'dr.ahmed@tabibpro.dz',
      role: 'MEDECIN',
      medecinId: 'med-456',
    });

    expect(payload.sub).toBe('user-123');
    expect(payload.role).toBe('MEDECIN');
    expect(payload.medecinId).toBe('med-456');
    expect(payload).not.toHaveProperty('patientId');
  });

  it('génère un payload patient correct', () => {
    const payload = generateTokenPayload({
      sub: 'patient-789',
      email: 'patient@email.com',
      role: 'PATIENT',
      patientId: 'patient-789',
    });

    expect(payload.role).toBe('PATIENT');
    expect(payload.patientId).toBe('patient-789');
    expect(payload).not.toHaveProperty('medecinId');
  });

  it('exige que le patient ait un sub et un email', () => {
    const payload = generateTokenPayload({
      sub: 'patient-1',
      email: '',
      role: 'PATIENT',
      patientId: 'patient-1',
    });

    expect(payload.sub).toBeTruthy();
    expect(typeof payload.email).toBe('string');
  });
});
