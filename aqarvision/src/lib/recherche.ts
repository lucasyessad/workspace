import { createClient } from "@/lib/supabase/server";
import type { Listing, Profile } from "@/types";

export interface FiltresRecherche {
  q?: string;
  transaction?: string;
  type_bien?: string;
  wilaya?: string;
  prix_min?: string;
  prix_max?: string;
  surface_min?: string;
  surface_max?: string;
  nb_pieces?: string;
  document?: string;
  ascenseur?: string;
  garage?: string;
  jardin?: string;
  citerne?: string;
  tri?: string;
  page?: string;
}

export interface ListingAvecAgence extends Listing {
  profiles: Pick<Profile, "nom_agence" | "slug_url" | "logo_url" | "est_verifie">;
}

export interface ResultatsRecherche {
  annonces: ListingAvecAgence[];
  total: number;
  page: number;
  parPage: number;
}

const PAR_PAGE = 12;

/** Recherche globale côté serveur avec filtres URL */
export async function rechercherAnnonces(
  filtres: FiltresRecherche
): Promise<ResultatsRecherche> {
  const supabase = createClient();
  const page = Math.max(1, parseInt(filtres.page || "1", 10));
  const offset = (page - 1) * PAR_PAGE;

  // Build query with profile join
  let query = supabase
    .from("listings")
    .select(
      "*, profiles!inner(nom_agence, slug_url, logo_url, est_verifie)",
      { count: "exact" }
    )
    .eq("est_active", true);

  // Text search (titre, description, commune)
  if (filtres.q) {
    const q = `%${filtres.q}%`;
    query = query.or(`titre.ilike.${q},description.ilike.${q},commune.ilike.${q}`);
  }

  // Transaction type
  if (filtres.transaction && filtres.transaction !== "tous") {
    query = query.eq("type_transaction", filtres.transaction);
  }

  // Property type
  if (filtres.type_bien) {
    query = query.eq("type_bien", filtres.type_bien);
  }

  // Wilaya
  if (filtres.wilaya) {
    query = query.eq("wilaya_id", parseInt(filtres.wilaya, 10));
  }

  // Price range
  if (filtres.prix_min) {
    query = query.gte("prix", parseInt(filtres.prix_min, 10));
  }
  if (filtres.prix_max) {
    query = query.lte("prix", parseInt(filtres.prix_max, 10));
  }

  // Surface range
  if (filtres.surface_min) {
    query = query.gte("surface", parseInt(filtres.surface_min, 10));
  }
  if (filtres.surface_max) {
    query = query.lte("surface", parseInt(filtres.surface_max, 10));
  }

  // Rooms
  if (filtres.nb_pieces) {
    query = query.gte("nb_pieces", parseInt(filtres.nb_pieces, 10));
  }

  // Document status
  if (filtres.document) {
    query = query.eq("statut_document", filtres.document);
  }

  // Boolean amenities
  if (filtres.ascenseur === "1") query = query.eq("ascenseur", true);
  if (filtres.garage === "1") query = query.eq("garage", true);
  if (filtres.jardin === "1") query = query.eq("jardin", true);
  if (filtres.citerne === "1") query = query.eq("citerne", true);

  // Sorting
  switch (filtres.tri) {
    case "prix_asc":
      query = query.order("prix", { ascending: true });
      break;
    case "prix_desc":
      query = query.order("prix", { ascending: false });
      break;
    case "surface_desc":
      query = query.order("surface", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + PAR_PAGE - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Erreur recherche:", error);
    return { annonces: [], total: 0, page, parPage: PAR_PAGE };
  }

  return {
    annonces: (data as unknown as ListingAvecAgence[]) || [],
    total: count || 0,
    page,
    parPage: PAR_PAGE,
  };
}
