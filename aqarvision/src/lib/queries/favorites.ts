import { createClient } from '@/lib/supabase/server';
import type { FavoriteWithProperty, PropertyWithAgency } from '@/types';

/**
 * Get user's favorites with property details.
 */
export async function getUserFavorites(): Promise<FavoriteWithProperty[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('favorites')
    .select(`
      *,
      property:properties(
        *,
        agency:agencies(id, name, slug, logo_url, is_verified)
      )
    `)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as FavoriteWithProperty[];
}

/**
 * Check if a property is favorited by the current user.
 */
export async function isPropertyFavorited(propertyId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('property_id', propertyId);

  return (count ?? 0) > 0;
}

/**
 * Get favorite property IDs for the current user (for batch checking).
 */
export async function getUserFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('favorites')
    .select('property_id');

  return new Set((data ?? []).map(f => f.property_id));
}
