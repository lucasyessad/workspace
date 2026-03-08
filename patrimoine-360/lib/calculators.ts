import { FormData, CalculationResult } from "@/types";

type Calculator = (data: FormData) => CalculationResult[];

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

// Module 01 — Diagnostic Patrimonial
const calcModule1: Calculator = (d) => {
  const revenus = num(d.revenus);
  const depenses = num(d.depenses);
  const epargne = num(d.epargne);
  const dettes = num(d.dettes);
  const investissements = num(d.investissements);

  const patrimoineNet = epargne + investissements - dettes;
  const tauxEpargne = revenus > 0 ? ((revenus - depenses) / revenus) * 100 : 0;
  const moisFondsUrgence = depenses > 0 ? epargne / depenses : 0;
  const ratioDette = revenus > 0 ? (dettes / (revenus * 12)) * 100 : 0;

  // Score
  let score = 50;
  if (tauxEpargne >= 20) score += 15;
  else if (tauxEpargne >= 10) score += 8;
  if (moisFondsUrgence >= 6) score += 15;
  else if (moisFondsUrgence >= 3) score += 8;
  if (ratioDette < 20) score += 10;
  else if (ratioDette < 40) score += 5;
  if (patrimoineNet > 0) score += 10;
  score = Math.min(100, Math.max(0, score));

  return [
    { label: "Patrimoine net", value: patrimoineNet, type: "currency", suffix: "€", color: patrimoineNet >= 0 ? "success" : "danger" },
    { label: "Taux d'épargne", value: Math.round(tauxEpargne * 10) / 10, type: "percent", suffix: "%", color: tauxEpargne >= 20 ? "success" : tauxEpargne >= 10 ? "warning" : "danger" },
    { label: "Fonds d'urgence", value: Math.round(moisFondsUrgence * 10) / 10, type: "metric", suffix: "mois", color: moisFondsUrgence >= 6 ? "success" : moisFondsUrgence >= 3 ? "warning" : "danger" },
    { label: "Ratio dette/revenu", value: Math.round(ratioDette * 10) / 10, type: "percent", suffix: "%", color: ratioDette < 20 ? "success" : ratioDette < 40 ? "warning" : "danger" },
    { label: "Score de santé financière", value: score, type: "score", max: 100, color: score >= 75 ? "success" : score >= 50 ? "warning" : "danger" },
  ];
};

// Module 02 — Planification Retraite
const calcModule2: Calculator = (d) => {
  const age = num(d.age);
  const epargneRetraite = num(d.epargne_retraite);
  const capaciteEpargne = num(d.capacite_epargne);
  const ageRetraite = num(d.age_retraite);
  const niveauVie = num(d.niveau_vie);

  const objectifRetraite = niveauVie * 12 * 25;
  const anneesRestantes = Math.max(0, ageRetraite - age);
  const rendementMensuel = 0.05 / 12;
  const mois = anneesRestantes * 12;

  // Projection avec intérêts composés
  let projection = epargneRetraite;
  if (mois > 0 && rendementMensuel > 0) {
    projection = epargneRetraite * Math.pow(1 + rendementMensuel, mois) +
      capaciteEpargne * ((Math.pow(1 + rendementMensuel, mois) - 1) / rendementMensuel);
  }

  // Épargne mensuelle requise
  let epargneRequise = 0;
  const deficit = objectifRetraite - epargneRetraite * Math.pow(1 + rendementMensuel, mois);
  if (mois > 0 && rendementMensuel > 0 && deficit > 0) {
    epargneRequise = deficit / ((Math.pow(1 + rendementMensuel, mois) - 1) / rendementMensuel);
  }

  const pourcentageAtteint = objectifRetraite > 0 ? Math.min(100, (projection / objectifRetraite) * 100) : 0;

  // Jalons tous les 5 ans
  const jalons: string[] = [];
  for (let a = age; a <= ageRetraite; a += 5) {
    const m = (a - age) * 12;
    const montant = epargneRetraite * Math.pow(1 + rendementMensuel, m) +
      capaciteEpargne * ((Math.pow(1 + rendementMensuel, m) - 1) / rendementMensuel);
    jalons.push(`${a} ans → ${Math.round(montant).toLocaleString("fr-FR")}€`);
  }

  return [
    { label: "Objectif retraite (règle 4%)", value: objectifRetraite, type: "currency", suffix: "€", color: "accent" },
    { label: "Projection du portefeuille", value: Math.round(projection), type: "currency", suffix: "€", color: projection >= objectifRetraite ? "success" : "warning" },
    { label: "Épargne mensuelle requise", value: Math.round(epargneRequise), type: "currency", suffix: "€/mois", color: epargneRequise <= capaciteEpargne ? "success" : "danger" },
    { label: "Objectif atteint (projection)", value: Math.round(pourcentageAtteint * 10) / 10, type: "progress", suffix: "%", max: 100, color: pourcentageAtteint >= 100 ? "success" : pourcentageAtteint >= 70 ? "warning" : "danger" },
    { label: "Jalons", value: jalons.join(" | "), type: "metric" },
  ];
};

