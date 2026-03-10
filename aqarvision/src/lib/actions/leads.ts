'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/guard';
import { leadFormSchema } from '@/lib/validators';
import type { ActionResult, LeadStatus } from '@/types';

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<ActionResult> {
  const tenant = await requirePermission('leads:update');
  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .eq('agency_id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour du statut' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

export async function updateLeadNotes(
  id: string,
  notes: string
): Promise<ActionResult> {
  const tenant = await requirePermission('leads:update');
  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .update({ notes })
    .eq('id', id)
    .eq('agency_id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour des notes' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}

export async function createLead(values: unknown): Promise<ActionResult> {
  const tenant = await requirePermission('leads:create');
  const parsed = leadFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('leads')
    .insert({
      ...parsed.data,
      agency_id: tenant.agency.id,
    });

  if (error) {
    return { success: false, error: 'Erreur lors de la création du lead' };
  }

  revalidatePath('/dashboard/leads');
  return { success: true };
}
