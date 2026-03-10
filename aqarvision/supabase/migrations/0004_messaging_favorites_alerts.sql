-- ============================================================================
-- AqarVision V1.1 — Messaging, Favorites, Saved Searches, Visitor Support
-- Benchmark-driven additions: conversations, favorites, alerts
-- ============================================================================

-- ============================================================================
-- ADDITIONAL ENUMS
-- ============================================================================

CREATE TYPE conversation_status AS ENUM (
  'open',
  'pending',
  'closed'
);

CREATE TYPE participant_type AS ENUM (
  'visitor',
  'agency_member'
);

CREATE TYPE message_type AS ENUM (
  'text',
  'system'
);

CREATE TYPE sender_type AS ENUM (
  'visitor',
  'agency_member',
  'system'
);

CREATE TYPE alert_frequency AS ENUM (
  'instant',
  'daily',
  'weekly'
);

CREATE TYPE account_type AS ENUM (
  'agency',
  'visitor'
);

-- ============================================================================
-- ALTER user_profiles: add account_type for visitor support
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS account_type account_type NOT NULL DEFAULT 'agency';

-- Update existing users to agency type (they were all agency users before)
-- New visitor signups will get 'visitor' type

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================

CREATE TABLE public.conversations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id         uuid NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  property_id       uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  visitor_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id           uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  subject           text,
  status            conversation_status NOT NULL DEFAULT 'open',
  last_message_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_agency_id ON public.conversations (agency_id);
CREATE INDEX idx_conversations_visitor_user_id ON public.conversations (visitor_user_id);
CREATE INDEX idx_conversations_property_id ON public.conversations (property_id);
CREATE INDEX idx_conversations_status ON public.conversations (status);
CREATE INDEX idx_conversations_last_message_at ON public.conversations (last_message_at DESC NULLS LAST);

-- Auto-update updated_at
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- CONVERSATION_PARTICIPANTS
-- ============================================================================

CREATE TABLE public.conversation_participants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_type  participant_type NOT NULL,
  last_read_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conv_participants_conversation_id ON public.conversation_participants (conversation_id);
CREATE INDEX idx_conv_participants_user_id ON public.conversation_participants (user_id);
CREATE UNIQUE INDEX idx_conv_participants_unique ON public.conversation_participants (conversation_id, user_id);

-- ============================================================================
-- MESSAGES
-- ============================================================================

CREATE TABLE public.messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type       sender_type NOT NULL,
  sender_user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body              text NOT NULL,
  message_type      message_type NOT NULL DEFAULT 'text',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages (created_at);

-- Update conversation last_message_at on new message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ============================================================================
-- FAVORITES
-- ============================================================================

CREATE TABLE public.favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX idx_favorites_property_id ON public.favorites (property_id);

-- ============================================================================
-- SAVED_SEARCHES (alerts)
-- ============================================================================

CREATE TABLE public.saved_searches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL DEFAULT '',
  filters         jsonb NOT NULL DEFAULT '{}',
  frequency       alert_frequency NOT NULL DEFAULT 'daily',
  is_active       boolean NOT NULL DEFAULT true,
  last_notified_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_searches_user_id ON public.saved_searches (user_id);
CREATE INDEX idx_saved_searches_is_active ON public.saved_searches (is_active) WHERE is_active = true;

CREATE TRIGGER set_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- VISITOR_PROFILES (optional enrichment for visitors)
-- ============================================================================

CREATE TABLE public.visitor_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_min      numeric(15,2),
  budget_max      numeric(15,2),
  preferred_wilayas text[] DEFAULT '{}',
  preferred_types property_type[] DEFAULT '{}',
  transaction_preference transaction_type,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_visitor_profiles_updated_at
  BEFORE UPDATE ON public.visitor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- HELPER: check if current user is a conversation participant
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = conv_id
      AND user_id = auth.uid()
  )
$$;
