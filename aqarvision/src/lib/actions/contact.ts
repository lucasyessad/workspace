'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { contactRequestSchema } from '@/lib/validators';
import type { ActionResult } from '@/types';

/**
 * Public action: submit a contact request from a mini-site.
 * Uses service client because the user is not authenticated.
 */
export async function submitContactRequest(values: unknown): Promise<ActionResult> {
  const parsed = contactRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const serviceClient = await createServiceClient();

  const { error } = await serviceClient
    .from('contact_requests')
    .insert(parsed.data);

  if (error) {
    return { success: false, error: 'Erreur lors de l\'envoi du message' };
  }

  return { success: true };
}

/**
 * Public action: submit a lead from a property page.
 * Creates both a contact_request and a lead for the agency.
 */
export async function submitPropertyInquiry(values: unknown): Promise<ActionResult> {
  const parsed = contactRequestSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const serviceClient = await createServiceClient();

  // Create the contact request
  await serviceClient.from('contact_requests').insert(parsed.data);

  // Also create a lead if agency_id is provided
  if (parsed.data.agency_id) {
    await serviceClient.from('leads').insert({
      agency_id: parsed.data.agency_id,
      property_id: parsed.data.property_id,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
      status: 'new',
      source: 'website',
    });
  }

  return { success: true };
}
