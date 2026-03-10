-- ============================================================================
-- AqarVision V1 — Initial Schema
-- Multi-tenant SaaS immobilier pour l'Algérie
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'platform_super_admin',
  'agency_owner',
  'agency_admin',
  'agency_editor'
);

CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

CREATE TYPE property_status AS ENUM (
  'draft',
  'published',
  'archived',
  'sold',
  'rented'
);

CREATE TYPE transaction_type AS ENUM (
  'sale',
  'rent',
  'vacation_rent'
);

CREATE TYPE property_type AS ENUM (
  'apartment',
  'house',
  'villa',
  'studio',
  'land',
  'commercial',
  'office',
  'garage',
  'warehouse',
  'other'
);

CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'visit_scheduled',
  'negotiation',
  'converted',
  'lost'
);

CREATE TYPE lead_source AS ENUM (
  'website',
  'phone',
  'walk_in',
  'referral',
  'social_media',
  'other'
);

CREATE TYPE subscription_status AS ENUM (
  'trial',
  'active',
  'past_due',
  'cancelled',
  'expired'
);

CREATE TYPE subscription_plan AS ENUM (
  'starter',
  'pro',
  'enterprise'
);

CREATE TYPE billing_mode AS ENUM (
  'manual',
  'online'
);

CREATE TYPE invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'cancelled'
);

CREATE TYPE contact_request_type AS ENUM (
  'visit_request',
  'info_request',
  'general_contact',
  'callback_request'
);

CREATE TYPE billing_event_type AS ENUM (
  'payment_received',
  'plan_activated',
  'plan_renewed',
  'plan_cancelled',
  'plan_upgraded',
  'plan_downgraded',
  'trial_started',
  'trial_ended'
);

-- ============================================================================
-- HELPER FUNCTIONS (needed before tables for defaults/RLS)
-- ============================================================================

-- Get the agency_id of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_current_agency_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agency_id
  FROM public.user_profiles
  WHERE id = auth.uid()
$$;

-- Get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_profiles
  WHERE id = auth.uid()
$$;

-- Check if the currently authenticated user is a platform super admin
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND role = 'platform_super_admin'
      AND status = 'active'
  )
$$;

-- Check if user has at least the given role level in their agency
CREATE OR REPLACE FUNCTION public.has_agency_role(required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND status = 'active'
      AND (
        role = 'platform_super_admin'
        OR role = 'agency_owner'
        OR (required_role = 'agency_admin' AND role IN ('agency_admin'))
        OR (required_role = 'agency_editor' AND role IN ('agency_admin', 'agency_editor'))
      )
  )
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- agencies
-- --------------------------------------------------------------------------
CREATE TABLE public.agencies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  logo_url        text,
  cover_image_url text,
  slogan          text,
  description     text,
  primary_color   text DEFAULT '#0c1b2a',
  phone           text,
  email           text,
  address         text,
  wilaya          text,
  license_number  text,
  is_verified     boolean NOT NULL DEFAULT false,
  active_plan     subscription_plan NOT NULL DEFAULT 'starter',
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  custom_domain   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agencies_slug ON public.agencies (slug);
CREATE INDEX idx_agencies_wilaya ON public.agencies (wilaya);
CREATE INDEX idx_agencies_subscription_status ON public.agencies (subscription_status);

