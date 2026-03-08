import { FormField } from "../types";

const fieldsMap: Record<number, FormField[]> = {
  1: [
    { id: "age", label: "Âge", type: "number", placeholder: "35" },
    { id: "revenus", label: "Revenus mensuels nets", type: "number", placeholder: "5000", suffix: "€" },
    { id: "depenses", label: "Dépenses mensuelles", type: "number", placeholder: "3500", suffix: "€" },
    { id: "epargne", label: "Épargne totale", type: "number", placeholder: "50000", suffix: "€" },
    { id: "dettes", label: "Dettes totales", type: "number", placeholder: "15000", suffix: "€" },
    { id: "investissements", label: "Investissements", type: "number", placeholder: "30000", suffix: "€" },
    { id: "assurances", label: "Assurances actuelles", type: "textarea", placeholder: "Décrivez vos contrats d'assurance..." },
    { id: "objectifs", label: "Objectifs financiers", type: "textarea", placeholder: "Quels sont vos objectifs financiers ?" },
  ],
  2: [
    { id: "age", label: "Âge", type: "number", placeholder: "35" },
    { id: "epargne_retraite", label: "Épargne retraite actuelle", type: "number", placeholder: "50000", suffix: "€" },
    { id: "revenus_annuels", label: "Revenus annuels", type: "number", placeholder: "60000", suffix: "€" },
    { id: "capacite_epargne", label: "Capacité d'épargne mensuelle", type: "number", placeholder: "800", suffix: "€" },
    { id: "age_retraite", label: "Âge de retraite souhaité", type: "number", placeholder: "62" },
    { id: "niveau_vie", label: "Niveau de vie souhaité à la retraite", type: "number", placeholder: "3000", suffix: "€/mois" },
  ],
  3: [
    { id: "age", label: "Âge", type: "number", placeholder: "35" },
    { id: "actifs_investissables", label: "Actifs investissables", type: "number", placeholder: "100000", suffix: "€" },
    { id: "tolerance_risque", label: "Tolérance au risque", type: "select", options: [
      { value: "conservateur", label: "Conservateur" },
      { value: "modere", label: "Modéré" },
      { value: "agressif", label: "Agressif" },
      { value: "tres_agressif", label: "Très agressif" },
    ]},
    { id: "horizon", label: "Horizon de placement (années)", type: "number", placeholder: "20" },
    { id: "revenus_passifs", label: "Besoins de revenus passifs", type: "number", placeholder: "500", suffix: "€/mois" },
    { id: "preferences", label: "Préférences ou restrictions", type: "textarea", placeholder: "ESG, secteurs exclus, etc." },
  ],
  4: [
    { id: "sources_revenus", label: "Sources de revenus", type: "textarea", placeholder: "Salaire, freelance, revenus locatifs..." },
    { id: "statut_fiscal", label: "Statut fiscal", type: "select", options: [
      { value: "celibataire", label: "Célibataire" },
      { value: "marie_pacse", label: "Marié / Pacsé" },
      { value: "divorce", label: "Divorcé" },
      { value: "veuf", label: "Veuf" },
    ]},
    { id: "lieu_residence", label: "Lieu de résidence", type: "text", placeholder: "Paris, France" },
    { id: "entreprise", label: "Entreprise éventuelle", type: "textarea", placeholder: "Type d'entreprise, statut juridique..." },
    { id: "investissements", label: "Investissements actuels", type: "textarea", placeholder: "PEA, assurance-vie, immobilier..." },
    { id: "deductions", label: "Déductions actuelles", type: "textarea", placeholder: "Déductions fiscales utilisées..." },
  ],
  5: [
    { id: "dettes_detail", label: "Liste des dettes (une par ligne : nom, solde, taux%, paiement min)", type: "textarea", placeholder: "Crédit auto : 15000€, 4.5%, 350€/mois\nCarte crédit : 3000€, 18%, 90€/mois" },
    { id: "revenu_mensuel", label: "Revenu mensuel net", type: "number", placeholder: "4000", suffix: "€" },
    { id: "extra_remboursement", label: "Argent supplémentaire pour rembourser", type: "number", placeholder: "500", suffix: "€/mois" },
  ],
  6: [
    { id: "revenu_mensuel", label: "Revenu mensuel", type: "number", placeholder: "4000", suffix: "€" },
    { id: "depenses_mensuelles", label: "Dépenses mensuelles", type: "number", placeholder: "3000", suffix: "€" },
    { id: "epargne_urgence", label: "Épargne d'urgence actuelle", type: "number", placeholder: "5000", suffix: "€" },
    { id: "stabilite_emploi", label: "Stabilité de l'emploi", type: "select", options: [
      { value: "cdi_stable", label: "CDI stable" },
      { value: "cdi_instable", label: "CDI secteur instable" },
      { value: "cdd_interim", label: "CDD / Intérim" },
      { value: "freelance", label: "Freelance / Indépendant" },
      { value: "entrepreneur", label: "Entrepreneur" },
    ]},
    { id: "personnes_charge", label: "Personnes à charge", type: "text", placeholder: "2 enfants, conjoint" },
    { id: "objectif_mois", label: "Objectif de constitution", type: "select", options: [
      { value: "6", label: "6 mois" },
      { value: "12", label: "12 mois" },
      { value: "18", label: "18 mois" },
      { value: "24", label: "24 mois" },
    ]},
  ],
  7: [
    { id: "contrats", label: "Contrats actuels", type: "textarea", placeholder: "Assurance habitation, auto, santé, vie..." },
    { id: "famille", label: "Taille de la famille", type: "text", placeholder: "Couple + 2 enfants" },
    { id: "revenus_annuels", label: "Revenus annuels", type: "number", placeholder: "60000", suffix: "€" },
    { id: "actifs_totaux", label: "Actifs totaux", type: "number", placeholder: "200000", suffix: "€" },
    { id: "sante", label: "État de santé", type: "textarea", placeholder: "Bon, conditions préexistantes..." },
    { id: "preoccupations", label: "Préoccupations couverture", type: "textarea", placeholder: "Lacunes identifiées, besoins spécifiques..." },
  ],
  8: [
    { id: "ages_enfants", label: "Âge des enfants", type: "text", placeholder: "5 ans, 8 ans" },
    { id: "ecoles_ciblees", label: "Écoles ciblées", type: "textarea", placeholder: "Grandes écoles, universités..." },
    { id: "epargne_etudes", label: "Épargne études actuelle", type: "number", placeholder: "10000", suffix: "€" },
    { id: "capacite_epargne", label: "Capacité d'épargne mensuelle", type: "number", placeholder: "300", suffix: "€" },
    { id: "lieu_residence", label: "Lieu de résidence", type: "text", placeholder: "Paris, France" },
    { id: "revenus_foyer", label: "Revenus annuels du foyer", type: "number", placeholder: "80000", suffix: "€" },
  ],
  9: [
    { id: "actifs", label: "Actifs", type: "textarea", placeholder: "Immobilier, comptes, investissements..." },
    { id: "structure_familiale", label: "Structure familiale", type: "textarea", placeholder: "Conjoint, enfants, parents..." },
    { id: "documents_existants", label: "Documents successoraux existants", type: "textarea", placeholder: "Testament, assurance-vie, donation..." },
    { id: "lieu_residence", label: "Lieu de résidence", type: "text", placeholder: "Paris, France" },
    { id: "souhaits", label: "Souhaits pour la transmission", type: "textarea", placeholder: "Répartition souhaitée, dons..." },
  ],
  10: [
    { id: "prix_bien", label: "Prix du bien", type: "number", placeholder: "250000", suffix: "€" },
    { id: "loyer_mensuel", label: "Loyer mensuel attendu", type: "number", placeholder: "1200", suffix: "€" },
    { id: "apport", label: "Apport", type: "number", placeholder: "50000", suffix: "€" },
    { id: "emplacement", label: "Emplacement", type: "text", placeholder: "Lyon 3ème" },
    { id: "etat_bien", label: "État du bien", type: "select", options: [
      { value: "neuf", label: "Neuf" },
      { value: "bon_etat", label: "Bon état" },
      { value: "travaux_legers", label: "Travaux légers" },
      { value: "renovation_complete", label: "Rénovation complète" },
    ]},
    { id: "objectifs_investissement", label: "Objectifs d'investissement", type: "textarea", placeholder: "Rendement locatif, plus-value..." },
  ],
  11: [
    { id: "revenu_mensuel", label: "Revenu mensuel net", type: "number", placeholder: "4000", suffix: "€" },
    { id: "depenses_detaillees", label: "Toutes les dépenses détaillées", type: "textarea", placeholder: "Loyer: 1200€, Alimentation: 400€..." },
    { id: "dettes_cours", label: "Dettes en cours", type: "textarea", placeholder: "Crédit immobilier, crédit conso..." },
    { id: "objectifs_epargne", label: "Objectifs d'épargne", type: "textarea", placeholder: "Vacances, voiture, apport..." },
    { id: "habitudes", label: "Habitudes de dépenses à changer", type: "textarea", placeholder: "Restaurants trop fréquents..." },
  ],
  12: [
    { id: "age", label: "Âge", type: "number", placeholder: "35" },
    { id: "revenus_annuels", label: "Revenus annuels", type: "number", placeholder: "60000", suffix: "€" },
    { id: "patrimoine_net", label: "Patrimoine net actuel", type: "number", placeholder: "100000", suffix: "€" },
    { id: "projets_familiaux", label: "Projets familiaux", type: "textarea", placeholder: "Mariage, enfants, achat..." },
    { id: "trajectoire_carriere", label: "Trajectoire de carrière", type: "textarea", placeholder: "Évolution prévue..." },
    { id: "objectifs_financiers", label: "Plus grands objectifs financiers", type: "textarea", placeholder: "Indépendance financière..." },
    { id: "liberte_financiere", label: "Ce que signifie la liberté financière", type: "textarea", placeholder: "Ne plus avoir besoin de travailler..." },
  ],
};

export function getFieldsForModule(moduleId: number): FormField[] {
  return fieldsMap[moduleId] || [];
}
