import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://aqarvision.dz";
const LOCALES = ["fr", "ar", "en"];

/** Génération dynamique du sitemap.xml pour le référencement */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Pages de recherche globale par locale
    ...LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/recherche`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];

  // Récupérer toutes les agences avec des annonces actives
  const { data: agences } = await supabase
    .from("profiles")
    .select("slug_url, updated_at");

  const agencePages: MetadataRoute.Sitemap = [];

  if (agences) {
    for (const agence of agences) {
      // Ajouter chaque page d'agence dans chaque locale
      for (const locale of LOCALES) {
        agencePages.push({
          url: `${BASE_URL}/${locale}/${agence.slug_url}`,
          lastModified: new Date(agence.updated_at),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }
  }

  return [...staticPages, ...agencePages];
}
