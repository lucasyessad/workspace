// ============================================================
// TabibPro — Types TypeScript partagés
// ============================================================

import type {
  Locale,
  UserRole,
} from '../constants';

// ---- Types de base ----

export type UUID = string;
export type DateISO = string;
export type DZD = number; // Dinar Algérien

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ---- Localisation ----

export interface LocalizedString {
  fr: string;
  ar?: string;
  ber?: string;
  en?: string;
}

export interface Address {
  ligne1: string;
  ligne2?: string;
  commune: string;
  daira?: string;
  wilaya: string;   // Code wilaya 01-58
  codePostal?: string;
  pays?: string;    // DZ par défaut
}

// ---- Wilaya & Commune ----

export interface Wilaya {
  code: string;   // 01-58
  nomFr: string;
  nomAr: string;
  nomBer?: string;
  chefLieu: string;
}

export interface Commune {
  code: string;
  nomFr: string;
  nomAr: string;
  wilayaCode: string;
  daira: string;
}

// ---- Utilisateur ----

export interface User {
  id: UUID;
  email: string;
  role: UserRole;
  languePreferee: Locale;
  mfaEnabled: boolean;
  isActive: boolean;
  createdAt: DateISO;
  updatedAt: DateISO;
}

export interface Medecin {
  id: UUID;
  userId: UUID;
  numeroCnom: string;         // Conseil National de l'Ordre des Médecins
  numeroInpe?: string;        // Identifiant National du Praticien de l'État
  nomFr: string;
  prenomFr: string;
  nomAr?: string;
  prenomAr?: string;
  specialite: string;
  secteur: 'prive' | 'public' | 'conventionne_cnas';
  conventionCnas: boolean;
  tarifConsultationDzd: DZD;
  tarifConsultationCnasDzd?: DZD;
  wilayaExercice: string;
  cachetNumerisePath?: string;
  signatureNumerisePath?: string;
  emailPro: string;           // dr.nom@tabibpro.dz ou domaine personnalisé
}

// ---- Patient ----

export interface Patient {
  id: UUID;
  numeroPatient: string;      // Format: PAT-2024-00001
  civilite: 'M.' | 'Mme' | 'Mlle';
  nomFr: string;
  prenomFr: string;
  nomAr?: string;
  prenomAr?: string;
  dateNaissance: DateISO;
  lieuNaissance?: string;
  wilayaNaissance?: string;
  sexe: 'M' | 'F';
  adresse: Address;
  telephoneMobile: string;    // Format +213
  telephoneFixe?: string;
  email?: string;
  numeroSecu?: string;        // CNAS
  numeroCasnos?: string;
  organismeAssurance: 'CNAS' | 'CASNOS' | 'mutuelle_privee' | 'aucun';
  numeroCarteChifa?: string;
  groupeSanguin?: string;
  rhesus?: string;
  allergiesConnues: string[];
  antecedentsMedicaux: Record<string, unknown>;
  antecedentsFamiliaux: Record<string, unknown>;
  languePreferee: Locale;
  consentementDonnees: boolean;
  dateConsentement?: DateISO;
  statut: 'actif' | 'archive' | 'decede';
  createdAt: DateISO;
  updatedAt: DateISO;
}

// ---- Consultation ----

export interface Constantes {
  tensionSystolique?: number;
  tensionDiastolique?: number;
  pouls?: number;
  temperature?: number;
  poids?: number;
  taille?: number;
  imc?: number;               // Calculé automatiquement
  saturationO2?: number;
  glycemieCapillaire?: number;
  perimetreAbdominal?: number;
}

export interface Consultation {
  id: UUID;
  numeroConsultation: string;
  patientId: UUID;
  medecinId: UUID;
  dateHeure: DateISO;
  motifConsultation: string;
  type: string;
  constantes?: Constantes;
  examenClinique?: string;    // HTML riche
  diagnosticPrincipal?: string;
  diagnosticsSecondaires?: string[];
  codeCim10Principal?: string;
  codesCim10Secondaires?: string[];
  notesConfidentielles?: string;
  conclusion?: string;
  conduiteATenir?: string;
  actesRealises?: ActeMedical[];
  consultationSuivantePrevue?: DateISO;
  statut: 'en_cours' | 'terminee' | 'annulee';
  dureeMinutes?: number;
  createdAt: DateISO;
  updatedAt: DateISO;
}

export interface ActeMedical {
  codeActe: string;
  libelle: string;
  tarifCnasDzd?: DZD;
}

// ---- Ordonnance ----

