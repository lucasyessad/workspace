-- =============================================================
-- AqarVision - Schéma Billing, Vérification Documents, Admin
-- =============================================================

-- =============================================================
-- Table : subscriptions (Abonnements Stripe)
-- =============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  plan_type VARCHAR(50) NOT NULL DEFAULT 'starter'
    CHECK (plan_type IN ('starter', 'pro', 'enterprise', 'trial')),
  status VARCHAR(50) NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir son propre abonnement"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Créer son abonnement"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Les mises à jour d'abonnement sont faites via webhook (service role)

-- =============================================================
-- Table : plan_features (Limites par plan)
-- =============================================================
CREATE TABLE plan_features (
  plan_type VARCHAR(50) PRIMARY KEY,
  max_listings INTEGER NOT NULL,
  max_photos_per_listing INTEGER NOT NULL,
  has_ai_generation BOOLEAN DEFAULT FALSE,
  has_analytics BOOLEAN DEFAULT FALSE,
  has_multilang BOOLEAN DEFAULT FALSE,
  has_verified_badge BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE
);

INSERT INTO plan_features VALUES
  ('trial', 5, 5, TRUE, TRUE, TRUE, FALSE, FALSE),
  ('starter', 10, 5, FALSE, FALSE, FALSE, FALSE, FALSE),
  ('pro', 50, 15, TRUE, TRUE, TRUE, TRUE, TRUE),
  ('enterprise', 999999, 50, TRUE, TRUE, TRUE, TRUE, TRUE);

ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan features en lecture seule"
  ON plan_features FOR SELECT
  USING (true);

-- =============================================================
-- Table : payments (Historique des paiements)
-- =============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(100),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'dzd',
  status VARCHAR(50) NOT NULL,
  plan_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres paiements"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================
-- Table : document_verifications (Vérification des documents)
-- =============================================================
CREATE TABLE document_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'verified', 'rejected')),
  notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_verif_listing ON document_verifications(listing_id);
CREATE INDEX idx_doc_verif_agent ON document_verifications(agent_id);
CREATE INDEX idx_doc_verif_status ON document_verifications(status);

ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres vérifications"
  ON document_verifications FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Soumettre une vérification"
  ON document_verifications FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- =============================================================
-- Table : email_logs (Journal des emails envoyés)
-- =============================================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject TEXT NOT NULL,
  template VARCHAR(100),
  status VARCHAR(50) DEFAULT 'sent',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_date ON email_logs(created_at DESC);

-- =============================================================
-- Table : admin_users (Super-admins de la plateforme)
-- =============================================================
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'moderator'
    CHECK (role IN ('moderator', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent se voir
CREATE POLICY "Admins se voient eux-mêmes"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================
-- Table : whatsapp_messages (Log des messages WhatsApp Business)
-- =============================================================
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  prospect_phone VARCHAR(20) NOT NULL,
  prospect_name VARCHAR(200),
  message_text TEXT,
  direction VARCHAR(10) NOT NULL DEFAULT 'outgoing'
    CHECK (direction IN ('incoming', 'outgoing')),
  status VARCHAR(50) DEFAULT 'sent',
  whatsapp_message_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wa_messages_agent ON whatsapp_messages(agent_id);
CREATE INDEX idx_wa_messages_date ON whatsapp_messages(created_at DESC);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres messages WhatsApp"
  ON whatsapp_messages FOR SELECT
  USING (agent_id = auth.uid());

-- =============================================================
-- Fonctions utilitaires
-- =============================================================

-- Vérifier les limites du plan d'un agent
CREATE OR REPLACE FUNCTION verifier_limite_plan(p_user_id UUID, p_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan VARCHAR;
  v_count INTEGER;
  v_max INTEGER;
BEGIN
  -- Récupérer le plan actif
  SELECT plan_type INTO v_plan
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
  LIMIT 1;

  IF v_plan IS NULL THEN
    v_plan := 'starter';
  END IF;

  IF p_type = 'listings' THEN
    SELECT COUNT(*) INTO v_count FROM listings WHERE agent_id = p_user_id;
    SELECT max_listings INTO v_max FROM plan_features WHERE plan_type = v_plan;
    RETURN v_count < v_max;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION est_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM admin_users WHERE user_id = p_user_id);
$$ LANGUAGE sql STABLE;

-- Trigger : Créer un abonnement trial lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_type, status, trial_end)
  VALUES (NEW.id, 'trial', 'trialing', NOW() + INTERVAL '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_subscription();
