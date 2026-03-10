import { createClient } from '@/lib/supabase/server';
import type { Agency, UserProfile } from '@/types';

// ============================================================================
// Tenant resolution — V1 strategy
//
// Dashboard: auth session → user_profiles.agency_id
// Mini-site:  URL param [slug] → agencies.slug
// Admin:      auth session → is_platform_admin check
// ============================================================================

export interface AuthenticatedTenant {
  user: { id: string; email: string };
  profile: UserProfile;
  agency: Agency;
}

/**
 * Resolve tenant from the authenticated user's session.
 * Used in dashboard pages. Returns null if not authenticated or no agency.
 */
export async function resolveAuthenticatedTenant(): Promise<AuthenticatedTenant | null> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.agency_id) return null;

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', profile.agency_id)
    .single();

  if (!agency) return null;

  return {
    user: { id: user.id, email: user.email ?? '' },
    profile: profile as UserProfile,
    agency: agency as Agency,
  };
}

/**
 * Resolve tenant from a public agency slug.
 * Used in mini-site pages. Returns null if agency not found or inactive.
 */
export async function resolvePublicAgency(slug: string): Promise<Agency | null> {
  const supabase = await createClient();

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .in('subscription_status', ['active', 'trial'])
    .single();

  return agency as Agency | null;
}

/**
 * Get the current user's agency_id from their profile.
 * Lightweight version for queries that just need the ID.
 */
export async function getCurrentAgencyId(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single();

  return profile?.agency_id ?? null;
}
