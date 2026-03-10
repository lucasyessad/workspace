import { createClient } from '@/lib/supabase/server';
import type { Lead, LeadWithProperty, PaginatedResult, LeadStatus } from '@/types';

export async function getAgencyLeads(
  agencyId: string,
  filters: { status?: LeadStatus } = {},
  page = 1,
  perPage = 20
): Promise<PaginatedResult<LeadWithProperty>> {
  const supabase = await createClient();

  let query = supabase
    .from('leads')
    .select('*, property:properties(id, title, slug)', { count: 'exact' })
    .eq('agency_id', agencyId);

  if (filters.status) query = query.eq('status', filters.status);

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as LeadWithProperty[],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getLeadsStats(agencyId: string) {
  const supabase = await createClient();

  const [total, newLeads, converted] = await Promise.all([
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'new'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'converted'),
  ]);

  return {
    total: total.count ?? 0,
    new: newLeads.count ?? 0,
    converted: converted.count ?? 0,
  };
}
