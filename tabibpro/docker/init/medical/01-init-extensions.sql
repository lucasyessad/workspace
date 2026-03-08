-- ============================================================
-- TabibPro — Init DB médicale — Extensions PostgreSQL
-- ============================================================

-- Extension pgvector pour les embeddings IA
CREATE EXTENSION IF NOT EXISTS vector;

-- Extension pour la recherche full-text sans accents (français + arabe)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Extension pour la recherche similaire (recherche floue patient)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour le chiffrement
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'TabibPro — Extensions PostgreSQL initialisées avec succès';
    RAISE NOTICE 'Extensions : pgvector, unaccent, pg_trgm, uuid-ossp, pgcrypto';
END $$;
