-- ============================================================================
-- AqarVision V1 — Storage Setup
-- Public bucket for all property & agency images
-- Path structure: agencies/{agency_id}/...
-- ============================================================================

-- Create public bucket for all media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- ============================================================================
-- Storage Policies
-- ============================================================================

-- Path convention:
--   agencies/{agency_id}/branding/logo.{ext}
--   agencies/{agency_id}/branding/cover.{ext}
--   agencies/{agency_id}/properties/{property_id}/{filename}.{ext}

-- Anyone can read from the public bucket
CREATE POLICY "media_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Authenticated agency members can upload to their agency folder
CREATE POLICY "media_insert_agency"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'agencies'
    AND (storage.foldername(name))[2] = public.get_current_agency_id()::text
  );

-- Agency members can update their own files
CREATE POLICY "media_update_agency"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'agencies'
    AND (storage.foldername(name))[2] = public.get_current_agency_id()::text
  );

-- Owner/admin can delete files in their agency folder
CREATE POLICY "media_delete_agency"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'agencies'
    AND (storage.foldername(name))[2] = public.get_current_agency_id()::text
    AND public.get_current_user_role() IN ('agency_owner', 'agency_admin', 'platform_super_admin')
  );

-- Super admin can manage all files
CREATE POLICY "media_all_admin"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'media'
    AND public.is_platform_admin()
  );
