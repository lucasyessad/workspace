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
  theme_id: string | null;
  custom_primary: string | null;
  custom_accent: string | null;
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
  videos: string[];
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
/** Profil visiteur */
export interface VisitorProfile {
  id: string;
  nom: string;
  telephone: string | null;
  wilaya_id: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Favori */
export interface Favorite {
  id: string;
  visitor_id: string;
  listing_id: string;
  created_at: string;
}

/** Historique de recherche */
export interface SearchHistoryEntry {
  id: string;
  visitor_id: string;
  query: string | null;
  filters: Record<string, string>;
  results_count: number;
  created_at: string;
}

/** Conversation */
export interface Conversation {
  id: string;
  visitor_id: string;
  agent_id: string;
  listing_id: string | null;
  dernier_message: string | null;
  dernier_message_at: string;
  visitor_non_lu: number;
  agent_non_lu: number;
  created_at: string;
}

/** Message */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

/** Rôle utilisateur */
export type UserRole = "agent" | "visitor";

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
  videoFiles: File[];
}
