-- ============================================================
-- TabibPro — Init DB médicale — Configuration Locale
-- Support multilingue : Français, Arabe, Tamazight
-- ============================================================

-- Configurer le fuseau horaire par défaut (Algérie)
ALTER DATABASE tabibpro_medical SET timezone TO 'Africa/Algiers';

-- Créer des configurations de recherche full-text pour le français
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS french_unaccent (COPY = french);
ALTER TEXT SEARCH CONFIGURATION french_unaccent
    ALTER MAPPING FOR hword, hword_part, word WITH unaccent, french_stem;

-- Créer une fonction de recherche insensible aux accents pour les noms algériens
CREATE OR REPLACE FUNCTION search_patient(search_term TEXT)
RETURNS TABLE(
    id UUID,
    nom_fr VARCHAR,
    prenom_fr VARCHAR,
    telephone_mobile VARCHAR,
    numero_patient VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nom_fr,
        p.prenom_fr,
        p.telephone_mobile,
        p.numero_patient
    FROM patients p
    WHERE
        unaccent(LOWER(p.nom_fr)) LIKE unaccent(LOWER('%' || search_term || '%'))
        OR unaccent(LOWER(p.prenom_fr)) LIKE unaccent(LOWER('%' || search_term || '%'))
        OR p.telephone_mobile LIKE '%' || search_term || '%'
        OR p.numero_patient LIKE '%' || search_term || '%'
        OR p.nom_ar LIKE '%' || search_term || '%'
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Séquences pour les numéros auto
CREATE SEQUENCE IF NOT EXISTS patient_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS consultation_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS ordonnance_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS facture_seq START WITH 1 INCREMENT BY 1;

DO $$
BEGIN
    RAISE NOTICE 'TabibPro — Configuration locale initialisée (Africa/Algiers)';
END $$;