// Module 05 — Dettes
const calcModule5: Calculator = (d) => {
  const revenuMensuel = num(d.revenu_mensuel);
  const extra = num(d.extra_remboursement);
  const detteStr = String(d.dettes_detail || "");

  // Parse dettes
  const lines = detteStr.split("\n").filter((l) => l.trim());
  let totalDettes = 0;
  let totalMinimums = 0;
  let totalInterets = 0;
  const dettes: { nom: string; solde: number; taux: number; minimum: number }[] = [];

  for (const line of lines) {
    const nums = line.match(/[\d]+[.,]?[\d]*/g);
    if (nums && nums.length >= 3) {
      const solde = parseFloat(nums[0].replace(",", "."));
      const taux = parseFloat(nums[1].replace(",", "."));
      const minimum = parseFloat(nums[2].replace(",", "."));
      dettes.push({ nom: line.split(":")[0]?.trim() || "Dette", solde, taux, minimum });
      totalDettes += solde;
      totalMinimums += minimum;
      totalInterets += solde * (taux / 100);
    }
  }

  // Estimation mois pour tout rembourser
  const paiementTotal = totalMinimums + extra;
  let moisEstime = 0;
  if (paiementTotal > 0 && totalDettes > 0) {
    // Simplified: average rate approach
    const tauxMoyen = totalDettes > 0 ? totalInterets / totalDettes : 0;
    const tauxMensuel = tauxMoyen / 12;
    if (tauxMensuel > 0 && paiementTotal > totalDettes * tauxMensuel) {
      moisEstime = Math.ceil(-Math.log(1 - (totalDettes * tauxMensuel) / paiementTotal) / Math.log(1 + tauxMensuel));
    } else if (tauxMensuel === 0 && paiementTotal > 0) {
      moisEstime = Math.ceil(totalDettes / paiementTotal);
    } else {
      moisEstime = 999;
    }
  }

  return [
    { label: "Total des dettes", value: totalDettes, type: "currency", suffix: "€", color: "danger" },
    { label: "Total paiements minimums", value: totalMinimums, type: "currency", suffix: "€/mois" },
    { label: "Intérêts annuels estimés", value: Math.round(totalInterets), type: "currency", suffix: "€/an", color: "danger" },
    { label: "Paiement total mensuel", value: totalMinimums + extra, type: "currency", suffix: "€/mois", color: "accent" },
    { label: "Estimation remboursement total", value: moisEstime >= 999 ? "Paiements insuffisants" : `${moisEstime} mois (${Math.round(moisEstime / 12 * 10) / 10} ans)`, type: "metric", color: moisEstime <= 24 ? "success" : moisEstime <= 60 ? "warning" : "danger" },
  ];
};

