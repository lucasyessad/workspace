-- ============================================================================
-- DADP_CREATE_EXPEDITEURS_REF.sql
-- Table de r&eacute;f&eacute;rence des exp&eacute;diteurs attendus.
--
-- Seule la colonne Frequence est &agrave; renseigner.
-- Le cycle (DeltaMois) et la tol&eacute;rance (JoursTolerance) sont d&eacute;duits
-- automatiquement dans DADP_STOCK_EVOL_MAIL.sql selon la r&egrave;gle :
--   Mensuelle      ->  +1 mois   + 4 jours
--   Bimensuelle    ->  +2 mois   + 4 jours
--   Trimestrielle  ->  +3 mois   + 10 jours
--   Annuelle       ->  +12 mois  + 15 jours
--
-- Pour ajouter/modifier un exp&eacute;diteur, mettre &agrave; jour uniquement cette table.
-- ============================================================================

IF NOT EXISTS (
    SELECT 1
    FROM   INFORMATION_SCHEMA.TABLES
    WHERE  TABLE_CATALOG = 'DADP'
      AND  TABLE_SCHEMA  = 'dbo'
      AND  TABLE_NAME    = 'EXPEDITEURS_REF'
)
BEGIN
    CREATE TABLE DADP.dbo.EXPEDITEURS_REF (
        CD_EXPEDITEUR VARCHAR(50) NOT NULL,
        Frequence     VARCHAR(20) NOT NULL,
            CONSTRAINT CHK_EXPEDITEURS_REF_Frequence
                CHECK (Frequence IN ('Mensuelle','Bimensuelle','Trimestrielle','Annuelle')),
        CONSTRAINT PK_EXPEDITEURS_REF PRIMARY KEY (CD_EXPEDITEUR)
    );
END
GO

-- Initialisation / mise &agrave; jour du r&eacute;f&eacute;rentiel
MERGE DADP.dbo.EXPEDITEURS_REF AS cible
USING (VALUES
    ('EXP_AXB',    'Mensuelle'),
    ('EXP_BNP',    'Mensuelle'),
    ('EXP_BOURS',  'Mensuelle'),
    ('EXP_CA',     'Trimestrielle'),
    ('EXP_CDN',    'Trimestrielle'),
    ('EXP_CFF',    'Mensuelle'),
    ('EXP_CICMUT', 'Mensuelle'),
    ('EXP_HSBC',   'Mensuelle'),
    ('EXP_ING',    'Trimestrielle'),
    ('EXP_LBP',    'Mensuelle'),
    ('EXP_LCL',    'Mensuelle'),
    ('EXP_SG_CDN', 'Mensuelle')
) AS source (CD_EXPEDITEUR, Frequence)
ON cible.CD_EXPEDITEUR = source.CD_EXPEDITEUR
WHEN MATCHED     THEN UPDATE SET Frequence = source.Frequence
WHEN NOT MATCHED THEN INSERT (CD_EXPEDITEUR, Frequence)
                      VALUES (source.CD_EXPEDITEUR, source.Frequence);
GO
