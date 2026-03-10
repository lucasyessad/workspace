'use server';

import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema } from '@/lib/validators';
import type { ActionResult } from '@/types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function login(values: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: 'Email ou mot de passe incorrect' };
  }

  redirect('/dashboard');
}

export async function signup(values: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message };
  }

  const supabase = await createClient();
  const serviceClient = await createServiceClient();

  // 1. Create the user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        role: 'agency_owner',
      },
    },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message ?? 'Erreur lors de la création du compte' };
  }

  // 2. Create the agency (using service role to bypass RLS)
  const slug = generateSlug(parsed.data.agency_name) + '-' + Date.now().toString(36);

  const { data: agency, error: agencyError } = await serviceClient
    .from('agencies')
    .insert({
      name: parsed.data.agency_name,
      slug,
      phone: parsed.data.phone,
      email: parsed.data.email,
      wilaya: parsed.data.wilaya,
    })
    .select()
    .single();

  if (agencyError || !agency) {
    return { success: false, error: 'Erreur lors de la création de l\'agence' };
  }

  // 3. Link user profile to agency
  const { error: profileError } = await serviceClient
    .from('user_profiles')
    .update({
      agency_id: agency.id,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      role: 'agency_owner',
    })
    .eq('id', authData.user.id);

  if (profileError) {
    return { success: false, error: 'Erreur lors de la liaison du profil' };
  }

  // 4. Create initial subscription
  await serviceClient
    .from('subscriptions')
    .insert({
      agency_id: agency.id,
      plan_code: 'starter',
      status: 'trial',
      billing_mode: 'manual',
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
