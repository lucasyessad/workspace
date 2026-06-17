-- ============================================================================
-- DADP_STOCK_EVOL_MAIL.sql
-- 2 arrets par expediteur (dernier NO_SEQ) + evolutions + Frequence/Statut
--
-- Aucune transformation de chaine : dates via DATEFROMPARTS, evolutions
-- en DECIMAL(5,1). La mise en forme est a la charge de la couche presentaion.
--
-- Retard dynamique : GETDATE() > DATEADD(month, DeltaMois, dernier_arrete)
--                                + JoursTolerance
-- DeltaMois et JoursTolerance deduits de la Frequence dans la CTE ref.
-- ============================================================================

TRUNCATE TABLE DADP.dbo.DADP_STOCK_EVOL_MAIL;

WITH ref AS (
    SELECT
        E.CD_EXPEDITEUR,
        E.Frequence,
        CASE E.Frequence
            WHEN 'Mensuelle'     THEN 1
            WHEN 'Bimensuelle'   THEN 2
            WHEN 'Trimestrielle' THEN 3
            WHEN 'Annuelle'      THEN 12
            ELSE 1
        END AS DeltaMois,
        CASE E.Frequence
            WHEN 'Mensuelle'     THEN 4
            WHEN 'Bimensuelle'   THEN 4
            WHEN 'Trimestrielle' THEN 10
            WHEN 'Annuelle'      THEN 15
            ELSE 4
        END AS JoursTolerance
    FROM DADP.dbo.EXPEDITEURS_REF E
),
mois AS (
    SELECT DISTINCT CD_EXPEDITEUR, CD_DAT_ARR_AAM
    FROM   DADP.dbo.DADP_STOCK
),
perim AS (
    SELECT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM,
        ROW_NUMBER() OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM DESC) AS rn
    FROM mois
),
agg AS (
    SELECT
        DS.CD_EXPEDITEUR,
        DS.CD_DAT_ARR_AAM,
        MAX(DS.NO_SEQ)                               AS NO_SEQ,
        SUM(ISNULL(TRY_CONVERT(INT,DS.FL_FOR), 0))  AS SUM_FL_FOR,
        SUM(ISNULL(TRY_CONVERT(INT,DS.FL_DEF), 0))  AS SUM_FL_DEF,
        SUM(ISNULL(TRY_CONVERT(INT,DS.FL_NPE), 0))  AS SUM_FL_NPE,
        SUM(ISNULL(TRY_CONVERT(INT,DS.FL_IMP), 0))  AS SUM_FL_IMP,
        MAX(DS.DT_MAJ)                               AS DT_CHARGEMENT_INEO
    FROM DADP.dbo.DADP_STOCK DS
    INNER JOIN perim P
        ON DS.CD_EXPEDITEUR  = P.CD_EXPEDITEUR
       AND DS.CD_DAT_ARR_AAM = P.CD_DAT_ARR_AAM
    WHERE P.rn <= 2
    GROUP BY DS.CD_EXPEDITEUR, DS.CD_DAT_ARR_AAM
),
calc AS (
    SELECT
        *,
        LAG(SUM_FL_FOR) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_FOR,
        LAG(SUM_FL_DEF) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_DEF,
        LAG(SUM_FL_NPE) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_NPE,
        LAG(SUM_FL_IMP) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_IMP,
        -- Date du dernier arrete via DATEFROMPARTS (pas de manipulation de chaine)
        DATEFROMPARTS(
            MAX(CD_DAT_ARR_AAM) OVER (PARTITION BY CD_EXPEDITEUR) / 100,
            MAX(CD_DAT_ARR_AAM) OVER (PARTITION BY CD_EXPEDITEUR) % 100,
            1
        ) AS MAX_ARR_DATE
    FROM agg
)

INSERT INTO DADP.dbo.DADP_STOCK_EVOL_MAIL
(
    Expediteur, Arrete, [Sequence],
    Somme_FOR,  Evolution_FOR,
    Somme_DEF,  Evolution_DEF,
    Somme_NPE,  Evolution_NPE,
    Somme_IMP,  Evolution_IMP,
    Date_chargement_INEO, Frequence, Statut
)

-- Expediteurs presents dans DADP_STOCK
SELECT
    C.CD_EXPEDITEUR,

    -- Date de l'arrete sans manipulation de chaine
    DATEFROMPARTS(C.CD_DAT_ARR_AAM / 100, C.CD_DAT_ARR_AAM % 100, 1) AS Arrete,

    C.NO_SEQ AS [Sequence],

    C.SUM_FL_FOR,
    CASE WHEN C.PREV_FL_FOR IS NULL OR C.PREV_FL_FOR = 0 THEN NULL
         ELSE ROUND((C.SUM_FL_FOR * 1.0 / C.PREV_FL_FOR - 1) * 100, 1)
    END AS Evolution_FOR,

    C.SUM_FL_DEF,
    CASE WHEN C.PREV_FL_DEF IS NULL OR C.PREV_FL_DEF = 0 THEN NULL
         ELSE ROUND((C.SUM_FL_DEF * 1.0 / C.PREV_FL_DEF - 1) * 100, 1)
    END AS Evolution_DEF,

    C.SUM_FL_NPE,
    CASE WHEN C.PREV_FL_NPE IS NULL OR C.PREV_FL_NPE = 0 THEN NULL
         ELSE ROUND((C.SUM_FL_NPE * 1.0 / C.PREV_FL_NPE - 1) * 100, 1)
    END AS Evolution_NPE,

    C.SUM_FL_IMP,
    CASE WHEN C.PREV_FL_IMP IS NULL OR C.PREV_FL_IMP = 0 THEN NULL
         ELSE ROUND((C.SUM_FL_IMP * 1.0 / C.PREV_FL_IMP - 1) * 100, 1)
    END AS Evolution_IMP,

    C.DT_CHARGEMENT_INEO,
    R.Frequence,

    -- Retard dynamique : date theorique du prochain arrete + tolerance
    CASE
        WHEN GETDATE() > DATEADD(day, R.JoursTolerance,
                                 DATEADD(month, R.DeltaMois, C.MAX_ARR_DATE))
        THEN 'RETARD'
        ELSE 'RECU'
    END AS Statut

FROM calc C
LEFT JOIN ref R ON R.CD_EXPEDITEUR = C.CD_EXPEDITEUR

UNION ALL

-- Expediteurs attendus mais absents de DADP_STOCK
SELECT
    R.CD_EXPEDITEUR, NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL, NULL,
    NULL, R.Frequence, 'NON_RECU'
FROM ref R
WHERE R.CD_EXPEDITEUR NOT IN (
    SELECT DISTINCT CD_EXPEDITEUR FROM DADP.dbo.DADP_STOCK
)

ORDER BY Expediteur, Arrete;
