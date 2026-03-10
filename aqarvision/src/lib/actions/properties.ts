'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/guard';
import { propertyFormSchema, type PropertyFormValues } from '@/lib/validators';
import type { ActionResult, Property } from '@/types';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export async function createProperty(values: PropertyFormValues): Promise<ActionResult<Property>> {
  const tenant = await requirePermission('properties:create');
  const parsed = propertyFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const supabase = await createClient();
  const slug = generateSlug(parsed.data.title) + '-' + Date.now().toString(36);

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...parsed.data,
      slug,
      agency_id: tenant.agency.id,
      responsible_user_id: tenant.user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Erreur lors de la création du bien' };
  }

  revalidatePath('/dashboard/listings');
  return { success: true, data: data as Property };
}

export async function updateProperty(
  id: string,
  values: Partial<PropertyFormValues>
): Promise<ActionResult> {
  const tenant = await requirePermission('properties:update');
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('agency_id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath('/dashboard/listings');
  revalidatePath(`/dashboard/listings/${id}`);
  return { success: true };
}

export async function publishProperty(id: string): Promise<ActionResult> {
  const tenant = await requirePermission('properties:publish');
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({ status: 'published' })
    .eq('id', id)
    .eq('agency_id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la publication' };
  }

  revalidatePath('/dashboard/listings');
  return { success: true };
}

export async function archiveProperty(id: string): Promise<ActionResult> {
  const tenant = await requirePermission('properties:delete');
  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('agency_id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de l\'archivage' };
  }

  revalidatePath('/dashboard/listings');
  return { success: true };
}
