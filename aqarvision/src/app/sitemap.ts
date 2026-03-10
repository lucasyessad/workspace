import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aqarvision.dz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/features`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/demo`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/recherche`, changeFrequency: 'daily', priority: 0.9 },
  ];

  // Agency pages
  const { data: agencies } = await supabase
    .from('agencies')
    .select('slug, updated_at')
    .in('subscription_status', ['active', 'trial']);

  const agencyPages: MetadataRoute.Sitemap = (agencies ?? []).flatMap((agency) => [
    {
      url: `${BASE_URL}/agence/${agency.slug}`,
      lastModified: agency.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/agence/${agency.slug}/annonces`,
      lastModified: agency.updated_at,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]);

  // Published properties
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, agency_id, updated_at, agencies!inner(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000);

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${BASE_URL}/agence/${(p as any).agencies.slug}/annonces/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...agencyPages, ...propertyPages];
}
