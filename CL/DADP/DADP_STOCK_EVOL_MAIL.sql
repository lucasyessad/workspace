-- ============================================================================
-- DADP_STOCK_EVOL_MAIL.sql
-- Génère les données de notification mail DADP : 2 arrêtés par expéditeur
-- avec évolutions + colonnes Frequence et Statut (RECU/RETARD) pré-calculées.
-- Doit être exécuté par ODI après le chargement de DADP_STOCK.
-- ============================================================================

TRUNCATE TABLE DADP.dbo.DADP_STOCK_EVOL_MAIL;

WITH mois AS (
    -- Dernier NO_SEQ par (expéditeur, arrêté) : table historisée, on garde
    -- uniquement la séquence maximale = le chargement le plus récent
    SELECT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM,
        MAX(NO_SEQ) AS NO_SEQ
    FROM DADP.dbo.DADP_STOCK
    GROUP BY CD_EXPEDITEUR, CD_DAT_ARR_AAM
),
perim AS (
    -- Rang des arrêtés par expéditeur (rn=1 = le plus récent)
    SELECT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM,
        NO_SEQ,
        ROW_NUMBER() OVER (
            PARTITION BY CD_EXPEDITEUR
            ORDER BY CD_DAT_ARR_AAM DESC
        ) AS rn
    FROM mois
),
agg AS (
    -- Agrégation des flags sur la dernière séquence des 2 derniers arrêtés
    SELECT
        p.CD_EXPEDITEUR,
        p.CD_DAT_ARR_AAM,
        p.NO_SEQ,
        p.rn,
        SUM(CASE WHEN s.FL_FOR = 1 THEN 1 ELSE 0 END) AS SommeFlgFOR,
        SUM(CASE WHEN s.FL_DEF = 1 THEN 1 ELSE 0 END) AS SommeFlgDEF,
        SUM(CASE WHEN s.FL_NPE = 1 THEN 1 ELSE 0 END) AS SommeFlgNPE,
        SUM(CASE WHEN s.FL_IMP = 1 THEN 1 ELSE 0 END) AS SommeFlgIMP,
        MAX(s.DT_MAJ) AS DT_MAJ
    FROM perim p
    JOIN DADP.dbo.DADP_STOCK s
        ON  s.CD_EXPEDITEUR  = p.CD_EXPEDITEUR
        AND s.CD_DAT_ARR_AAM = p.CD_DAT_ARR_AAM
        AND s.NO_SEQ         = p.NO_SEQ        -- filtre sur la séquence max
    WHERE p.rn <= 2
    GROUP BY
        p.CD_EXPEDITEUR,
        p.CD_DAT_ARR_AAM,
        p.NO_SEQ,
        p.rn
),
calc AS (
    -- Calcul des évolutions par rapport à la période précédente (LAG)
    -- + arrêté maximum par expéditeur pour le calcul du statut de retard
    SELECT
        CD_EXPEDITEUR,
        CD_DAT_ARR_AAM,
        NO_SEQ,
        rn,
        SommeFlgFOR,
        SommeFlgDEF,
        SommeFlgNPE,
        SommeFlgIMP,
        DT_MAJ,
        LAG(SommeFlgFOR) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PrevFlgFOR,
        LAG(SommeFlgDEF) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PrevFlgDEF,
        LAG(SommeFlgNPE) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PrevFlgNPE,
        LAG(SommeFlgIMP) OVER (PARTITION BY CD_EXPEDITEUR ORDER BY CD_DAT_ARR_AAM) AS PrevFlgIMP,
        MAX(CD_DAT_ARR_AAM) OVER (PARTITION BY CD_EXPEDITEUR) AS MaxArrAAM
    FROM agg
)
INSERT INTO DADP.dbo.DADP_STOCK_EVOL_MAIL (
    Expediteur,
    Arrete,
    Sequence,
    [Somme Flag FOR],
    [Evolution Flag FOR],
    [Somme Flag DEF],
    [Evolution Flag DEF],
    [Somme Flag NPE],
    [Evolution Flag NPE],
    [Somme Flag IMP],
    [Evolution FLAG IMP],
    [Date chargement INEO],
    Frequence,
    Statut
)
SELECT
    CD_EXPEDITEUR AS Expediteur,
    DATEFROMPARTS(CD_DAT_ARR_AAM / 100, CD_DAT_ARR_AAM % 100, 1) AS Arrete,
    NO_SEQ        AS Sequence,             -- séquence réelle (MAX par arrêté)

    SommeFlgFOR AS [Somme Flag FOR],
    CASE
        WHEN PrevFlgFOR IS NULL OR PrevFlgFOR = 0 THEN ''
        ELSE REPLACE(CONVERT(VARCHAR(10),
             CAST(ROUND((SommeFlgFOR - PrevFlgFOR) * 100.0 / PrevFlgFOR, 1) AS DECIMAL(10,1))
             ), '.', ',') + '%'
    END AS [Evolution Flag FOR],

    SommeFlgDEF AS [Somme Flag DEF],
    CASE
        WHEN PrevFlgDEF IS NULL OR PrevFlgDEF = 0 THEN ''
        ELSE REPLACE(CONVERT(VARCHAR(10),
             CAST(ROUND((SommeFlgDEF - PrevFlgDEF) * 100.0 / PrevFlgDEF, 1) AS DECIMAL(10,1))
             ), '.', ',') + '%'
    END AS [Evolution Flag DEF],

    SommeFlgNPE AS [Somme Flag NPE],
    CASE
        WHEN PrevFlgNPE IS NULL OR PrevFlgNPE = 0 THEN ''
        ELSE REPLACE(CONVERT(VARCHAR(10),
             CAST(ROUND((SommeFlgNPE - PrevFlgNPE) * 100.0 / PrevFlgNPE, 1) AS DECIMAL(10,1))
             ), '.', ',') + '%'
    END AS [Evolution Flag NPE],

    SommeFlgIMP AS [Somme Flag IMP],
    CASE
        WHEN PrevFlgIMP IS NULL OR PrevFlgIMP = 0 THEN ''
        ELSE REPLACE(CONVERT(VARCHAR(10),
             CAST(ROUND((SommeFlgIMP - PrevFlgIMP) * 100.0 / PrevFlgIMP, 1) AS DECIMAL(10,1))
             ), '.', ',') + '%'
    END AS [Evolution FLAG IMP],

    DT_MAJ AS [Date chargement INEO],

    -- Fréquence d'envoi attendue par expéditeur (référentiel)
    CASE CD_EXPEDITEUR
        WHEN 'EXP_CA'  THEN 'Trimestrielle'
        WHEN 'EXP_CDN' THEN 'Trimestrielle'
        WHEN 'EXP_ING' THEN 'Trimestrielle'
        ELSE                 'Mensuelle'
    END AS Frequence,

    -- Statut calculé au moment de l'exécution selon le dernier arrêté reçu
    -- Seuil Mensuelle     : 35 j (cycle) + 4 j (tolérance) = 39 j
    -- Seuil Trimestrielle : 100 j (cycle) + 10 j (tolérance) = 110 j
    CASE CD_EXPEDITEUR
        WHEN 'EXP_CA'  THEN CASE WHEN DATEDIFF(day, DATEFROMPARTS(MaxArrAAM / 100, MaxArrAAM % 100, 1), GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        WHEN 'EXP_CDN' THEN CASE WHEN DATEDIFF(day, DATEFROMPARTS(MaxArrAAM / 100, MaxArrAAM % 100, 1), GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        WHEN 'EXP_ING' THEN CASE WHEN DATEDIFF(day, DATEFROMPARTS(MaxArrAAM / 100, MaxArrAAM % 100, 1), GETDATE()) > 110 THEN 'RETARD' ELSE 'RECU' END
        ELSE                 CASE WHEN DATEDIFF(day, DATEFROMPARTS(MaxArrAAM / 100, MaxArrAAM % 100, 1), GETDATE()) >  39 THEN 'RETARD' ELSE 'RECU' END
    END AS Statut

FROM calc
ORDER BY CD_EXPEDITEUR, CD_DAT_ARR_AAM;
