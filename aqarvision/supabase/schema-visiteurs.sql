-- ═══════════════════════════════════════════════════════════
-- AqarVision — Espace Visiteur & Messagerie
-- Tables: visitor_profiles, favorites, search_history, conversations, messages
-- ═══════════════════════════════════════════════════════════

-- ── Profils visiteurs ──
CREATE TABLE IF NOT EXISTS visitor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  telephone TEXT,
  wilaya_id INTEGER REFERENCES wilayas(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visiteurs peuvent voir leur propre profil"
  ON visitor_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Visiteurs peuvent modifier leur propre profil"
  ON visitor_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Visiteurs peuvent créer leur profil"
  ON visitor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Favoris ──
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visitor_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visiteurs voient leurs favoris"
  ON favorites FOR SELECT
  USING (auth.uid() = visitor_id);

CREATE POLICY "Visiteurs ajoutent des favoris"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Visiteurs suppriment leurs favoris"
  ON favorites FOR DELETE
  USING (auth.uid() = visitor_id);

CREATE INDEX idx_favorites_visitor ON favorites(visitor_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- ── Historique de recherche ──
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  query TEXT,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visiteurs voient leur historique"
  ON search_history FOR SELECT
  USING (auth.uid() = visitor_id);

CREATE POLICY "Visiteurs créent leur historique"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Visiteurs suppriment leur historique"
  ON search_history FOR DELETE
  USING (auth.uid() = visitor_id);

CREATE INDEX idx_search_history_visitor ON search_history(visitor_id, created_at DESC);

-- ── Conversations ──
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  dernier_message TEXT,
  dernier_message_at TIMESTAMPTZ DEFAULT NOW(),
  visitor_non_lu INTEGER DEFAULT 0,
  agent_non_lu INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(visitor_id, agent_id, listing_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visiteurs voient leurs conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = visitor_id);

CREATE POLICY "Agents voient leurs conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "Visiteurs créent des conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Participants modifient la conversation"
  ON conversations FOR UPDATE
  USING (auth.uid() = visitor_id OR auth.uid() = agent_id);

CREATE INDEX idx_conversations_visitor ON conversations(visitor_id, dernier_message_at DESC);
CREATE INDEX idx_conversations_agent ON conversations(agent_id, dernier_message_at DESC);

-- ── Messages ──
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants voient les messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.visitor_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Participants envoient des messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.visitor_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE POLICY "Participants marquent les messages lus"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.visitor_id = auth.uid() OR c.agent_id = auth.uid())
    )
  );

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);

-- ── Trigger pour mettre à jour updated_at ──
CREATE OR REPLACE FUNCTION update_visitor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_visitor_updated_at
  BEFORE UPDATE ON visitor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_visitor_updated_at();

-- ── Trigger pour créer le profil visiteur à l'inscription ──
CREATE OR REPLACE FUNCTION handle_new_visitor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'visitor' THEN
    INSERT INTO visitor_profiles (id, nom, telephone, wilaya_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'nom', 'Visiteur'),
      NEW.raw_user_meta_data->>'telephone',
      (NEW.raw_user_meta_data->>'wilaya_id')::integer
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Si le trigger handle_new_user existe déjà pour les agences,
-- il faut soit le modifier, soit ajouter un nouveau trigger:
CREATE TRIGGER on_visitor_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_visitor();
