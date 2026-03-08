import { FormData } from "../types";

interface PromptConfig {
  system: string;
  buildUserPrompt: (data: FormData) => string;
}

const promptConfigs: Record<number, PromptConfig> = {
  1: {
    system: `Tu es un conseiller senior en gestion de patrimoine chez Goldman Sachs Private Wealth Management qui construit des plans financiers complets pour des clients possédant plus de 10 millions de dollars d'actifs. Réponds toujours en français. Utilise un ton professionnel et structuré.`,
    buildUserPrompt: (d) => `J'ai besoin d'un diagnostic complet de ma santé financière.\n\nMes informations :\n- Âge : ${d.age} ans\n- Revenus mensuels nets : ${d.revenus}€\n- Dépenses mensuelles : ${d.depenses}€\n- Épargne totale : ${d.epargne}€\n- Dettes totales : ${d.dettes}€\n- Investissements : ${d.investissements}€\n- Assurances : ${d.assurances}\n- Objectifs : ${d.objectifs}\n\nAnalyse complète : calcul patrimoine net, cash-flow, fonds d'urgence, dettes, audit assurances, allocation investissement, préparation retraite, efficacité fiscale, planification successorale, score global /100 avec 3 actions prioritaires. Format rapport Goldman Sachs.`,
  },
  2: {
    system: `Tu es le stratège en chef de la planification retraite chez Vanguard. Réponds toujours en français avec des données chiffrées.`,
    buildUserPrompt: (d) => `Plan de retraite complet.\n\nSituation :\n- Âge : ${d.age} ans\n- Épargne retraite : ${d.epargne_retraite}€\n- Revenus annuels : ${d.revenus_annuels}€\n- Capacité d'épargne : ${d.capacite_epargne}€/mois\n- Âge retraite souhaité : ${d.age_retraite} ans\n- Niveau de vie souhaité : ${d.niveau_vie}€/mois\n\nInclure : objectif retraite, épargne mensuelle, allocation évolutive, stratégie de comptes, match employeur, stratégie de retrait, inflation, coûts santé. Format rapport Vanguard.`,
  },
  3: {
    system: `Tu es un stratège senior chez Morgan Stanley Wealth Management. Réponds en français.`,
    buildUserPrompt: (d) => `Portefeuille d'investissement complet.\n\nProfil :\n- Âge : ${d.age} ans\n- Actifs investissables : ${d.actifs_investissables}€\n- Tolérance au risque : ${d.tolerance_risque}\n- Horizon : ${d.horizon} ans\n- Revenus passifs : ${d.revenus_passifs}€/mois\n- Préférences : ${d.preferences}\n\nInclure : allocation exacte (%), ETF/fonds avec symboles et frais, cœur/satellites, diversification, revenus + croissance, rééquilibrage, optimisation fiscale, benchmark. Format déclaration Morgan Stanley.`,
  },
  4: {
    system: `Tu es un associé fiscal senior chez Deloitte. Réponds en français avec le système fiscal français.`,
    buildUserPrompt: (d) => `Stratégie d'optimisation fiscale complète.\n\nSituation :\n- Revenus : ${d.sources_revenus}\n- Statut : ${d.statut_fiscal}\n- Résidence : ${d.lieu_residence}\n- Entreprise : ${d.entreprise}\n- Investissements : ${d.investissements}\n- Déductions : ${d.deductions}\n\nOptimiser : tranches, contributions retraite, tax-loss harvesting, déductions entrepreneurs, timing revenus, plus-values, dons, PER, transmission. Format mémo Deloitte avec économies par stratégie + calendrier fiscal.`,
  },
  5: {
    system: `Tu es un conseiller financier senior chez JPMorgan Private Bank. Réponds en français.`,
    buildUserPrompt: (d) => `Plan d'élimination des dettes.\n\nDettes :\n${d.dettes_detail}\n\n- Revenu mensuel : ${d.revenu_mensuel}€\n- Extra disponible : ${d.extra_remboursement}€/mois\n\nInclure : inventaire, avalanche vs boule de neige, impact +100/+250/+500€, économies d'intérêts, refinancement, consolidation, plan motivation. Format feuille de route JPMorgan avec calendrier mois par mois.`,
  },
  6: {
    system: `Tu es le directeur de la planification financière chez Charles Schwab. Réponds en français.`,
    buildUserPrompt: (d) => `Plan fonds d'urgence.\n\nSituation :\n- Revenu : ${d.revenu_mensuel}€/mois\n- Dépenses : ${d.depenses_mensuelles}€/mois\n- Épargne urgence : ${d.epargne_urgence}€\n- Emploi : ${d.stabilite_emploi}\n- Personnes à charge : ${d.personnes_charge}\n- Objectif : ${d.objectif_mois} mois\n\nInclure : accélération épargne, placement, comptes haut rendement, niveaux trésorerie, sinking funds, automatisation, cash vs investissement. Format plan Charles Schwab.`,
  },
  7: {
    system: `Tu es un conseiller financier senior chez Northwestern Mutual. Réponds en français.`,
    buildUserPrompt: (d) => `Audit complet des assurances.\n\nSituation :\n- Contrats : ${d.contrats}\n- Famille : ${d.famille}\n- Revenus annuels : ${d.revenus_annuels}€\n- Actifs : ${d.actifs_totaux}€\n- Santé : ${d.sante}\n- Préoccupations : ${d.preoccupations}\n\nInclure : assurance vie, santé, invalidité, auto/habitation, RC, lacunes, bénéficiaires, optimisation primes. Format rapport Northwestern Mutual.`,
  },
  8: {
    system: `Tu es un stratège en épargne éducative chez Fidelity Investments. Réponds en français.`,
    buildUserPrompt: (d) => `Plan épargne études.\n\nSituation :\n- Enfants : ${d.ages_enfants}\n- Écoles : ${d.ecoles_ciblees}\n- Épargne études : ${d.epargne_etudes}€\n- Capacité épargne : ${d.capacite_epargne}€/mois\n- Résidence : ${d.lieu_residence}\n- Revenus foyer : ${d.revenus_foyer}€\n\nInclure : projection coûts, véhicules épargne, allocation évolutive, bourses, stratégie multi-enfants, contributions grands-parents. Format plan Fidelity.`,
  },
  9: {
    system: `Tu es un conseiller en planification successorale chez Edward Jones. Réponds en français.`,
    buildUserPrompt: (d) => `Planification successorale.\n\nSituation :\n- Actifs : ${d.actifs}\n- Famille : ${d.structure_familiale}\n- Documents : ${d.documents_existants}\n- Résidence : ${d.lieu_residence}\n- Souhaits : ${d.souhaits}\n\nInclure : documents essentiels, audit bénéficiaires, trusts, probate, actifs numériques, tuteur, transmission fiscale, lettre d'intention. Format guide Edward Jones.`,
  },
  10: {
    system: `Tu es un analyste en investissement immobilier chez Wealthfront. Réponds en français.`,
    buildUserPrompt: (d) => `Analyse investissement immobilier.\n\nBien :\n- Prix : ${d.prix_bien}€\n- Loyer mensuel : ${d.loyer_mensuel}€\n- Apport : ${d.apport}€\n- Emplacement : ${d.emplacement}\n- État : ${d.etat_bien}\n- Objectifs : ${d.objectifs_investissement}\n\nInclure : cash-flow, cap rate, rendement, appréciation 5/10/20 ans, louer vs acheter, SCPI, avantages fiscaux (Pinel, LMNP), vacance, effet de levier, seuil rentabilité. Format analyse Wealthfront.`,
  },
  11: {
    system: `Tu es un coach financier senior chez Ramsey Solutions. Réponds en français.`,
    buildUserPrompt: (d) => `Budget complet optimisé.\n\nSituation :\n- Revenu mensuel : ${d.revenu_mensuel}€\n- Dépenses : ${d.depenses_detaillees}\n- Dettes : ${d.dettes_cours}\n- Objectifs épargne : ${d.objectifs_epargne}\n- Habitudes à changer : ${d.habitudes}\n\nInclure : budget base zéro, besoins vs envies, top 5 réductions, calendrier factures, automatisation, dettes, dépenses irrégulières, suivi hebdomadaire, révision mensuelle. Format Ramsey Solutions.`,
  },
  12: {
    system: `Tu es le directeur de la planification financière chez BlackRock. Réponds en français.`,
    buildUserPrompt: (d) => `Feuille de route financière à vie.\n\nProfil :\n- Âge : ${d.age} ans\n- Revenus annuels : ${d.revenus_annuels}€\n- Patrimoine net : ${d.patrimoine_net}€\n- Projets familiaux : ${d.projets_familiaux}\n- Carrière : ${d.trajectoire_carriere}\n- Objectifs : ${d.objectifs_financiers}\n- Liberté financière : ${d.liberte_financiere}\n\nInclure : priorités décennie, objectifs patrimoine 30/40/50/60/70 ans, croissance revenus, taux épargne, évolution investissements, grands achats, indépendance financière, transmission, risques par étape, tableau de bord. Format feuille de route BlackRock.`,
  },
};

export function getPromptConfig(moduleId: number): PromptConfig | undefined {
  return promptConfigs[moduleId];
}
