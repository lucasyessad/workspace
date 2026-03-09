-- Migration: Ajouter les champs financiers au profil utilisateur
-- Ces champs permettent de pré-remplir automatiquement les modules

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nom text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_mensuels numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS depenses_mensuelles numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS epargne_totale numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dettes_totales numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS investissements numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS revenus_annuels numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS capacite_epargne numeric;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS statut_fiscal text;

-- Politique RLS (si pas déjà en place)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON user_profiles FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
