import { createClient } from '@/lib/supabase/server';
import type { SavedSearch } from '@/types';

/**
 * Get user's saved searches / alerts.
 */
export async function getUserSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('saved_searches')
    .select('*')
    .order('created_at', { ascending: false });

  return (data ?? []) as SavedSearch[];
}

/**
 * Get active saved searches (for alert processing).
 */
export async function getActiveSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (data ?? []) as SavedSearch[];
}