// Module 06 — Fonds d'urgence
const calcModule6: Calculator = (d) => {
  const depenses = num(d.depenses_mensuelles);
  const epargneUrgence = num(d.epargne_urgence);
  const stabilite = String(d.stabilite_emploi || "cdi_stable");
  const objectifMois = num(d.objectif_mois) || 6;

  const moisRecommandes: Record<string, number> = {
    cdi_stable: 6,
    cdi_instable: 9,
    cdd_interim: 9,
    freelance: 12,
    entrepreneur: 12,
  };

  const moisCibles = Math.max(objectifMois, moisRecommandes[stabilite] || 6);
  const objectif = depenses * moisCibles;
  const moisCouverts = depenses > 0 ? epargneUrgence / depenses : 0;
  const montantManquant = Math.max(0, objectif - epargneUrgence);
  const pourcentage = objectif > 0 ? Math.min(100, (epargneUrgence / objectif) * 100) : 0;

  // Épargne requise pour atteindre en 6, 12, 18, 24 mois
  const plans = [6, 12, 18, 24].map((m) => ({
    mois: m,
    mensuel: montantManquant > 0 ? Math.ceil(montantManquant / m) : 0,
  }));

  return [
    { label: "Objectif fonds d'urgence", value: objectif, type: "currency", suffix: `€ (${moisCibles} mois)`, color: "accent" },
    { label: "Mois actuellement couverts", value: Math.round(moisCouverts * 10) / 10, type: "metric", suffix: "mois", color: moisCouverts >= moisCibles ? "success" : moisCouverts >= 3 ? "warning" : "danger" },
    { label: "Montant manquant", value: montantManquant, type: "currency", suffix: "€", color: montantManquant === 0 ? "success" : "warning" },
    { label: "Progression", value: Math.round(pourcentage * 10) / 10, type: "progress", suffix: "%", max: 100, color: pourcentage >= 100 ? "success" : pourcentage >= 50 ? "warning" : "danger" },
    { label: "Épargne requise", value: plans.map((p) => `${p.mois}m → ${p.mensuel}€/mois`).join(" | "), type: "metric" },
  ];
};

// Module 10 — Immobilier
const calcModule10: Calculator = (d) => {
  const prix = num(d.prix_bien);
  const loyer = num(d.loyer_mensuel);
  const apport = num(d.apport);

  const emprunt = prix - apport;
  const tauxAnnuel = 0.035;
  const tauxMensuel = tauxAnnuel / 12;
  const dureeMois = 20 * 12;

  // Mensualité
  let mensualite = 0;
  if (emprunt > 0 && tauxMensuel > 0) {
    mensualite = emprunt * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) / (Math.pow(1 + tauxMensuel, dureeMois) - 1);
  }

  const charges = loyer * 0.25;
  const cashFlow = loyer - mensualite - charges;
  const rendementBrut = prix > 0 ? (loyer * 12) / prix * 100 : 0;
  const rendementNet = prix > 0 ? ((loyer - charges) * 12) / prix * 100 : 0;
  const cashOnCash = apport > 0 ? (cashFlow * 12) / apport * 100 : 0;
  const capRate = prix > 0 ? ((loyer - charges) * 12) / prix * 100 : 0;

  return [
    { label: "Emprunt", value: Math.round(emprunt), type: "currency", suffix: "€" },
    { label: "Mensualité crédit", value: Math.round(mensualite), type: "currency", suffix: "€/mois" },
    { label: "Charges estimées (25%)", value: Math.round(charges), type: "currency", suffix: "€/mois" },
    { label: "Cash-flow mensuel", value: Math.round(cashFlow), type: "currency", suffix: "€/mois", color: cashFlow >= 0 ? "success" : "danger" },
    { label: "Rendement brut", value: Math.round(rendementBrut * 100) / 100, type: "percent", suffix: "%" },
    { label: "Rendement net", value: Math.round(rendementNet * 100) / 100, type: "percent", suffix: "%" },
    { label: "Cash-on-cash return", value: Math.round(cashOnCash * 100) / 100, type: "percent", suffix: "%", color: cashOnCash >= 8 ? "success" : cashOnCash >= 4 ? "warning" : "danger" },
    { label: "Cap rate", value: Math.round(capRate * 100) / 100, type: "percent", suffix: "%" },
  ];
};

// Module 11 — Budget
const calcModule11: Calculator = (d) => {
  const revenu = num(d.revenu_mensuel);

  const besoins = revenu * 0.5;
  const envies = revenu * 0.3;
  const epargneInvest = revenu * 0.2;

  return [
    { label: "Besoins (50%)", value: Math.round(besoins), type: "currency", suffix: "€/mois", color: "accent" },
    { label: "Envies (30%)", value: Math.round(envies), type: "currency", suffix: "€/mois", color: "warning" },
    { label: "Épargne & Investissement (20%)", value: Math.round(epargneInvest), type: "currency", suffix: "€/mois", color: "success" },
    { label: "Revenu total", value: revenu, type: "currency", suffix: "€/mois" },
  ];
};

const calculators: Record<number, Calculator> = {
  1: calcModule1,
  2: calcModule2,
  5: calcModule5,
  6: calcModule6,
  10: calcModule10,
  11: calcModule11,
};

export function calculate(moduleId: number, data: FormData): CalculationResult[] | null {
  const calc = calculators[moduleId];
  if (!calc) return null;
  try {
    return calc(data);
  } catch {
    return null;
  }
}
