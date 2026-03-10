'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/guard';
import { agencyBrandingSchema, agencyLuxuryBrandingSchema } from '@/lib/validators';
import type { ActionResult } from '@/types';

export async function updateAgencyBranding(values: unknown): Promise<ActionResult> {
  const tenant = await requirePermission('branding:update');

  const isEnterprise = tenant.agency.active_plan === 'enterprise';
  const schema = isEnterprise ? agencyLuxuryBrandingSchema : agencyBrandingSchema;
  const parsed = schema.safeParse(values);

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('agencies')
    .update(parsed.data)
    .eq('id', tenant.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour du branding' };
  }

  revalidatePath('/dashboard/branding');
  revalidatePath(`/agence/${tenant.agency.slug}`);
  return { success: true };
}

export async function updateAgencyLogo(formData: FormData): Promise<ActionResult<string>> {
  const tenant = await requirePermission('branding:update');
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Le fichier dépasse 5 Mo' };
  }

  const supabase = await createClient();
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `agencies/${tenant.agency.id}/branding/logo.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: 'Erreur lors de l\'upload' };
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  await supabase
    .from('agencies')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', tenant.agency.id);

  revalidatePath('/dashboard/branding');
  return { success: true, data: urlData.publicUrl };
}

export async function updateAgencyCoverImage(formData: FormData): Promise<ActionResult<string>> {
  const tenant = await requirePermission('branding:update');

  if (tenant.agency.active_plan !== 'enterprise') {
    return { success: false, error: 'Fonctionnalité réservée au pack Société' };
  }

  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Le fichier dépasse 10 Mo' };
  }

  const supabase = await createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `agencies/${tenant.agency.id}/branding/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: 'Erreur lors de l\'upload' };
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  await supabase
    .from('agencies')
    .update({ cover_image_url: urlData.publicUrl })
    .eq('id', tenant.agency.id);

  revalidatePath('/dashboard/branding');
  revalidatePath(`/agence/${tenant.agency.slug}`);
  return { success: true, data: urlData.publicUrl };
}
