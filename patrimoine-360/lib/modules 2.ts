import { ModuleDefinition } from "@/types";
import { getFieldsForModule } from "./fields";

const moduleMetadata: Omit<ModuleDefinition, "fields">[] = [
  {
    id: 1,
    title: "Le Diagnostic Patrimonial",
    style: "Goldman Sachs",
    icon: "📊",
    description: "Bilan complet de votre santé financière avec score global",
    hasCalculator: true,
  },
  {
    id: 2,
    title: "Planification Retraite",
    style: "Vanguard",
    icon: "🏖️",
    description: "Plan de retraite complet avec projections et jalons",
    hasCalculator: true,
  },
  {
    id: 3,
    title: "Architecte de Portefeuille",
    style: "Morgan Stanley",
    icon: "📈",
    description: "Construction de portefeuille d'investissement optimisé",
    hasCalculator: false,
  },
  {
    id: 4,
    title: "Optimisation Fiscale",
    style: "Deloitte",
    icon: "🧾",
    description: "Stratégies pour minimiser votre facture fiscale",
    hasCalculator: false,
  },
  {
    id: 5,
    title: "Élimination des Dettes",
    style: "JPMorgan",
    icon: "💳",
    description: "Plan agressif de remboursement de toutes vos dettes",
    hasCalculator: true,
  },
  {
    id: 6,
    title: "Fonds d'Urgence",
    style: "Charles Schwab",
    icon: "🛡️",
    description: "Stratégie de constitution de votre matelas de sécurité",
    hasCalculator: true,
  },
  {
    id: 7,
    title: "Audit d'Assurance",
    style: "Northwestern Mutual",
    icon: "🔒",
    description: "Vérification complète de vos couvertures d'assurance",
    hasCalculator: false,
  },
  {
    id: 8,
    title: "Épargne pour les Études",
    style: "Fidelity",
    icon: "🎓",
    description: "Plan d'épargne éducative pour vos enfants",
    hasCalculator: false,
  },
  {
    id: 9,
    title: "Planification Successorale",
    style: "Edward Jones",
    icon: "📜",
    description: "Organisation de la transmission de votre patrimoine",
    hasCalculator: false,
  },
  {
    id: 10,
    title: "Investissement Immobilier",
    style: "Wealthfront",
    icon: "🏠",
    description: "Analyse de rentabilité d'investissements immobiliers",
    hasCalculator: true,
  },
  {
    id: 11,
    title: "Créateur de Budget",
    style: "Ramsey Solutions",
    icon: "💰",
    description: "Budget base zéro et optimisation de vos dépenses",
    hasCalculator: true,
  },
  {
    id: 12,
    title: "Feuille de Route Financière",
    style: "BlackRock",
    icon: "🗺️",
    description: "Vision à vie de votre parcours financier complet",
    hasCalculator: false,
  },
];

export const modules: ModuleDefinition[] = moduleMetadata.map((m) => ({
  ...m,
  fields: getFieldsForModule(m.id),
}));

export function getModule(id: number): ModuleDefinition | undefined {
  return modules.find((m) => m.id === id);
}
