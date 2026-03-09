-- =============================================================
-- AqarVision - Schéma SQL pour Supabase (PostgreSQL)
-- Plateforme SaaS Immobilier Algérie
-- =============================================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- Table : wilayas (Les 58 Wilayas d'Algérie)
-- =============================================================
CREATE TABLE wilayas (
  id SERIAL PRIMARY KEY,
  nom_fr VARCHAR(100) NOT NULL,
  nom_ar VARCHAR(100) NOT NULL,
  code VARCHAR(2) NOT NULL UNIQUE
);

-- =============================================================
-- Table : communes
-- =============================================================
CREATE TABLE communes (
  id SERIAL PRIMARY KEY,
  nom_fr VARCHAR(150) NOT NULL,
  nom_ar VARCHAR(150) NOT NULL,
  wilaya_id INTEGER NOT NULL REFERENCES wilayas(id) ON DELETE CASCADE
);

CREATE INDEX idx_communes_wilaya ON communes(wilaya_id);

-- =============================================================
-- Table : profiles (Agences immobilières)
-- Liée à auth.users via l'ID Supabase
-- =============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_agence VARCHAR(200) NOT NULL,
  logo_url TEXT,
  telephone_whatsapp VARCHAR(20) NOT NULL,
  wilaya_id INTEGER REFERENCES wilayas(id),
  commune VARCHAR(150),
  adresse TEXT,
  description TEXT,
  est_verifie BOOLEAN DEFAULT FALSE,
  slug_url VARCHAR(200) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_profiles_slug ON profiles(slug_url);

-- =============================================================
-- Types ENUM pour les annonces
-- =============================================================
CREATE TYPE type_bien AS ENUM (
  'Villa',
  'Appartement F1',
  'Appartement F2',
  'Appartement F3',
  'Appartement F4',
  'Appartement F5+',
  'Terrain',
  'Local Commercial',
  'Duplex',
  'Studio',
  'Hangar',
  'Bureau'
);

CREATE TYPE type_transaction AS ENUM (
  'Vente',
  'Location',
  'Location vacances'
);

CREATE TYPE statut_document AS ENUM (
  'Acte',
  'Livret foncier',
  'Concession',
  'Promesse de vente',
  'Timbré',
  'Autre'
);

-- =============================================================
-- Table : listings (Annonces immobilières)
-- =============================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre VARCHAR(300) NOT NULL,
  description TEXT,
  prix BIGINT NOT NULL CHECK (prix >= 0),
  surface INTEGER CHECK (surface > 0),
  type_bien type_bien NOT NULL,
  type_transaction type_transaction NOT NULL DEFAULT 'Vente',
  statut_document statut_document NOT NULL DEFAULT 'Acte',
  photos TEXT[] DEFAULT '{}',
  wilaya_id INTEGER REFERENCES wilayas(id),
  commune VARCHAR(150),
  quartier VARCHAR(200),
  etage INTEGER,
  nb_pieces INTEGER,
  ascenseur BOOLEAN DEFAULT FALSE,
  citerne BOOLEAN DEFAULT FALSE,
  garage BOOLEAN DEFAULT FALSE,
  jardin BOOLEAN DEFAULT FALSE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  est_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_agent ON listings(agent_id);
CREATE INDEX idx_listings_wilaya ON listings(wilaya_id);
CREATE INDEX idx_listings_type ON listings(type_bien);
CREATE INDEX idx_listings_transaction ON listings(type_transaction);
CREATE INDEX idx_listings_active ON listings(est_active);

-- =============================================================
-- Fonction : Mettre à jour le champ updated_at automatiquement
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- RLS (Row Level Security) - Sécurité au niveau des lignes
-- =============================================================

-- Activer RLS sur les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture publique, modification par le propriétaire
CREATE POLICY "Profiles visibles publiquement"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Modifier son propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Créer son propre profil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Listings : lecture publique (actifs), CRUD par le propriétaire
CREATE POLICY "Annonces actives visibles publiquement"
  ON listings FOR SELECT
  USING (est_active = true OR agent_id = auth.uid());

CREATE POLICY "Créer ses propres annonces"
  ON listings FOR INSERT
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Modifier ses propres annonces"
  ON listings FOR UPDATE
  USING (agent_id = auth.uid());

CREATE POLICY "Supprimer ses propres annonces"
  ON listings FOR DELETE
  USING (agent_id = auth.uid());

-- Wilayas et Communes : lecture seule pour tous
ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wilayas en lecture seule"
  ON wilayas FOR SELECT
  USING (true);

CREATE POLICY "Communes en lecture seule"
  ON communes FOR SELECT
  USING (true);

-- =============================================================
-- Fonction : Créer automatiquement un profil lors de l'inscription
-- =============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nom_agence, telephone_whatsapp, slug_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom_agence', 'Mon Agence'),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'slug',
      REPLACE(LOWER(COALESCE(NEW.raw_user_meta_data->>'nom_agence', 'agence-' || LEFT(NEW.id::TEXT, 8))), ' ', '-')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- Insertion des 58 Wilayas d'Algérie
-- =============================================================
INSERT INTO wilayas (id, nom_fr, nom_ar, code) VALUES
  (1, 'Adrar', 'أدرار', '01'),
  (2, 'Chlef', 'الشلف', '02'),
  (3, 'Laghouat', 'الأغواط', '03'),
  (4, 'Oum El Bouaghi', 'أم البواقي', '04'),
  (5, 'Batna', 'باتنة', '05'),
  (6, 'Béjaïa', 'بجاية', '06'),
  (7, 'Biskra', 'بسكرة', '07'),
  (8, 'Béchar', 'بشار', '08'),
  (9, 'Blida', 'البليدة', '09'),
  (10, 'Bouira', 'البويرة', '10'),
  (11, 'Tamanrasset', 'تمنراست', '11'),
  (12, 'Tébessa', 'تبسة', '12'),
  (13, 'Tlemcen', 'تلمسان', '13'),
  (14, 'Tiaret', 'تيارت', '14'),
  (15, 'Tizi Ouzou', 'تيزي وزو', '15'),
  (16, 'Alger', 'الجزائر', '16'),
  (17, 'Djelfa', 'الجلفة', '17'),
  (18, 'Jijel', 'جيجل', '18'),
  (19, 'Sétif', 'سطيف', '19'),
  (20, 'Saïda', 'سعيدة', '20'),
  (21, 'Skikda', 'سكيكدة', '21'),
  (22, 'Sidi Bel Abbès', 'سيدي بلعباس', '22'),
  (23, 'Annaba', 'عنابة', '23'),
  (24, 'Guelma', 'قالمة', '24'),
  (25, 'Constantine', 'قسنطينة', '25'),
  (26, 'Médéa', 'المدية', '26'),
  (27, 'Mostaganem', 'مستغانم', '27'),
  (28, 'M''Sila', 'المسيلة', '28'),
  (29, 'Mascara', 'معسكر', '29'),
  (30, 'Ouargla', 'ورقلة', '30'),
  (31, 'Oran', 'وهران', '31'),
  (32, 'El Bayadh', 'البيض', '32'),
  (33, 'Illizi', 'إليزي', '33'),
  (34, 'Bordj Bou Arréridj', 'برج بوعريريج', '34'),
  (35, 'Boumerdès', 'بومرداس', '35'),
  (36, 'El Tarf', 'الطارف', '36'),
  (37, 'Tindouf', 'تندوف', '37'),
  (38, 'Tissemsilt', 'تيسمسيلت', '38'),
  (39, 'El Oued', 'الوادي', '39'),
  (40, 'Khenchela', 'خنشلة', '40'),
  (41, 'Souk Ahras', 'سوق أهراس', '41'),
  (42, 'Tipaza', 'تيبازة', '42'),
  (43, 'Mila', 'ميلة', '43'),
  (44, 'Aïn Defla', 'عين الدفلى', '44'),
  (45, 'Naâma', 'النعامة', '45'),
  (46, 'Aïn Témouchent', 'عين تموشنت', '46'),
  (47, 'Ghardaïa', 'غرداية', '47'),
  (48, 'Relizane', 'غليزان', '48'),
  (49, 'El M''Ghair', 'المغير', '49'),
  (50, 'El Meniaa', 'المنيعة', '50'),
  (51, 'Ouled Djellal', 'أولاد جلال', '51'),
  (52, 'Bordj Badji Mokhtar', 'برج باجي مختار', '52'),
  (53, 'Béni Abbès', 'بني عباس', '53'),
  (54, 'Timimoun', 'تيميمون', '54'),
  (55, 'Touggourt', 'تقرت', '55'),
  (56, 'Djanet', 'جانت', '56'),
  (57, 'In Salah', 'عين صالح', '57'),
  (58, 'In Guezzam', 'عين قزام', '58');
-- =============================================================
-- AqarVision - Schéma Analytics et Notifications
-- Tables supplémentaires pour le suivi des performances
-- =============================================================

-- =============================================================
-- Table : contacts (Notifications de prospects)
-- =============================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type_contact VARCHAR(20) NOT NULL CHECK (type_contact IN ('whatsapp', 'appel', 'formulaire')),
  nom_prospect VARCHAR(200),
  telephone_prospect VARCHAR(20),
  message TEXT,
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_agent ON contacts(agent_id);
CREATE INDEX idx_contacts_listing ON contacts(listing_id);
CREATE INDEX idx_contacts_date ON contacts(created_at DESC);

-- RLS : Seul l'agent propriétaire voit ses contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres contacts"
  ON contacts FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Créer un contact (public)"
  ON contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Marquer comme lu"
  ON contacts FOR UPDATE
  USING (agent_id = auth.uid());

-- =============================================================
-- Table : analytics_vues (Vues des annonces)
-- =============================================================
CREATE TABLE analytics_vues (
  id BIGSERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_vues_agent ON analytics_vues(agent_id);
CREATE INDEX idx_analytics_vues_listing ON analytics_vues(listing_id);
CREATE INDEX idx_analytics_vues_date ON analytics_vues(created_at DESC);

-- RLS : Seul l'agent voit ses analytics
ALTER TABLE analytics_vues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres vues"
  ON analytics_vues FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Insérer une vue (public)"
  ON analytics_vues FOR INSERT
  WITH CHECK (true);

-- =============================================================
-- Table : analytics_clics_whatsapp (Clics WhatsApp par annonce)
-- =============================================================
CREATE TABLE analytics_clics (
  id BIGSERIAL PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type_clic VARCHAR(20) NOT NULL CHECK (type_clic IN ('whatsapp', 'appel', 'favori')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_clics_agent ON analytics_clics(agent_id);
CREATE INDEX idx_analytics_clics_date ON analytics_clics(created_at DESC);

ALTER TABLE analytics_clics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres clics"
  ON analytics_clics FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Insérer un clic (public)"
  ON analytics_clics FOR INSERT
  WITH CHECK (true);

-- =============================================================
-- Table : analytics_recherches (Recherches populaires par wilaya)
-- =============================================================
CREATE TABLE analytics_recherches (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  terme_recherche TEXT,
  type_bien_filtre VARCHAR(50),
  transaction_filtre VARCHAR(50),
  wilaya_id INTEGER REFERENCES wilayas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_recherches_agent ON analytics_recherches(agent_id);
CREATE INDEX idx_analytics_recherches_date ON analytics_recherches(created_at DESC);

ALTER TABLE analytics_recherches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir ses propres recherches"
  ON analytics_recherches FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Insérer une recherche (public)"
  ON analytics_recherches FOR INSERT
  WITH CHECK (true);

-- =============================================================
-- Fonctions utilitaires pour les analytics
-- =============================================================

-- Fonction : Compter les vues ce mois pour un agent
CREATE OR REPLACE FUNCTION vues_ce_mois(p_agent_id UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)
  FROM analytics_vues
  WHERE agent_id = p_agent_id
    AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
$$ LANGUAGE sql STABLE;

-- Fonction : Compter les contacts ce mois pour un agent
CREATE OR REPLACE FUNCTION contacts_ce_mois(p_agent_id UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)
  FROM contacts
  WHERE agent_id = p_agent_id
    AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
$$ LANGUAGE sql STABLE;

-- Fonction : Compter les clics WhatsApp ce mois
CREATE OR REPLACE FUNCTION clics_whatsapp_ce_mois(p_agent_id UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*)
  FROM analytics_clics
  WHERE agent_id = p_agent_id
    AND type_clic = 'whatsapp'
    AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
$$ LANGUAGE sql STABLE;

-- Fonction : Top annonces par vues (les plus populaires)
CREATE OR REPLACE FUNCTION top_annonces_par_vues(p_agent_id UUID, p_limite INTEGER DEFAULT 5)
RETURNS TABLE(listing_id UUID, titre VARCHAR, nb_vues BIGINT) AS $$
  SELECT v.listing_id, l.titre, COUNT(*) as nb_vues
  FROM analytics_vues v
  JOIN listings l ON l.id = v.listing_id
  WHERE v.agent_id = p_agent_id
    AND v.created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  GROUP BY v.listing_id, l.titre
  ORDER BY nb_vues DESC
  LIMIT p_limite;
$$ LANGUAGE sql STABLE;

-- Fonction : Recherches populaires (types de biens les plus recherchés)
CREATE OR REPLACE FUNCTION recherches_populaires(p_agent_id UUID)
RETURNS TABLE(type_bien VARCHAR, nombre BIGINT) AS $$
  SELECT type_bien_filtre as type_bien, COUNT(*) as nombre
  FROM analytics_recherches
  WHERE agent_id = p_agent_id
    AND type_bien_filtre IS NOT NULL
    AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
  GROUP BY type_bien_filtre
  ORDER BY nombre DESC
  LIMIT 5;
$$ LANGUAGE sql STABLE;

-- Fonction : Incrémenter les contacts (appelée par l'API)
CREATE OR REPLACE FUNCTION incrementer_contacts(p_listing_id UUID, p_agent_id UUID)
RETURNS void AS $$
BEGIN
  -- Les contacts sont déjà insérés directement, cette fonction
  -- peut être utilisée pour des traitements additionnels
  NULL;
END;
$$ LANGUAGE plpgsql;
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
