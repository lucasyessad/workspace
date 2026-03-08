/** Types principaux du projet AqarVision */

// Types de biens immobiliers algériens
export type TypeBien =
  | "Villa"
  | "Appartement F1"
  | "Appartement F2"
  | "Appartement F3"
  | "Appartement F4"
  | "Appartement F5+"
  | "Terrain"
  | "Local Commercial"
  | "Duplex"
  | "Studio"
  | "Hangar"
  | "Bureau";

// Types de documents de propriété
export type StatutDocument =
  | "Acte"
  | "Livret foncier"
  | "Concession"
  | "Promesse de vente"
  | "Timbré"
  | "Autre";

// Type de transaction
export type TypeTransaction = "Vente" | "Location" | "Location vacances";

/** Profil d'une agence immobilière */
export interface Profile {
  id: string;
  nom_agence: string;
  logo_url: string | null;
  telephone_whatsapp: string;
  wilaya_id: number;
  commune: string | null;
  adresse: string | null;
  description: string | null;
  est_verifie: boolean;
  slug_url: string;
  created_at: string;
  updated_at: string;
}

/** Annonce immobilière */
export interface Listing {
  id: string;
  titre: string;
  description: string;
  prix: number;
  surface: number;
  type_bien: TypeBien;
  type_transaction: TypeTransaction;
  statut_document: StatutDocument;
  photos: string[];
  wilaya_id: number;
  commune: string | null;
  quartier: string | null;
  etage: number | null;
  nb_pieces: number | null;
  ascenseur: boolean;
  citerne: boolean;
  garage: boolean;
  jardin: boolean;
  agent_id: string;
  est_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Wilaya d'Algérie */
export interface Wilaya {
  id: number;
  nom_fr: string;
  nom_ar: string;
  code: string;
}

/** Commune */
export interface Commune {
  id: number;
  nom_fr: string;
  nom_ar: string;
  wilaya_id: number;
}

/** Données du formulaire de création d'annonce */
export interface ListingFormData {
  titre: string;
  description: string;
  prix: number;
  surface: number;
  type_bien: TypeBien;
  type_transaction: TypeTransaction;
  statut_document: StatutDocument;
  wilaya_id: number;
  commune: string;
  quartier: string;
  etage: number | null;
  nb_pieces: number | null;
  ascenseur: boolean;
  citerne: boolean;
  garage: boolean;
  jardin: boolean;
  photos: File[];
}
