-- ============================================
-- Patrimoine 360° — Schéma Supabase complet
-- ============================================

-- 1. Profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name text,
  age integer,
  situation_familiale text,
  lieu_residence text,
  profession text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Catalogue des modules
CREATE TABLE IF NOT EXISTS modules (
  id integer PRIMARY KEY,
  title text NOT NULL,
  style text NOT NULL,
  icon text NOT NULL,
  description text,
  has_calculator boolean DEFAULT false
);

-- Seed modules
INSERT INTO modules (id, title, style, icon, description, has_calculator) VALUES
  (1, 'Le Diagnostic Patrimonial', 'Goldman Sachs', '📊', 'Bilan complet de votre santé financière avec score global', true),
  (2, 'Planification Retraite', 'Vanguard', '🏖️', 'Plan de retraite complet avec projections et jalons', true),
  (3, 'Architecte de Portefeuille', 'Morgan Stanley', '📈', 'Construction de portefeuille d''investissement optimisé', false),
  (4, 'Optimisation Fiscale', 'Deloitte', '🧾', 'Stratégies pour minimiser votre facture fiscale', false),
  (5, 'Élimination des Dettes', 'JPMorgan', '💳', 'Plan agressif de remboursement de toutes vos dettes', true),
  (6, 'Fonds d''Urgence', 'Charles Schwab', '🛡️', 'Stratégie de constitution de votre matelas de sécurité', true),
  (7, 'Audit d''Assurance', 'Northwestern Mutual', '🔒', 'Vérification complète de vos couvertures d''assurance', false),
  (8, 'Épargne pour les Études', 'Fidelity', '🎓', 'Plan d''épargne éducative pour vos enfants', false),
  (9, 'Planification Successorale', 'Edward Jones', '📜', 'Organisation de la transmission de votre patrimoine', false),
  (10, 'Investissement Immobilier', 'Wealthfront', '🏠', 'Analyse de rentabilité d''investissements immobiliers', true),
  (11, 'Créateur de Budget', 'Ramsey Solutions', '💰', 'Budget base zéro et optimisation de vos dépenses', true),
  (12, 'Feuille de Route Financière', 'BlackRock', '🗺️', 'Vision à vie de votre parcours financier complet', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Données saisies par module
CREATE TABLE IF NOT EXISTS user_module_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id integer REFERENCES modules(id) NOT NULL,
  form_data jsonb NOT NULL DEFAULT '{}',
  completed boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- 4. Résultats calculés
CREATE TABLE IF NOT EXISTS user_module_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id integer REFERENCES modules(id) NOT NULL,
  calculation_results jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- 5. Analyses IA (versionnées)
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id integer REFERENCES modules(id) NOT NULL,
  version integer DEFAULT 1,
  ai_result text NOT NULL,
  form_data_snapshot jsonb NOT NULL DEFAULT '{}',
  calculation_snapshot jsonb DEFAULT '[]',
  model_used text DEFAULT 'claude-sonnet-4-20250514',
  created_at timestamptz DEFAULT now()
);

-- 6. Sessions d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Historique des exports
CREATE TABLE IF NOT EXISTS exports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  export_type text NOT NULL CHECK (export_type IN ('pdf', 'excel', 'pdf_bilan_complet')),
  module_id integer REFERENCES modules(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 8. Abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Objectifs financiers
CREATE TABLE IF NOT EXISTS user_objectives (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('residence', 'retraite', 'independance', 'transmission', 'expatriation', 'epargne', 'investissement', 'autre')),
  target_amount numeric,
  current_amount numeric DEFAULT 0,
  target_date date,
  priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 11. Conversations copilote
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 12. Rappels intelligents
CREATE TABLE IF NOT EXISTS reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text,
  reminder_type text NOT NULL CHECK (reminder_type IN ('budget_review', 'objective_check', 'rebalance', 'debt_payment', 'emergency_fund', 'custom')),
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once')),
  next_trigger_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own module data" ON user_module_data FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own results" ON user_module_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own analyses" ON ai_analyses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own onboarding" ON onboarding_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own exports" ON exports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own objectives" ON user_objectives FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conversations" ON copilot_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Modules table is public read
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules are public" ON modules FOR SELECT USING (true);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_module_data_user ON user_module_data(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_module ON ai_analyses(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_user_objectives_user ON user_objectives(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON reminders(user_id, is_active);
