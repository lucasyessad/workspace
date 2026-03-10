import { createClient } from '@/lib/supabase/server';
import type { Agency, UserProfile } from '@/types';

export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as Agency;
}

export async function getAgencyTeam(agencyId: string): Promise<UserProfile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('agency_id', agencyId)
    .order('role')
    .order('created_at');

  if (error) return [];
  return data as UserProfile[];
}

/**
 * Admin: list all agencies with basic stats
 */
export async function getAllAgencies(page = 1, perPage = 20) {
  const supabase = await createClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('agencies')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as Agency[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}
