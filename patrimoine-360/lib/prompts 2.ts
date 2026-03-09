import { FormData } from "@/types";

interface PromptConfig {
  system: string;
  buildUserPrompt: (data: FormData) => string;
}

const promptConfigs: Record<number, PromptConfig> = {
  1: {
    system: `Tu es un conseiller senior en gestion de patrimoine chez Goldman Sachs Private Wealth Management qui construit des plans financiers complets pour des clients possédant plus de 10 millions de dollars d'actifs. Réponds toujours en français. Utilise un ton professionnel et structuré.`,
    buildUserPrompt: (d) => `J'ai besoin d'un diagnostic complet de ma santé financière.

Mes informations :
- Âge : ${d.age} ans
- Revenus mensuels nets : ${d.revenus}€
- Dépenses mensuelles : ${d.depenses}€
- Épargne totale : ${d.epargne}€
- Dettes totales : ${d.dettes}€
- Investissements : ${d.investissements}€
- Assurances : ${d.assurances}
- Objectifs : ${d.objectifs}

Analyse complète demandée :
1. Calcul du patrimoine net avec bilan clair
2. Analyse du cash-flow avec taux d'épargne
3. Évaluation du fonds d'urgence
4. Analyse des dettes par taux d'intérêt
5. Audit des assurances
6. Analyse de l'allocation d'investissement
7. Score de préparation à la retraite
8. Vérification de l'efficacité fiscale
9. Statut de planification successorale
10. Score global de santé financière /100 avec 3 actions prioritaires

Format : rapport Goldman Sachs Private Wealth avec tableau de score résumé et plan d'action priorisé.`,
  },
  2: {
    system: `Tu es le stratège en chef de la planification retraite chez Vanguard, qui conçoit des plans de retraite pour des millions d'investisseurs. Réponds toujours en français. Utilise un ton professionnel avec des données chiffrées.`,
    buildUserPrompt: (d) => `J'ai besoin d'un plan de retraite complet.

Ma situation :
- Âge : ${d.age} ans
- Épargne retraite actuelle : ${d.epargne_retraite}€
- Revenus annuels : ${d.revenus_annuels}€
- Capacité d'épargne mensuelle : ${d.capacite_epargne}€
- Âge de retraite souhaité : ${d.age_retraite} ans
- Niveau de vie souhaité à la retraite : ${d.niveau_vie}€/mois

Plan demandé :
1. Objectif de retraite (taille du portefeuille nécessaire)
2. Objectif d'épargne mensuelle
3. Allocation d'investissement évolutive selon l'âge
4. Stratégie de comptes (retraite vs imposables)
5. Optimisation match employeur
6. Moment optimal pour la pension
7. Stratégie de retrait
8. Ajustement à l'inflation
9. Projection des coûts de santé
10. Répartition des revenus de retraite

Format : rapport Vanguard avec tableaux de projection, jalons d'épargne par âge et calendrier de retrait.`,
  },
  3: {
    system: `Tu es un stratège senior en gestion de portefeuille chez Morgan Stanley Wealth Management, qui construit des portefeuilles personnalisés pour des clients fortunés. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un portefeuille d'investissement complet.

Mon profil :
- Âge : ${d.age} ans
- Actifs investissables : ${d.actifs_investissables}€
- Tolérance au risque : ${d.tolerance_risque}
- Horizon de placement : ${d.horizon} ans
- Besoins de revenus passifs : ${d.revenus_passifs}€/mois
- Préférences/restrictions : ${d.preferences}

Construire :
1. Allocation d'actifs exacte (%)
2. Sélection de fonds/ETF avec symboles, frais, justification
3. Structure cœur/satellites
4. Profil de risque aligné
5. Contrôle de diversification
6. Couche revenus + couche croissance
7. Règles de rééquilibrage
8. Optimisation fiscale
9. Suivi de benchmark

Format : déclaration de politique d'investissement Morgan Stanley avec tableaux d'allocation, justification des fonds et calendrier de rééquilibrage.`,
  },
  4: {
    system: `Tu es un associé fiscal senior chez Deloitte, qui aide les hauts revenus et entrepreneurs à économiser des centaines de milliers d'euros d'impôts. Réponds toujours en français avec le système fiscal français.`,
    buildUserPrompt: (d) => `J'ai besoin d'une stratégie complète d'optimisation fiscale.

Ma situation fiscale :
- Sources de revenus : ${d.sources_revenus}
- Statut fiscal : ${d.statut_fiscal}
- Lieu de résidence : ${d.lieu_residence}
- Entreprise : ${d.entreprise}
- Investissements : ${d.investissements}
- Déductions actuelles : ${d.deductions}

Optimiser :
1. Analyse situation fiscale actuelle
2. Gestion des tranches d'imposition
3. Maximisation contributions retraite
4. Tax-loss harvesting
5. Déductions pour entrepreneurs
6. Timing des revenus
7. Gestion des plus-values
8. Dons caritatifs optimisés
9. Avantage fiscal HSA / PER
10. Transmission patrimoniale

Format : mémo Deloitte avec estimation des économies par stratégie, étapes de mise en œuvre et calendrier fiscal annuel.`,
  },
  5: {
    system: `Tu es un conseiller financier senior chez JPMorgan Private Bank qui conçoit des stratégies agressives de remboursement de dettes. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un plan complet d'élimination de mes dettes.

Mes dettes :
${d.dettes_detail}

- Revenu mensuel net : ${d.revenu_mensuel}€
- Argent supplémentaire disponible : ${d.extra_remboursement}€/mois

Analyser :
1. Inventaire complet des dettes
2. Comparaison avalanche vs boule de neige avec calculs précis
3. Répartition des paiements mensuels
4. Impact des paiements supplémentaires (+100€, +250€, +500€/mois)
5. Calcul des économies d'intérêts
6. Opportunités de refinancement
7. Analyse de consolidation
8. Stratégie de transfert de solde
9. Idées pour augmenter les revenus
10. Plan de motivation par étapes

Format : feuille de route JPMorgan avec calendrier de remboursement mois par mois, tableau des économies d'intérêts et compteur date zéro dette.`,
  },
  6: {
    system: `Tu es le directeur senior de la planification financière chez Charles Schwab. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un plan de constitution de fonds d'urgence complet.

Ma situation :
- Revenu mensuel : ${d.revenu_mensuel}€
- Dépenses mensuelles : ${d.depenses_mensuelles}€
- Épargne d'urgence actuelle : ${d.epargne_urgence}€
- Stabilité de l'emploi : ${d.stabilite_emploi}
- Personnes à charge : ${d.personnes_charge}
- Objectif : ${d.objectif_mois} mois de dépenses

Analyser :
1. Plan d'accélération de l'épargne
2. Stratégie de placement des comptes
3. Comparatif comptes à haut rendement
4. Système de niveaux de trésorerie
5. Fonds dédiés (sinking funds)
6. Système d'épargne automatisé
7. Cash vs investissement
8. Fonds d'opportunité
9. Calendrier des flux

Format : plan de gestion de trésorerie Charles Schwab complet.`,
  },
  7: {
    system: `Tu es un conseiller financier senior chez Northwestern Mutual. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un audit complet de mes assurances.

Ma situation :
- Contrats actuels : ${d.contrats}
- Famille : ${d.famille}
- Revenus annuels : ${d.revenus_annuels}€
- Actifs totaux : ${d.actifs_totaux}€
- État de santé : ${d.sante}
- Préoccupations : ${d.preoccupations}

Analyser :
1. Besoins assurance vie
2. Comparaison temporaire vs vie entière
3. Optimisation assurance santé
4. Vérification invalidité
5. Analyse auto/habitation
6. Responsabilité civile complémentaire
7. Lacunes de couverture
8. Audit bénéficiaires
9. Optimisation primes
10. Calendrier révision annuelle

Format : rapport Northwestern Mutual avec tableau récapitulatif et estimation des économies.`,
  },
  8: {
    system: `Tu es un stratège senior en épargne éducative chez Fidelity Investments. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un plan d'épargne études complet.

Ma situation :
- Âge des enfants : ${d.ages_enfants}
- Écoles ciblées : ${d.ecoles_ciblees}
- Épargne études actuelle : ${d.epargne_etudes}€
- Capacité d'épargne mensuelle : ${d.capacite_epargne}€
- Lieu de résidence : ${d.lieu_residence}
- Revenus annuels du foyer : ${d.revenus_foyer}€

Analyser :
1. Projection coût total
2. Analyse véhicules d'épargne (assurance-vie, PEA, comptes dédiés)
3. Objectif épargne mensuelle
4. Allocation d'investissement évolutive
5. Stratégie d'aide financière et bourses
6. Véhicules alternatifs
7. Stratégie multi-enfants
8. Contributions grands-parents
9. Plan de secours

Format : plan Fidelity avec projections de coûts, tableaux d'épargne et calendrier d'allocation.`,
  },
  9: {
    system: `Tu es un conseiller senior en planification successorale chez Edward Jones. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un plan de planification successorale complet.

Ma situation :
- Actifs : ${d.actifs}
- Structure familiale : ${d.structure_familiale}
- Documents existants : ${d.documents_existants}
- Lieu de résidence : ${d.lieu_residence}
- Souhaits : ${d.souhaits}

Analyser :
1. Documents essentiels (testament, trust, procuration, directive médicale)
2. Audit bénéficiaires
3. Titularisation des actifs
4. Analyse trusts
5. Évitement du probate
6. Plan actifs numériques
7. Désignation tuteur
8. Structure de l'héritage
9. Transmission fiscalement optimisée
10. Lettre d'intention

Format : guide Edward Jones avec checklist, suivi bénéficiaires et plan d'action.`,
  },
  10: {
    system: `Tu es un analyste senior en investissement immobilier chez Wealthfront. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'une analyse complète d'investissement immobilier.

Le bien :
- Prix : ${d.prix_bien}€
- Loyer mensuel attendu : ${d.loyer_mensuel}€
- Apport : ${d.apport}€
- Emplacement : ${d.emplacement}
- État : ${d.etat_bien}
- Objectifs : ${d.objectifs_investissement}

Analyser :
1. Projection cash-flow détaillée
2. Cap rate vs marché
3. Rendement cash-on-cash
4. Prévision d'appréciation 5/10/20 ans
5. Comparaison louer vs acheter
6. Analyse SCPI/REIT
7. Avantages fiscaux (Pinel, LMNP, etc.)
8. Réserve vacance/entretien
9. Effet de levier
10. Seuil de rentabilité

Format : analyse Wealthfront avec tableaux et recommandation acheter/passer.`,
  },
  11: {
    system: `Tu es un coach financier senior chez Ramsey Solutions. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'un budget complet optimisé.

Ma situation :
- Revenu mensuel net : ${d.revenu_mensuel}€
- Dépenses détaillées : ${d.depenses_detaillees}
- Dettes en cours : ${d.dettes_cours}
- Objectifs d'épargne : ${d.objectifs_epargne}
- Habitudes à changer : ${d.habitudes}

Créer :
1. Budget base zéro complet
2. Audit besoins vs envies
3. Objectifs réduction top 5 catégories
4. Calendrier des factures
5. Automatisation épargne
6. Intégration remboursement dettes
7. Dépenses irrégulières mensualisées
8. Prévention inflation du style de vie
9. Système de suivi hebdomadaire
10. Processus révision mensuel 15 min

Format : modèle Ramsey Solutions avec répartition par catégories, instructions automatisation et checklist révision mensuelle.`,
  },
  12: {
    system: `Tu es le directeur de la planification financière chez BlackRock. Réponds toujours en français.`,
    buildUserPrompt: (d) => `J'ai besoin d'une feuille de route financière à vie.

Mon profil :
- Âge : ${d.age} ans
- Revenus annuels : ${d.revenus_annuels}€
- Patrimoine net actuel : ${d.patrimoine_net}€
- Projets familiaux : ${d.projets_familiaux}
- Trajectoire de carrière : ${d.trajectoire_carriere}
- Plus grands objectifs : ${d.objectifs_financiers}
- Liberté financière signifie : ${d.liberte_financiere}

Créer :
1. Priorités de la décennie actuelle (3 décisions clés)
2. Objectifs patrimoine net à 30/40/50/60/70 ans
3. Stratégie croissance revenus
4. Progression taux d'épargne
5. Évolution investissements (croissance → préservation)
6. Planification grands achats
7. Objectif indépendance financière (montant exact)
8. Plan de transmission
9. Chronologie des risques par étape de vie
10. Tableau de bord financier (5 chiffres mensuels)

Format : feuille de route BlackRock avec jalons par décennie, projections patrimoine et tableau de bord sur une page.`,
  },
};

export function getPromptConfig(moduleId: number): PromptConfig | undefined {
  return promptConfigs[moduleId];
}
