'use server';

import { createClient } from '@/lib/supabase/server';
import type { Property, PropertyWithAgency, PaginatedResult, SearchFilters } from '@/types';

/**
 * Global public search across all agencies (portail public).
 * Only returns published properties from active agencies.
 */
export async function searchProperties(
  filters: SearchFilters = {},
  page = 1,
  perPage = 12
): Promise<PaginatedResult<PropertyWithAgency>> {
  const supabase = await createClient();

  let query = supabase
    .from('properties')
    .select(
      `*, agency:agencies!inner(id, name, slug, logo_url, is_verified)`,
      { count: 'exact' }
    )
    .eq('status', 'published');

  // Text search on title
  if (filters.query) {
    query = query.ilike('title', `%${filters.query}%`);
  }

  if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.wilaya) query = query.eq('wilaya', filters.wilaya);
  if (filters.commune) query = query.ilike('commune', `%${filters.commune}%`);
  if (filters.priceMin) query = query.gte('price', filters.priceMin);
  if (filters.priceMax) query = query.lte('price', filters.priceMax);
  if (filters.surfaceMin) query = query.gte('surface', filters.surfaceMin);
  if (filters.surfaceMax) query = query.lte('surface', filters.surfaceMax);
  if (filters.rooms) query = query.gte('rooms', filters.rooms);
  if (filters.bedrooms) query = query.gte('bedrooms', filters.bedrooms);
  if (filters.isFeatured) query = query.eq('is_featured', true);

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'surface_desc':
      query = query.order('surface', { ascending: false, nullsFirst: false });
      break;
    case 'newest':
    default:
      query = query
        .order('is_featured', { ascending: false })
        .order('published_at', { ascending: false });
      break;
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    data: (data ?? []) as unknown as PropertyWithAgency[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

/**
 * Get similar properties (same wilaya, same transaction type, similar price range).
 */
export async function getSimilarProperties(
  property: Property,
  limit = 4
): Promise<PropertyWithAgency[]> {
  const supabase = await createClient();

  const priceMin = property.price * 0.7;
  const priceMax = property.price * 1.3;

  const { data } = await supabase
    .from('properties')
    .select(`*, agency:agencies!inner(id, name, slug, logo_url, is_verified)`)
    .eq('status', 'published')
    .eq('wilaya', property.wilaya)
    .eq('transaction_type', property.transaction_type)
    .gte('price', priceMin)
    .lte('price', priceMax)
    .neq('id', property.id)
    .limit(limit);

  return (data ?? []) as unknown as PropertyWithAgency[];
}
