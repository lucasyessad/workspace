-- ============================================================================
-- DADP_CREATE_STOCK_EVOL_MAIL.sql
-- Table de travail alimentee par DADP_STOCK_EVOL_MAIL.sql.
-- Les colonnes Evolution sont en VARCHAR : le formatage ("4,8%") est produit
-- directement par le SQL et transporte tel quel dans le CSV.
-- ============================================================================

IF NOT EXISTS (
    SELECT 1
    FROM   INFORMATION_SCHEMA.TABLES
    WHERE  TABLE_CATALOG = 'DADP'
      AND  TABLE_SCHEMA  = 'dbo'
      AND  TABLE_NAME    = 'DADP_STOCK_EVOL_MAIL'
)
BEGIN
    CREATE TABLE DADP.dbo.DADP_STOCK_EVOL_MAIL (
        Expediteur            VARCHAR(50)    NOT NULL,
        Arrete                DATE               NULL,
        [Sequence]            INT                NULL,
        Somme_FOR             INT                NULL,
        Evolution_FOR         VARCHAR(20)        NULL,  -- ex : "4,8%"
        Somme_DEF             INT                NULL,
        Evolution_DEF         VARCHAR(20)        NULL,
        Somme_NPE             INT                NULL,
        Evolution_NPE         VARCHAR(20)        NULL,
        Somme_IMP             INT                NULL,
        Evolution_IMP         VARCHAR(20)        NULL,
        Date_chargement_INEO  DATETIME           NULL,
        Frequence             VARCHAR(20)        NULL,
        Statut                VARCHAR(10)        NULL   -- RECU | RETARD | NON_RECU
    );
END
GO
