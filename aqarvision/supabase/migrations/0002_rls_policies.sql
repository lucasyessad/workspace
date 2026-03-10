-- ============================================================================
-- AqarVision V1 — RLS Policies
-- Isolation multi-tenant stricte par agency_id
-- ============================================================================

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AGENCIES
-- ============================================================================

-- Public: anyone can read active agencies (for mini-sites)
CREATE POLICY "agencies_select_public"
  ON public.agencies FOR SELECT
  USING (
    subscription_status IN ('active', 'trial')
    OR public.is_platform_admin()
    OR id = public.get_current_agency_id()
  );

-- Members can update their own agency (owner/admin only)
CREATE POLICY "agencies_update_own"
  ON public.agencies FOR UPDATE
  USING (
    id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  )
  WITH CHECK (
    id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- Only super admin can insert agencies (agency creation via server action with service role)
CREATE POLICY "agencies_insert_admin"
  ON public.agencies FOR INSERT
  WITH CHECK (public.is_platform_admin());

-- Only super admin can delete agencies
CREATE POLICY "agencies_delete_admin"
  ON public.agencies FOR DELETE
  USING (public.is_platform_admin());

-- ============================================================================
-- USER_PROFILES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

-- Members can read profiles in their agency
CREATE POLICY "profiles_select_agency"
  ON public.user_profiles FOR SELECT
  USING (agency_id = public.get_current_agency_id());

-- Super admin can read all profiles
CREATE POLICY "profiles_select_admin"
  ON public.user_profiles FOR SELECT
  USING (public.is_platform_admin());

-- Users can update their own profile (limited fields handled in app)
CREATE POLICY "profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Owner/admin can update profiles in their agency
CREATE POLICY "profiles_update_agency"
  ON public.user_profiles FOR UPDATE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  )
  WITH CHECK (
    agency_id = public.get_current_agency_id()
  );

-- Profile insert is handled by trigger (service role), but allow for invitation flow
CREATE POLICY "profiles_insert_trigger"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- PROPERTIES
-- ============================================================================

-- Public: anyone can read published properties
CREATE POLICY "properties_select_public"
  ON public.properties FOR SELECT
  USING (status = 'published');

-- Agency members can read all their agency's properties
CREATE POLICY "properties_select_agency"
  ON public.properties FOR SELECT
  USING (agency_id = public.get_current_agency_id());

-- Super admin can read all properties
CREATE POLICY "properties_select_admin"
  ON public.properties FOR SELECT
  USING (public.is_platform_admin());

-- Agency members can insert properties for their agency
CREATE POLICY "properties_insert_agency"
  ON public.properties FOR INSERT
  WITH CHECK (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'agency_editor', 'platform_super_admin')
  );

-- Owner/admin can update any property in their agency
-- Editor can update only draft properties they own
CREATE POLICY "properties_update_agency"
  ON public.properties FOR UPDATE
  USING (
    agency_id = public.get_current_agency_id()
    AND (
      public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
      OR (
        public.get_current_user_role() = 'agency_editor'
        AND status = 'draft'
        AND responsible_user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    agency_id = public.get_current_agency_id()
  );

-- Only owner/admin can delete (soft: archive) properties
CREATE POLICY "properties_delete_agency"
  ON public.properties FOR DELETE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- ============================================================================
-- PROPERTY_IMAGES
-- ============================================================================

-- Public: images for published properties
CREATE POLICY "property_images_select_public"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.status = 'published'
    )
  );

-- Agency members see all their images
CREATE POLICY "property_images_select_agency"
  ON public.property_images FOR SELECT
  USING (agency_id = public.get_current_agency_id());

-- Agency members can insert images for their properties
CREATE POLICY "property_images_insert_agency"
  ON public.property_images FOR INSERT
  WITH CHECK (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'agency_editor', 'platform_super_admin')
  );