-- --------------------------------------------------------------------------
-- user_profiles (linked to auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id   uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  full_name   text NOT NULL DEFAULT '',
  role        user_role NOT NULL DEFAULT 'agency_owner',
  status      user_status NOT NULL DEFAULT 'active',
  phone       text,
  avatar_url  text,
  invited_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_agency_id ON public.user_profiles (agency_id);
CREATE INDEX idx_user_profiles_role ON public.user_profiles (role);

-- --------------------------------------------------------------------------
-- properties
-- --------------------------------------------------------------------------
CREATE TABLE public.properties (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  responsible_user_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  title               text NOT NULL,
  slug                text NOT NULL,
  transaction_type    transaction_type NOT NULL,
  property_type       property_type NOT NULL DEFAULT 'apartment',
  price               numeric(15,2) NOT NULL,
  currency            text NOT NULL DEFAULT 'DZD',
  negotiable          boolean NOT NULL DEFAULT false,
  surface             numeric(10,2),
  rooms               integer,
  bedrooms            integer,
  bathrooms           integer,
  wilaya              text NOT NULL,
  commune             text,
  quartier            text,
  address             text,
  latitude            numeric(10,7),
  longitude           numeric(10,7),
  description         text,
  amenities           text[] DEFAULT '{}',
  status              property_status NOT NULL DEFAULT 'draft',
  is_featured         boolean NOT NULL DEFAULT false,
  is_verified         boolean NOT NULL DEFAULT false,
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE(agency_id, slug)
);

CREATE INDEX idx_properties_agency_id ON public.properties (agency_id);
CREATE INDEX idx_properties_status ON public.properties (status);
CREATE INDEX idx_properties_transaction_type ON public.properties (transaction_type);
CREATE INDEX idx_properties_property_type ON public.properties (property_type);
CREATE INDEX idx_properties_wilaya ON public.properties (wilaya);
CREATE INDEX idx_properties_price ON public.properties (price);
CREATE INDEX idx_properties_published_at ON public.properties (published_at DESC NULLS LAST);
CREATE INDEX idx_properties_is_featured ON public.properties (is_featured) WHERE is_featured = true;

-- --------------------------------------------------------------------------
-- property_images
-- --------------------------------------------------------------------------
CREATE TABLE public.property_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agency_id     uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  public_url    text,
  alt_text      text DEFAULT '',
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property_id ON public.property_images (property_id);
CREATE INDEX idx_property_images_agency_id ON public.property_images (agency_id);

-- --------------------------------------------------------------------------
-- leads
-- --------------------------------------------------------------------------
CREATE TABLE public.leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  full_name   text NOT NULL,
  phone       text NOT NULL,
  email       text,
  message     text,
  status      lead_status NOT NULL DEFAULT 'new',
  source      lead_source NOT NULL DEFAULT 'website',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_agency_id ON public.leads (agency_id);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_property_id ON public.leads (property_id);
CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);

-- --------------------------------------------------------------------------
-- agency_invitations
-- --------------------------------------------------------------------------
CREATE TABLE public.agency_invitations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        user_role NOT NULL DEFAULT 'agency_editor',
  token_hash  text NOT NULL,
  status      invitation_status NOT NULL DEFAULT 'pending',
  invited_by  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_agency_id ON public.agency_invitations (agency_id);
CREATE INDEX idx_invitations_email ON public.agency_invitations (email);
CREATE INDEX idx_invitations_token_hash ON public.agency_invitations (token_hash);
CREATE INDEX idx_invitations_status ON public.agency_invitations (status);

-- --------------------------------------------------------------------------
-- subscriptions
-- --------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  plan_code     subscription_plan NOT NULL DEFAULT 'starter',
  status        subscription_status NOT NULL DEFAULT 'trial',
  billing_mode  billing_mode NOT NULL DEFAULT 'manual',
  start_date    timestamptz NOT NULL DEFAULT now(),
  renewal_date  timestamptz,
  end_date      timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE(agency_id)
);

CREATE INDEX idx_subscriptions_agency_id ON public.subscriptions (agency_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions (status);

-- --------------------------------------------------------------------------
-- billing_events
-- --------------------------------------------------------------------------
CREATE TABLE public.billing_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  agency_id       uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  type            billing_event_type NOT NULL,
  label           text NOT NULL DEFAULT '',
  amount          numeric(12,2),
  currency        text NOT NULL DEFAULT 'DZD',
  metadata        jsonb DEFAULT '{}',
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_billing_events_agency_id ON public.billing_events (agency_id);
CREATE INDEX idx_billing_events_subscription_id ON public.billing_events (subscription_id);

-- --------------------------------------------------------------------------
-- contact_requests (public-facing)
-- --------------------------------------------------------------------------
CREATE TABLE public.contact_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     uuid REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id   uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  full_name     text NOT NULL,
  phone         text NOT NULL,
  email         text,
  message       text,
  request_type  contact_request_type NOT NULL DEFAULT 'info_request',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_requests_agency_id ON public.contact_requests (agency_id);
CREATE INDEX idx_contact_requests_property_id ON public.contact_requests (property_id);

-- --------------------------------------------------------------------------
-- audit_logs (lightweight)
-- --------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id   uuid REFERENCES public.agencies(id) ON DELETE SET NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_agency_id ON public.audit_logs (agency_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_agencies_updated_at
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user_profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'agency_owner'
    ),
    'active'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-set published_at when property status changes to published
CREATE OR REPLACE FUNCTION public.handle_property_publish()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS DISTINCT FROM 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_property_published_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_property_publish();