export interface Ordonnance {
  id: UUID;
  numeroOrdonnance: string;
  consultationId?: UUID;
  patientId: UUID;
  medecinId: UUID;
  dateCreation: DateISO;
  dateValidite: DateISO;
  typeOrdonnance: string;
  instructionsGenerales?: string;
  estRenouvellement: boolean;
  lignes: LigneOrdonnance[];
  tiersPayantCnas: boolean;
  statut: 'brouillon' | 'validee' | 'signee' | 'imprimee' | 'envoyee' | 'expiree';
  createdAt: DateISO;
}

export interface LigneOrdonnance {
  id: UUID;
  ordonnanceId: UUID;
  medicamentId?: UUID;
  nomMedicament: string;
  dci?: string;
  dosage?: string;
  formeGalenique?: string;
  posologieMatin?: number;
  posologieMidi?: number;
  posologieSoir?: number;
  posologieCoucher?: number;
  posologieTextLibre?: string;
  dureeTraitementJours?: number;
  quantite: number;
  instructionsSpecifiques?: string;
  estGenerique: boolean;
  substitutionAutorisee: boolean;
  remboursableCnas: boolean;
  tauxRemboursementCnas?: number;
  siBesoin: boolean;
  ordreAffichage: number;
}

// ---- Médicament / Pharmacopée DZ ----

export interface MedicamentPharmacpopeeDZ {
  id: UUID;
  nomCommercial: string;
  nomCommercialAr?: string;
  dci: string;
  forme: string;
  dosageUnitaire: string;
  uniteDosage: string;
  codeAtc?: string;
  fabricant: string;
  paysOrigine: string;
  estFabriqueLocalement: boolean;
  estGenerique: boolean;
  prixPublicAlgerie: DZD;
  prixHospitalier?: DZD;
  tarifReferenceCnas?: DZD;
  tauxRemboursement: 100 | 80 | 0;
  liste: 'liste_I' | 'liste_II' | 'stupefiant' | 'psychotrope' | 'en_vente_libre';
  disponibleMarcheDz: boolean;
  voieAdministration: string;
  contre_indications?: string[];
}

// ---- IA Médicale ----

export interface SuggestionIA {
  id: UUID;
  patientId: UUID;
  consultationId?: UUID;
  medecinId: UUID;
  typeRequete: 'diagnostic' | 'interactions' | 'litterature' | 'analyse_resultats' | 'protocoles' | 'redaction' | 'dictee';
  promptEnvoye: string;
  reponseRecue: string;
  tokensUtilises: number;
  modeleUtilise: string;
  tempsReponseMs: number;
  decisionMedecin: 'acceptee' | 'modifiee' | 'refusee' | 'en_attente';
  notesMedecin?: string;
  estAnonyme: boolean;
  createdAt: DateISO;
}

export interface DarijaTranslationResult {
  original: string;
  traductionFr: string;
  symptomesExtraits: string[];
  langueDetectee: 'darija_latin' | 'darija_arabe' | 'francais' | 'arabe_standard' | 'tamazight';
  confianceScore: number;
}

// ---- Synchronisation offline ----

export interface SyncItem {
  id: UUID;
  table: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: DateISO;
  synced: boolean;
  conflictResolved?: boolean;
}

export interface SyncStatus {
  pendingItems: number;
  lastSyncAt?: DateISO;
  isOnline: boolean;
  isSyncing: boolean;
}

// ---- Facturation ----

export interface Facture {
  id: UUID;
  numeroFacture: string;
  patientId: UUID;
  medecinId: UUID;
  consultationId?: UUID;
  dateFacture: DateISO;
  lignes: LigneFacture[];
  montantTotalDzd: DZD;
  montantRemboursableCnasDzd: DZD;
  resteAChargePatientDzd: DZD;
  modePaiement: string;
  feuillesSoinsCnas: boolean;
  numeroBordereauCnas?: string;
  statut: 'brouillon' | 'emise' | 'payee' | 'annulee';
  createdAt: DateISO;
}

export interface LigneFacture {
  id: UUID;
  factureId: UUID;
  description: string;
  codeActe?: string;
  quantite: number;
  prixUnitaireDzd: DZD;
  montantDzd: DZD;
  remboursableCnas: boolean;
  tauxRemboursement: number;
}

// ---- Vaccination ----

export interface Vaccination {
  id: UUID;
  patientId: UUID;
  nomVaccin: string;
  typeVaccin: string;
  estObligatoireDz: boolean;
  programmeNational: boolean;
  numeroLot?: string;
  fabricant?: string;
  dateVaccination: DateISO;
  dateRappelPrevu?: DateISO;
  doseNumero: number;
  siteInjection?: string;
  medecinVaccinateurId: UUID;
  effetsSecondairesNotes?: string;
  statut: 'effectuee' | 'planifiee' | 'refusee' | 'en_retard';
}
