-- ============================================================================
-- DADP_STOCK_EVOL_MAIL.sql
-- 2 arrêtés par expéditeur (dernier NO_SEQ) + évolutions + Frequence/Statut
-- ============================================================================

TRUNCATE TABLE DADP.dbo.DADP_STOCK_EVOL_MAIL;

WITH mois AS (
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
        -- arrêté le plus récent par expéditeur : sert à calculer le statut RECU/RETARD
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
    CD_EXPEDITEUR AS Expediteur,

    TRY_CONVERT(
        DATE,
        RIGHT('000000' + CAST(CD_DAT_ARR_AAM AS VARCHAR(6)), 6) + '01',
        112
    ) AS Arrete,

    NO_SEQ AS [Sequence],

    SUM_FL_FOR AS Somme_FOR,
    CASE
        WHEN PREV_FL_FOR IS NULL OR PREV_FL_FOR = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((SUM_FL_FOR * 1.0 / PREV_FL_FOR) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_FOR,

    SUM_FL_DEF AS Somme_DEF,
    CASE
        WHEN PREV_FL_DEF IS NULL OR PREV_FL_DEF = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((SUM_FL_DEF * 1.0 / PREV_FL_DEF) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_DEF,

    SUM_FL_NPE AS Somme_NPE,
    CASE
        WHEN PREV_FL_NPE IS NULL OR PREV_FL_NPE = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((SUM_FL_NPE * 1.0 / PREV_FL_NPE) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_NPE,

    SUM_FL_IMP AS Somme_IMP,
    CASE
        WHEN PREV_FL_IMP IS NULL OR PREV_FL_IMP = 0 THEN NULL
        ELSE REPLACE(
                 CONVERT(VARCHAR(20), CAST(ROUND(((SUM_FL_IMP * 1.0 / PREV_FL_IMP) - 1) * 100, 1) AS DECIMAL(10,1))),
                 '.', ','
             ) + '%'
    END AS Evolution_IMP,

    DT_CHARGEMENT_INEO AS Date_chargement_INEO,

    -- Fréquence d'envoi attendue par expéditeur
    CASE CD_EXPEDITEUR
        WHEN 'EXP_CA'  THEN 'Trimestrielle'
        WHEN 'EXP_CDN' THEN 'Trimestrielle'
        WHEN 'EXP_ING' THEN 'Trimestrielle'
        ELSE                 'Mensuelle'
    END AS Frequence,

    -- Statut basé sur le délai depuis le dernier arrêté reçu
    -- Mensuelle     : seuil 35 j (cycle) + 4 j (tolérance)  = 39 j
    -- Trimestrielle : seuil 100 j (cycle) + 10 j (tolérance) = 110 j
    CASE CD_EXPEDITEUR
        WHEN 'EXP_CA'  THEN CASE WHEN DATEDIFF(day,
                                     TRY_CONVERT(DATE, RIGHT('000000' + CAST(MAX_ARR_AAM AS VARCHAR(6)), 6) + '01', 112),
                                     GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        WHEN 'EXP_CDN' THEN CASE WHEN DATEDIFF(day,
                                     TRY_CONVERT(DATE, RIGHT('000000' + CAST(MAX_ARR_AAM AS VARCHAR(6)), 6) + '01', 112),
                                     GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        WHEN 'EXP_ING' THEN CASE WHEN DATEDIFF(day,
                                     TRY_CONVERT(DATE, RIGHT('000000' + CAST(MAX_ARR_AAM AS VARCHAR(6)), 6) + '01', 112),
                                     GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        ELSE                 CASE WHEN DATEDIFF(day,
                                     TRY_CONVERT(DATE, RIGHT('000000' + CAST(MAX_ARR_AAM AS VARCHAR(6)), 6) + '01', 112),
                                     GETDATE()) >  39 THEN 'RETARD' ELSE 'RECU' END
    END AS Statut

FROM calc
ORDER BY CD_EXPEDITEUR, CD_DAT_ARR_AAM;
