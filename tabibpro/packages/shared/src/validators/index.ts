// ============================================================
// TabibPro — Validateurs Zod partagés
// ============================================================

import { z } from 'zod';
import { PHONE_REGEX_DZ, CHIFA_CARD_REGEX, ICD10_REGEX } from '../constants';

// ---- Téléphone algérien ----
export const phoneAlgerienSchema = z
  .string()
  .regex(PHONE_REGEX_DZ, 'Numéro de téléphone algérien invalide (format: +213XXXXXXXXX ou 0XXXXXXXXX)');

// ---- Code wilaya ----
export const codeWilayaSchema = z
  .string()
  .regex(/^(0[1-9]|[1-4][0-9]|5[0-8])$/, 'Code wilaya invalide (01-58)');

// ---- Carte Chifa ----
export const carteChifaSchema = z
  .string()
  .regex(CHIFA_CARD_REGEX, 'Numéro de carte Chifa invalide (20 chiffres)');

// ---- Code CIM-10 ----
export const codeCim10Schema = z
  .string()
  .regex(ICD10_REGEX, 'Code CIM-10 invalide (ex: J45, J45.0)');

// ---- DZD (Dinar Algérien) ----
export const dzdSchema = z
  .number()
  .nonnegative('Le montant ne peut pas être négatif')
  .finite('Le montant doit être un nombre fini');

// ---- Locale ----
export const localeSchema = z.enum(['fr', 'ar', 'ber', 'en']);

// ---- Patient de base ----
export const createPatientSchema = z.object({
  civilite: z.enum(['M.', 'Mme', 'Mlle']),
  nomFr: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  prenomFr: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(100),
  nomAr: z.string().max(100).optional(),
  prenomAr: z.string().max(100).optional(),
  dateNaissance: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  sexe: z.enum(['M', 'F']),
  wilayaNaissance: codeWilayaSchema.optional(),
  telephoneMobile: phoneAlgerienSchema,
  telephoneFixe: phoneAlgerienSchema.optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  numeroCarteChifa: carteChifaSchema.optional().or(z.literal('')),
  organismeAssurance: z.enum(['CNAS', 'CASNOS', 'mutuelle_privee', 'aucun']),
  groupeSanguin: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  adresseLigne1: z.string().min(5).max(200),
  adresseLigne2: z.string().max(200).optional(),
  commune: z.string().min(2).max(100),
  wilaya: codeWilayaSchema,
  languePreferee: localeSchema.default('fr'),
  consentementDonnees: z.boolean().refine((v) => v === true, {
    message: 'Le consentement est obligatoire (Loi 18-07)',
  }),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

// ---- Login ----
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min. 8 caractères)'),
  mfaCode: z.string().length(6, 'Code MFA invalide').optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;

// ---- Consultation ----
export const createConsultationSchema = z.object({
  patientId: z.string().uuid(),
  dateHeure: z.string().datetime(),
  motifConsultation: z.string().min(3).max(500),
  type: z.enum([
    'consultation',
    'urgence',
    'controle',
    'suivi_chronique',
    'teleconsultation',
    'visite_domicile',
  ]),
  constantes: z
    .object({
      tensionSystolique: z.number().int().min(50).max(300).optional(),
      tensionDiastolique: z.number().int().min(30).max(200).optional(),
      pouls: z.number().int().min(20).max(300).optional(),
      temperature: z.number().min(30).max(45).optional(),
      poids: z.number().min(0.5).max(500).optional(),
      taille: z.number().min(20).max(300).optional(),
      saturationO2: z.number().min(50).max(100).optional(),
      glycemieCapillaire: z.number().min(0).max(50).optional(),
      perimetreAbdominal: z.number().min(20).max(300).optional(),
    })
    .optional(),
});

export type CreateConsultationDto = z.infer<typeof createConsultationSchema>;
