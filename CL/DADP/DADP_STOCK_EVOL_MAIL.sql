-- ============================================================================
-- DADP_STOCK_EVOL_MAIL.sql
-- 2 arrêtés par expéditeur (dernier NO_SEQ) + évolutions + Frequence/Statut
-- La fréquence et la tolérance viennent d'une table de référence.
-- Pour utiliser une vraie table : remplacer la CTE "ref" par un SELECT
-- sur ta table, ex: SELECT CD_EXPEDITEUR, Frequence, JoursRetard FROM DADP.dbo.EXPEDITEURS_REF
-- ============================================================================

TRUNCATE TABLE DADP.dbo.DADP_STOCK_EVOL_MAIL;

WITH ref AS (
    -- Référentiel des expéditeurs attendus : fréquence + tolérance de retard
    -- Cycles : Mensuelle=35j / Bimensuelle=65j / Trimestrielle=100j / Annuelle=380j
    SELECT
        CD_EXPEDITEUR,
        Frequence,
        JoursRetard,
        CASE Frequence
            WHEN 'Mensuelle'     THEN 35
            WHEN 'Bimensuelle'   THEN 65
            WHEN 'Trimestrielle' THEN 100
            WHEN 'Annuelle'      THEN 380
            ELSE 35
        END AS JoursCycle
    FROM (VALUES
        ('EXP_AXB',    'Mensuelle',     4),
        ('EXP_BNP',    'Mensuelle',     4),
        ('EXP_BOURS',  'Mensuelle',     4),
        ('EXP_CA',     'Trimestrielle', 10),
        ('EXP_CDN',    'Trimestrielle', 10),
        ('EXP_CFF',    'Mensuelle',     4),
        ('EXP_CICMUT', 'Mensuelle',     4),
        ('EXP_HSBC',   'Mensuelle',     4),
        ('EXP_ING',    'Trimestrielle', 10),
        ('EXP_LBP',    'Mensuelle',     4),
        ('EXP_LCL',    'Mensuelle',     4),
        ('EXP_SG_CDN', 'Mensuelle',     4)
    ) AS t(CD_EXPEDITEUR, Frequence, JoursRetard)
),
mois AS (
    SELECT DISTINCT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM
    FROM DADP.dbo.DADP_STOCK
),
perim AS (
    SELECT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM,
        ROW_NUMBER() OVER (
            PARTITION BY CD_EXPEDITEUR
            ORDER BY CD_DAT_ARR_AAM DESC
        ) AS rn
    FROM mois
),
agg AS (
    SELECT
        DS.CD_EXPEDITEUR,
        DS.CD_DAT_ARR_AAM,
        MAX(DS.NO_SEQ) AS NO_SEQ,
        SUM(ISNULL(TRY_CONVERT(INT, DS.FL_FOR), 0)) AS SUM_FL_FOR,
        SUM(ISNULL(TRY_CONVERT(INT, DS.FL_DEF), 0)) AS SUM_FL_DEF,
        SUM(ISNULL(TRY_CONVERT(INT, DS.FL_NPE), 0)) AS SUM_FL_NPE,
        SUM(ISNULL(TRY_CONVERT(INT, DS.FL_IMP), 0)) AS SUM_FL_IMP,
        MAX(DS.DT_MAJ) AS DT_CHARGEMENT_INEO
    FROM DADP.dbo.DADP_STOCK DS
    INNER JOIN perim P
        ON DS.CD_EXPEDITEUR  = P.CD_EXPEDITEUR
       AND DS.CD_DAT_ARR_AAM = P.CD_DAT_ARR_AAM
    WHERE P.rn <= 2
    GROUP BY
        DS.CD_EXPEDITEUR,
        DS.CD_DAT_ARR_AAM
),
calc AS (
    SELECT
        *,
        LAG(SUM_FL_FOR) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_FOR,
        LAG(SUM_FL_DEF) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_DEF,
        LAG(SUM_FL_NPE) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_NPE,
        LAG(SUM_FL_IMP) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PREV_FL_IMP,
        MAX(CD_DAT_ARR_AAM) OVER (PARTITION BY CD_EXPEDITEUR) AS MAX_ARR_AAM
    FROM agg
)

INSERT INTO DADP.dbo.DADP_STOCK_EVOL_MAIL
(
    Expediteur,
    Arrete,
    [Sequence],
    Somme_FOR,
    Evolution_FOR,
    Somme_DEF,
    Evolution_DEF,
    Somme_NPE,
    Evolution_NPE,
    Somme_IMP,
    Evolution_IMP,
    Date_chargement_INEO,
    Frequence,
    Statut
)
SELECT
    C.CD_EXPEDITEUR AS Expediteur,

    TRY_CONVERT(
        DATE,
        RIGHT('000000' + CAST(C.CD_DAT_ARR_AAM AS VARCHAR(6)), 6) + '01',
        112
    ) AS Arrete,

    C.NO_SEQ AS [Sequence],

    C.SUM_FL_FOR AS Somme_FOR,
    CASE
        WHEN C.PREV_FL_FOR IS NULL OR C.PREV_FL_FOR = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((C.SUM_FL_FOR * 1.0 / C.PREV_FL_FOR) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_FOR,

    C.SUM_FL_DEF AS Somme_DEF,
    CASE
        WHEN C.PREV_FL_DEF IS NULL OR C.PREV_FL_DEF = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((C.SUM_FL_DEF * 1.0 / C.PREV_FL_DEF) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_DEF,

    C.SUM_FL_NPE AS Somme_NPE,
    CASE
        WHEN C.PREV_FL_NPE IS NULL OR C.PREV_FL_NPE = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((C.SUM_FL_NPE * 1.0 / C.PREV_FL_NPE) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_NPE,

    C.SUM_FL_IMP AS Somme_IMP,
    CASE
        WHEN C.PREV_FL_IMP IS NULL OR C.PREV_FL_IMP = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((C.SUM_FL_IMP * 1.0 / C.PREV_FL_IMP) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_IMP,

    C.DT_CHARGEMENT_INEO AS Date_chargement_INEO,

    -- Fréquence lue depuis le référentiel
    R.Frequence,

    -- Statut : RETARD si jours écoulés depuis dernier arrêté > cycle + tolérance
    CASE
        WHEN DATEDIFF(day,
                 TRY_CONVERT(DATE, RIGHT('000000' + CAST(C.MAX_ARR_AAM AS VARCHAR(6)), 6) + '01', 112),
                 GETDATE()
             ) > (R.JoursCycle + R.JoursRetard)
        THEN 'RETARD'
        ELSE 'RECU'
    END AS Statut

FROM calc C
LEFT JOIN ref R ON R.CD_EXPEDITEUR = C.CD_EXPEDITEUR
ORDER BY C.CD_EXPEDITEUR, C.CD_DAT_ARR_AAM;
