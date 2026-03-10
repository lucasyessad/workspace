'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

/**
 * Toggle a property as favorite.
 */
export async function toggleFavorite(propertyId: string): Promise<ActionResult<{ isFavorited: boolean }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .single();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: { isFavorited: false } };
  }

  // Add
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, property_id: propertyId });

  if (error) return { success: false, error: error.message };
  return { success: true, data: { isFavorited: true } };
}
