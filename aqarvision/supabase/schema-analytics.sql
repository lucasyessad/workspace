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
