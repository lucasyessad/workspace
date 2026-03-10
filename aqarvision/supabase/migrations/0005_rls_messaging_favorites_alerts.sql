-- ============================================================================
-- AqarVision V1.1 — RLS for Messaging, Favorites, Saved Searches
-- ============================================================================

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

-- Agency members see their agency's conversations
CREATE POLICY "conversations_select_agency"
  ON public.conversations FOR SELECT
  USING (agency_id = public.get_current_agency_id());

-- Visitors see conversations they participate in
CREATE POLICY "conversations_select_visitor"
  ON public.conversations FOR SELECT
  USING (visitor_user_id = auth.uid());

-- Super admin sees all
CREATE POLICY "conversations_select_admin"
  ON public.conversations FOR SELECT
  USING (public.is_platform_admin());

-- Authenticated users can create conversations (visitors contacting agencies)
CREATE POLICY "conversations_insert_auth"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (visitor_user_id = auth.uid() OR agency_id = public.get_current_agency_id())
  );

-- Agency members can update conversation status
CREATE POLICY "conversations_update_agency"
  ON public.conversations FOR UPDATE
  USING (agency_id = public.get_current_agency_id())
  WITH CHECK (agency_id = public.get_current_agency_id());

-- ============================================================================
-- CONVERSATION_PARTICIPANTS
-- ============================================================================

-- Users can see participant lists for conversations they're part of
CREATE POLICY "conv_participants_select_own"
  ON public.conversation_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id)
  );

-- Participants can be added by conversation members
CREATE POLICY "conv_participants_insert"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own read status
CREATE POLICY "conv_participants_update_own"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- MESSAGES
-- ============================================================================

-- Participants can read messages in their conversations
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

-- Agency members can read messages in their agency's conversations
CREATE POLICY "messages_select_agency"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.agency_id = public.get_current_agency_id()
    )
  );

-- Participants can send messages
CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_user_id = auth.uid()
    AND public.is_conversation_participant(conversation_id)
  );

-- Super admin sees all messages
CREATE POLICY "messages_select_admin"
  ON public.messages FOR SELECT
  USING (public.is_platform_admin());

-- ============================================================================
-- FAVORITES
-- ============================================================================

-- Users see their own favorites
CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  USING (user_id = auth.uid());

-- Users can add favorites
CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove their favorites
CREATE POLICY "favorites_delete_own"
  ON public.favorites FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- SAVED_SEARCHES
-- ============================================================================

-- Users see their own saved searches
CREATE POLICY "saved_searches_select_own"
  ON public.saved_searches FOR SELECT
  USING (user_id = auth.uid());

-- Users can create saved searches
CREATE POLICY "saved_searches_insert_own"
  ON public.saved_searches FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own saved searches
CREATE POLICY "saved_searches_update_own"
  ON public.saved_searches FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own saved searches
CREATE POLICY "saved_searches_delete_own"
  ON public.saved_searches FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- VISITOR_PROFILES
-- ============================================================================

-- Users see their own visitor profile
CREATE POLICY "visitor_profiles_select_own"
  ON public.visitor_profiles FOR SELECT
  USING (id = auth.uid());

-- Users can create their own visitor profile
CREATE POLICY "visitor_profiles_insert_own"
  ON public.visitor_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own visitor profile
CREATE POLICY "visitor_profiles_update_own"
  ON public.visitor_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
