'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

/**
 * Start a new conversation between a visitor and an agency.
 */
export async function startConversation(input: {
  agencyId: string;
  propertyId?: string;
  message: string;
}): Promise<ActionResult<{ conversationId: string }>> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  // Check if a conversation already exists for this visitor + agency + property
  let existingQuery = supabase
    .from('conversations')
    .select('id')
    .eq('agency_id', input.agencyId)
    .eq('visitor_user_id', user.id)
    .neq('status', 'closed');

  if (input.propertyId) {
    existingQuery = existingQuery.eq('property_id', input.propertyId);
  }

  const { data: existing } = await existingQuery.limit(1).single();

  if (existing) {
    // Add message to existing conversation
    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: existing.id,
      sender_type: 'visitor',
      sender_user_id: user.id,
      body: input.message,
    });

    if (msgError) return { success: false, error: msgError.message };
    return { success: true, data: { conversationId: existing.id } };
  }

  // Create new conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      agency_id: input.agencyId,
      property_id: input.propertyId ?? null,
      visitor_user_id: user.id,
    })
    .select('id')
    .single();

  if (convError || !conversation) {
    return { success: false, error: convError?.message ?? 'Erreur de création' };
  }

  // Add participants
  await supabase.from('conversation_participants').insert([
    {
      conversation_id: conversation.id,
      user_id: user.id,
      participant_type: 'visitor',
    },
  ]);

  // Send first message
  const { error: msgError } = await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_type: 'visitor',
    sender_user_id: user.id,
    body: input.message,
  });

  if (msgError) return { success: false, error: msgError.message };

  return { success: true, data: { conversationId: conversation.id } };
}

/**
 * Send a message in an existing conversation.
 */
export async function sendMessage(input: {
  conversationId: string;
  body: string;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  // Determine sender type based on user's profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('account_type')
    .eq('id', user.id)
    .single();

  const senderType = profile?.account_type === 'visitor' ? 'visitor' : 'agency_member';

  const { error } = await supabase.from('messages').insert({
    conversation_id: input.conversationId,
    sender_type: senderType,
    sender_user_id: user.id,
    body: input.body,
  });

  if (error) return { success: false, error: error.message };

  return { success: true };
}

/**
 * Mark a conversation as read by updating last_read_at.
 */
export async function markConversationRead(conversationId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non authentifié' };

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

/**
 * Close a conversation (agency side).
 */
export async function closeConversation(conversationId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('conversations')
    .update({ status: 'closed' })
    .eq('id', conversationId);

  if (error) return { success: false, error: error.message };

  return { success: true };
}
