import { createClient } from '@/lib/supabase/server';
import type { Property, PropertyWithImages, PaginatedResult, PropertyFilters } from '@/types';

/**
 * Fetch properties for the current agency (dashboard).
 * RLS ensures tenant isolation.
 */
export async function getAgencyProperties(
  filters: PropertyFilters = {},
  page = 1,
  perPage = 20
): Promise<PaginatedResult<Property>> {
  const supabase = await createClient();

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.wilaya) query = query.eq('wilaya', filters.wilaya);
  if (filters.priceMin) query = query.gte('price', filters.priceMin);
  if (filters.priceMax) query = query.lte('price', filters.priceMax);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Property[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

/**
 * Get a single property by ID (dashboard context — RLS handles auth).
 */
export async function getPropertyById(id: string): Promise<PropertyWithImages | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !property) return null;

  const { data: images } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', id)
    .order('sort_order');

  return {
    ...(property as Property),
    images: images ?? [],
  };
}

/**
 * Get published properties for a public agency mini-site.
 */
export async function getPublicProperties(
  agencyId: string,
  filters: PropertyFilters = {},
  page = 1,
  perPage = 12
): Promise<PaginatedResult<Property>> {
  const supabase = await createClient();

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('agency_id', agencyId)
    .eq('status', 'published');

  if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);
  if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
  if (filters.wilaya) query = query.eq('wilaya', filters.wilaya);
  if (filters.priceMin) query = query.gte('price', filters.priceMin);
  if (filters.priceMax) query = query.lte('price', filters.priceMax);
  if (filters.rooms) query = query.gte('rooms', filters.rooms);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Property[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

/**
 * Get a single published property by slug for the public mini-site.
 */
export async function getPublicPropertyBySlug(
  agencyId: string,
  propertySlug: string
): Promise<PropertyWithImages | null> {
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('slug', propertySlug)
    .eq('status', 'published')
    .single();

  if (error || !property) return null;

  const { data: images } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', property.id)
    .order('sort_order');

  return {
    ...(property as Property),
    images: images ?? [],
  };
}

/**
 * Dashboard KPIs
 */
export async function getPropertiesStats(agencyId: string) {
  const supabase = await createClient();

  const [published, draft, total] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'published'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'draft'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
  ]);

  return {
    published: published.count ?? 0,
    draft: draft.count ?? 0,
    total: total.count ?? 0,
  };
}