-- Agency members can update their images
CREATE POLICY "property_images_update_agency"
  ON public.property_images FOR UPDATE
  USING (agency_id = public.get_current_agency_id())
  WITH CHECK (agency_id = public.get_current_agency_id());

-- Owner/admin can delete images
CREATE POLICY "property_images_delete_agency"
  ON public.property_images FOR DELETE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- ============================================================================
-- LEADS
-- ============================================================================

-- Agency members can read their agency's leads
CREATE POLICY "leads_select_agency"
  ON public.leads FOR SELECT
  USING (
    agency_id = public.get_current_agency_id()
    OR public.is_platform_admin()
  );

-- Leads are created from public forms (via server action with service role)
-- Or by agency members manually
CREATE POLICY "leads_insert_agency"
  ON public.leads FOR INSERT
  WITH CHECK (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'agency_editor', 'platform_super_admin')
  );

-- Agency owner/admin can update leads
CREATE POLICY "leads_update_agency"
  ON public.leads FOR UPDATE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  )
  WITH CHECK (
    agency_id = public.get_current_agency_id()
  );

-- Only owner can delete leads
CREATE POLICY "leads_delete_agency"
  ON public.leads FOR DELETE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'platform_super_admin')
  );

-- ============================================================================
-- AGENCY_INVITATIONS
-- ============================================================================

-- Agency owner/admin can see their invitations
CREATE POLICY "invitations_select_agency"
  ON public.agency_invitations FOR SELECT
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- Owner/admin can create invitations
CREATE POLICY "invitations_insert_agency"
  ON public.agency_invitations FOR INSERT
  WITH CHECK (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- Owner/admin can update (cancel) invitations
CREATE POLICY "invitations_update_agency"
  ON public.agency_invitations FOR UPDATE
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  )
  WITH CHECK (
    agency_id = public.get_current_agency_id()
  );

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

-- Agency members can view their subscription
CREATE POLICY "subscriptions_select_agency"
  ON public.subscriptions FOR SELECT
  USING (
    agency_id = public.get_current_agency_id()
    OR public.is_platform_admin()
  );

-- Only super admin can manage subscriptions (manual V1)
CREATE POLICY "subscriptions_insert_admin"
  ON public.subscriptions FOR INSERT
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "subscriptions_update_admin"
  ON public.subscriptions FOR UPDATE
  USING (public.is_platform_admin())
  WITH CHECK (true);

-- ============================================================================
-- BILLING_EVENTS
-- ============================================================================

-- Agency owner can view their billing events
CREATE POLICY "billing_events_select_agency"
  ON public.billing_events FOR SELECT
  USING (
    (agency_id = public.get_current_agency_id()
      AND public.get_current_user_role() IN ('agency_owner', 'platform_super_admin'))
    OR public.is_platform_admin()
  );

-- Only super admin can insert billing events
CREATE POLICY "billing_events_insert_admin"
  ON public.billing_events FOR INSERT
  WITH CHECK (public.is_platform_admin());

-- ============================================================================
-- CONTACT_REQUESTS
-- ============================================================================

-- Agency members can read contact requests for their agency
CREATE POLICY "contact_requests_select_agency"
  ON public.contact_requests FOR SELECT
  USING (
    agency_id = public.get_current_agency_id()
    OR public.is_platform_admin()
  );

-- Anyone can insert a contact request (public forms)
-- Note: agency_id must be provided for agency-specific requests
CREATE POLICY "contact_requests_insert_public"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- AUDIT_LOGS
-- ============================================================================

-- Only super admin can read audit logs
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT
  USING (public.is_platform_admin());

-- Agency owner can read their agency's audit logs
CREATE POLICY "audit_logs_select_agency"
  ON public.audit_logs FOR SELECT
  USING (
    agency_id = public.get_current_agency_id()
    AND public.get_current_user_role() = 'agency_owner'
  );

-- Authenticated users can insert audit logs (for their own actions)
CREATE POLICY "audit_logs_insert_auth"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
