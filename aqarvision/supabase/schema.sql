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
