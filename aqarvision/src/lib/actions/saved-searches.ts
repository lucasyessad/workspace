'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, SearchFilters, AlertFrequency } from '@/types';

/**
 * Save a search with optional alert.
 */
export async function saveSearch(input: {
  name: string;
  filters: SearchFilters;
  frequency: AlertFrequency;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: user.id,
      name: input.name,
      filters: input.filters as Record<string, unknown>,
      frequency: input.frequency,
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: { id: data.id } };
}

/**
 * Toggle a saved search alert on/off.
 */
export async function toggleSearchAlert(searchId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('saved_searches')
    .select('is_active')
    .eq('id', searchId)
    .single();

  if (!existing) return { success: false, error: 'Recherche introuvable' };

  const { error } = await supabase
    .from('saved_searches')
    .update({ is_active: !existing.is_active })
    .eq('id', searchId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Delete a saved search.
 */
export async function deleteSavedSearch(searchId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
