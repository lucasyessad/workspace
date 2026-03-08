// ============================================================
// TabibPro — Constantes globales
// Édition Algérie
// ============================================================

// Locales supportées
export const SUPPORTED_LOCALES = ['fr', 'ar', 'ber', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';

// Pays
export const COUNTRY_DZ = 'DZ';
export const DEFAULT_COUNTRY = COUNTRY_DZ;

// Devise
export const CURRENCY_DZD = 'DZD';
export const DEFAULT_CURRENCY = CURRENCY_DZD;

// Fuseau horaire algérien (UTC+1, pas de changement d'heure)
export const TIMEZONE_ALGIERS = 'Africa/Algiers';
export const DEFAULT_TIMEZONE = TIMEZONE_ALGIERS;

// Weekend algérien : Vendredi (5) + Samedi (6)
// En JS : 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi
export const WEEKEND_DAYS_DZ = [5, 6] as const; // Vendredi + Samedi
export const WORK_DAYS_DZ = [0, 1, 2, 3, 4] as const; // Dimanche à Jeudi

// Wilayas d'Algérie (58 wilayas)
export const WILAYAS_COUNT = 58;
export const COMMUNES_COUNT = 1541;

// Formats de numéros de téléphone algériens
export const PHONE_REGEX_DZ = /^(\+213|0)(5|6|7)[0-9]{8}$/;
export const PHONE_PREFIX_DZ = '+213';

// Numéros de carte Chifa (carte santé algérienne)
export const CHIFA_CARD_REGEX = /^[0-9]{20}$/;

// Numéros CNAS / CASNOS
export const CNAS_NUMBER_REGEX = /^[0-9]{12}$/;

// Organismes d'assurance maladie en Algérie
export const INSURANCE_ORGS = {
  CNAS: 'CNAS',           // Caisse Nationale des Assurances Sociales (salariés)
  CASNOS: 'CASNOS',       // Caisse Nationale de Sécurité Sociale des Non-Salariés
  MUTUELLES: 'mutuelle_privee',
  NONE: 'aucun',
} as const;

// Types d'ordonnances algériennes
export const PRESCRIPTION_TYPES = {
  STANDARD: 'standard',
  BIZONE: 'bizone',           // Remboursable / Non remboursable
  CHRONIQUE: 'chronique',     // ALD - Affection Longue Durée
  STUPEFIANTS: 'stupefiant',  // Carnet à souches réglementé
  MAGISTRALE: 'magistrale',   // Préparations magistrales
} as const;

// Modes de paiement algériens
export const PAYMENT_METHODS_DZ = {
  ESPECES: 'especes',
  CHEQUE: 'cheque',
  CCP: 'ccp',                 // Compte Courant Postal
  CIB: 'cib',                 // Carte Interbancaire algérienne
  EDAHABIA: 'edahabia',       // Carte Algérie Poste
  BARIDIMOB: 'baridimob',     // Paiement mobile Algérie Poste
  VIREMENT: 'virement_bancaire',
} as const;

// Taux de remboursement CNAS
export const CNAS_REIMBURSEMENT_RATES = {
  FULL: 100,    // Médicaments essentiels
  PARTIAL: 80,  // Médicaments ordinaires
  NONE: 0,      // Non remboursable
} as const;

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'admin',
  MEDECIN: 'medecin',
  SECRETAIRE: 'secretaire',
  INFIRMIER: 'infirmier',
  PATIENT: 'patient',
} as const;
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Statuts de rendez-vous
export const RDV_STATUS = {
  PLANIFIE: 'planifie',
  CONFIRME: 'confirme',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ANNULE: 'annule',
  ABSENT: 'absent',
} as const;

// Types de consultation
export const CONSULTATION_TYPES = {
  CONSULTATION: 'consultation',
  URGENCE: 'urgence',
  CONTROLE: 'controle',
  SUIVI_CHRONIQUE: 'suivi_chronique',
  TELECONSULTATION: 'teleconsultation',
  VISITE_DOMICILE: 'visite_domicile',
} as const;

// Groupes sanguins
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// Statuts des médicaments
export const DRUG_STATUS = {
  DISPONIBLE: 'disponible',
  STOCK_FAIBLE: 'stock_faible',
  EN_RUPTURE: 'en_rupture',
  PERIME: 'perime',
  RETIRE: 'retire',
} as const;

// Langues détectées pour le darija
export const DETECTED_LANGUAGES = {
  DARIJA_LATIN: 'darija_latin',
  DARIJA_ARABE: 'darija_arabe',
  FRANCAIS: 'francais',
  ARABE_STANDARD: 'arabe_standard',
  ANGLAIS: 'anglais',
  TAMAZIGHT: 'tamazight',
} as const;

// Indicateurs de connectivité
export const CONNECTIVITY_STATUS = {
  ONLINE_SYNCED: 'online_synced',
  ONLINE_SYNCING: 'online_syncing',
  OFFLINE: 'offline',
} as const;

// Journée de consultation maximale (horaire tardif en Algérie — privé)
export const MAX_CONSULTATION_HOUR = 21; // 21h00
export const MIN_CONSULTATION_HOUR = 8;  // 8h00

// CIM-10 prefix validation
export const ICD10_REGEX = /^[A-Z][0-9]{2}(\.[0-9]{1,4})?$/;
