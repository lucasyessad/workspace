import { AppState, CalculationResult } from "@/types";
import { calculate } from "./calculators";

export interface GlobalScore {
  score: number; // 0-100
  level: "critique" | "fragile" | "correct" | "bon" | "excellent";
  breakdown: {
    category: string;
    score: number;
    weight: number;
    comment: string;
  }[];
}

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

export function computeGlobalScore(appState: AppState): GlobalScore | null {
  const breakdown: GlobalScore["breakdown"] = [];
  let totalWeight = 0;
  let weightedSum = 0;

  // 1. Patrimoine (module 1) — poids 25
  const m1 = appState.modules[1];
  if (m1?.formData && Object.keys(m1.formData).length > 0) {
    const calcs = calculate(1, m1.formData);
    const scoreCalc = calcs?.find((c) => c.label.includes("Score"));
    const s = typeof scoreCalc?.value === "number" ? scoreCalc.value : 50;
    breakdown.push({ category: "Patrimoine", score: s, weight: 25, comment: s >= 75 ? "Situation patrimoniale solide" : s >= 50 ? "Situation correcte, des améliorations possibles" : "Situation fragile, action requise" });
    totalWeight += 25;
    weightedSum += s * 25;
  }

  // 2. Budget (module 11) — poids 20
  const m11 = appState.modules[11];
  if (m11?.formData && Object.keys(m11.formData).length > 0) {
    const revenu = num(m11.formData.revenu_mensuel);
    const depenses = num(m11.formData.depenses_essentielles) + num(m11.formData.depenses_discretionnaires);
    const tauxEpargne = revenu > 0 ? ((revenu - depenses) / revenu) * 100 : 0;
    let s = 50;
    if (tauxEpargne >= 25) s = 90;
    else if (tauxEpargne >= 20) s = 80;
    else if (tauxEpargne >= 15) s = 70;
    else if (tauxEpargne >= 10) s = 60;
    else if (tauxEpargne >= 5) s = 45;
    else s = 25;
    breakdown.push({ category: "Budget", score: s, weight: 20, comment: s >= 70 ? "Bonne gestion budgétaire" : "Marge d'optimisation budgétaire" });
    totalWeight += 20;
    weightedSum += s * 20;
  }

  // 3. Dettes (module 5) — poids 15
  const m5 = appState.modules[5];
  if (m5?.formData && Object.keys(m5.formData).length > 0) {
    const revenuM = num(m5.formData.revenu_mensuel);
    const calcs = calculate(5, m5.formData);
    const totalDettes = calcs?.find((c) => c.label.includes("Total des dettes"));
    const dettes = typeof totalDettes?.value === "number" ? totalDettes.value : 0;
    const ratio = revenuM > 0 ? (dettes / (revenuM * 12)) * 100 : 0;
    let s = 80;
    if (ratio > 100) s = 20;
    else if (ratio > 60) s = 40;
    else if (ratio > 30) s = 60;
    else if (ratio > 10) s = 75;
    else s = 90;
    breakdown.push({ category: "Dettes", score: s, weight: 15, comment: s >= 70 ? "Endettement maîtrisé" : "Endettement à surveiller" });
    totalWeight += 15;
    weightedSum += s * 15;
  }

  // 4. Fonds d'urgence (module 6) — poids 15
  const m6 = appState.modules[6];
  if (m6?.formData && Object.keys(m6.formData).length > 0) {
    const calcs = calculate(6, m6.formData);
    const moisCouverts = calcs?.find((c) => c.label.includes("couverts"));
    const mois = typeof moisCouverts?.value === "number" ? moisCouverts.value : 0;
    let s = 50;
    if (mois >= 12) s = 95;
    else if (mois >= 6) s = 80;
    else if (mois >= 3) s = 60;
    else if (mois >= 1) s = 35;
    else s = 15;
    breakdown.push({ category: "Fonds d'urgence", score: s, weight: 15, comment: s >= 70 ? "Résilience financière bonne" : "Fonds d'urgence insuffisant" });
    totalWeight += 15;
    weightedSum += s * 15;
  }

  // 5. Retraite (module 2) — poids 15
  const m2 = appState.modules[2];
  if (m2?.formData && Object.keys(m2.formData).length > 0) {
    const calcs = calculate(2, m2.formData);
    const pctAtteint = calcs?.find((c) => c.label.includes("atteint"));
    const pct = typeof pctAtteint?.value === "number" ? pctAtteint.value : 0;
    let s = pct >= 100 ? 95 : pct >= 80 ? 80 : pct >= 60 ? 65 : pct >= 40 ? 45 : 25;
    breakdown.push({ category: "Retraite", score: s, weight: 15, comment: s >= 70 ? "Trajectoire retraite rassurante" : "Trajectoire retraite à renforcer" });
    totalWeight += 15;
    weightedSum += s * 15;
  }

  // 6. Investissement (modules 3, 10) — poids 10
  const m10 = appState.modules[10];
  if (m10?.formData && Object.keys(m10.formData).length > 0) {
    const calcs = calculate(10, m10.formData);
    const cashFlow = calcs?.find((c) => c.label.includes("Cash-flow"));
    const cf = typeof cashFlow?.value === "number" ? cashFlow.value : 0;
    const s = cf > 0 ? 80 : cf === 0 ? 50 : 30;
    breakdown.push({ category: "Investissements", score: s, weight: 10, comment: s >= 70 ? "Investissements rentables" : "Investissements à optimiser" });
    totalWeight += 10;
    weightedSum += s * 10;
  }

  if (totalWeight === 0) return null;

  const score = Math.round(weightedSum / totalWeight);
  let level: GlobalScore["level"];
  if (score >= 80) level = "excellent";
  else if (score >= 65) level = "bon";
  else if (score >= 50) level = "correct";
  else if (score >= 35) level = "fragile";
  else level = "critique";

  return { score, level, breakdown };
}
