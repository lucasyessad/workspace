import { FormData } from "@/types";

export type ScenarioType = "prudent" | "equilibre" | "offensif";

export interface ScenarioResult {
  type: ScenarioType;
  label: string;
  description: string;
  rendement: number;
  projections: { annee: number; montant: number }[];
  capitalFinal: number;
}

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

const scenarioConfig: Record<ScenarioType, { label: string; description: string; rendement: number }> = {
  prudent: {
    label: "Prudent",
    description: "Épargne sécurisée, fonds euros, obligations. Rendement faible mais stable.",
    rendement: 0.02,
  },
  equilibre: {
    label: "Équilibré",
    description: "Mix actions/obligations, diversification internationale. Rendement modéré.",
    rendement: 0.05,
  },
  offensif: {
    label: "Offensif",
    description: "Majorité actions, ETF monde, forte exposition au marché. Rendement élevé mais volatile.",
    rendement: 0.08,
  },
};

export function computeScenarios(formData: FormData, moduleId: number): ScenarioResult[] {
  // Works best with module 2 (retraite) data but adapts to module 1
  let capitalInitial = 0;
  let epargneMensuelle = 0;
  let annees = 20;

  if (moduleId === 2) {
    capitalInitial = num(formData.epargne_retraite);
    epargneMensuelle = num(formData.capacite_epargne);
    const age = num(formData.age);
    const ageRetraite = num(formData.age_retraite) || 65;
    annees = Math.max(1, ageRetraite - age);
  } else if (moduleId === 1) {
    capitalInitial = num(formData.epargne) + num(formData.investissements);
    const revenus = num(formData.revenus);
    const depenses = num(formData.depenses);
    epargneMensuelle = Math.max(0, revenus - depenses);
  } else if (moduleId === 10) {
    capitalInitial = num(formData.apport);
    epargneMensuelle = 0;
  } else {
    return [];
  }

  return (Object.keys(scenarioConfig) as ScenarioType[]).map((type) => {
    const config = scenarioConfig[type];
    const rendementMensuel = config.rendement / 12;
    const projections: { annee: number; montant: number }[] = [];

    for (let a = 0; a <= annees; a += Math.max(1, Math.floor(annees / 10))) {
      const mois = a * 12;
      let montant = capitalInitial;
      if (rendementMensuel > 0 && mois > 0) {
        montant = capitalInitial * Math.pow(1 + rendementMensuel, mois) +
          epargneMensuelle * ((Math.pow(1 + rendementMensuel, mois) - 1) / rendementMensuel);
      } else {
        montant = capitalInitial + epargneMensuelle * mois;
      }
      projections.push({ annee: a, montant: Math.round(montant) });
    }

    const moisTotal = annees * 12;
    let capitalFinal = capitalInitial;
    if (rendementMensuel > 0 && moisTotal > 0) {
      capitalFinal = capitalInitial * Math.pow(1 + rendementMensuel, moisTotal) +
        epargneMensuelle * ((Math.pow(1 + rendementMensuel, moisTotal) - 1) / rendementMensuel);
    } else {
      capitalFinal = capitalInitial + epargneMensuelle * moisTotal;
    }

    return {
      type,
      label: config.label,
      description: config.description,
      rendement: config.rendement * 100,
      projections,
      capitalFinal: Math.round(capitalFinal),
    };
  });
}
