import { createClient } from '@/lib/supabase/server';
import type { Conversation, Message, ConversationWithDetails } from '@/types';

/**
 * Get conversations for the current user (visitor or agency member).
 */
export async function getUserConversations(): Promise<ConversationWithDetails[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get conversations where the user is a participant
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (!participations?.length) return [];

  const conversationIds = participations.map(p => p.conversation_id);

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      agency:agencies(id, name, slug, logo_url),
      property:properties(id, title, slug)
    `)
    .in('id', conversationIds)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (!conversations) return [];

  // Get last message and unread count for each conversation
  const result: ConversationWithDetails[] = [];
  for (const conv of conversations) {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('body, sender_type, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get participant's last_read_at
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('last_read_at')
      .eq('conversation_id', conv.id)
      .eq('user_id', user.id)
      .single();

    let unreadCount = 0;
    if (participant?.last_read_at) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .gt('created_at', participant.last_read_at)
        .neq('sender_user_id', user.id);
      unreadCount = count ?? 0;
    }

    result.push({
      ...conv,
      agency: conv.agency as ConversationWithDetails['agency'],
      property: conv.property as ConversationWithDetails['property'],
      last_message: lastMsg as ConversationWithDetails['last_message'],
      unread_count: unreadCount,
    });
  }

  return result;
}

/**
 * Get messages for a conversation (with auth check via RLS).
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return (data ?? []) as Message[];
}

/**
 * Get a single conversation by ID.
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  return data as Conversation | null;
}

/**
 * Get agency inbox (for dashboard).
 */
export async function getAgencyInbox(agencyId: string): Promise<ConversationWithDetails[]> {
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      agency:agencies(id, name, slug, logo_url),
      property:properties(id, title, slug)
    `)
    .eq('agency_id', agencyId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (!conversations) return [];

  const result: ConversationWithDetails[] = [];
  for (const conv of conversations) {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('body, sender_type, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    result.push({
      ...conv,
      agency: conv.agency as ConversationWithDetails['agency'],
      property: conv.property as ConversationWithDetails['property'],
      last_message: lastMsg as ConversationWithDetails['last_message'],
      unread_count: 0,
    });
  }

  return result;
}
