import { FormData, CalculationResult } from "../types";

type Calculator = (data: FormData) => CalculationResult[];

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  return typeof v === "number" ? v : parseFloat(v) || 0;
}

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

  let score = 50;
  if (tauxEpargne >= 20) score += 15; else if (tauxEpargne >= 10) score += 8;
  if (moisFondsUrgence >= 6) score += 15; else if (moisFondsUrgence >= 3) score += 8;
  if (ratioDette < 20) score += 10; else if (ratioDette < 40) score += 5;
  if (patrimoineNet > 0) score += 10;
  score = Math.min(100, Math.max(0, score));

  return [
    { label: "Patrimoine net", value: patrimoineNet, type: "currency", suffix: "€", color: patrimoineNet >= 0 ? "success" : "danger" },
    { label: "Taux d'épargne", value: Math.round(tauxEpargne * 10) / 10, type: "percent", suffix: "%", color: tauxEpargne >= 20 ? "success" : tauxEpargne >= 10 ? "warning" : "danger" },
    { label: "Fonds d'urgence", value: Math.round(moisFondsUrgence * 10) / 10, type: "metric", suffix: "mois", color: moisFondsUrgence >= 6 ? "success" : moisFondsUrgence >= 3 ? "warning" : "danger" },
    { label: "Ratio dette/revenu", value: Math.round(ratioDette * 10) / 10, type: "percent", suffix: "%", color: ratioDette < 20 ? "success" : ratioDette < 40 ? "warning" : "danger" },
    { label: "Score santé financière", value: score, type: "score", max: 100, color: score >= 75 ? "success" : score >= 50 ? "warning" : "danger" },
  ];
};

const calcModule2: Calculator = (d) => {
  const age = num(d.age);
  const epargneRetraite = num(d.epargne_retraite);
  const capaciteEpargne = num(d.capacite_epargne);
  const ageRetraite = num(d.age_retraite);
  const niveauVie = num(d.niveau_vie);

  const objectifRetraite = niveauVie * 12 * 25;
  const anneesRestantes = Math.max(0, ageRetraite - age);
  const r = 0.05 / 12;
  const mois = anneesRestantes * 12;

  let projection = epargneRetraite;
  if (mois > 0 && r > 0) {
    projection = epargneRetraite * Math.pow(1 + r, mois) + capaciteEpargne * ((Math.pow(1 + r, mois) - 1) / r);
  }

  let epargneRequise = 0;
  const deficit = objectifRetraite - epargneRetraite * Math.pow(1 + r, mois);
  if (mois > 0 && r > 0 && deficit > 0) {
    epargneRequise = deficit / ((Math.pow(1 + r, mois) - 1) / r);
  }

  const pct = objectifRetraite > 0 ? Math.min(100, (projection / objectifRetraite) * 100) : 0;

  return [
    { label: "Objectif retraite (règle 4%)", value: objectifRetraite, type: "currency", suffix: "€", color: "accent" },
    { label: "Projection portefeuille", value: Math.round(projection), type: "currency", suffix: "€", color: projection >= objectifRetraite ? "success" : "warning" },
    { label: "Épargne mensuelle requise", value: Math.round(epargneRequise), type: "currency", suffix: "€/mois", color: epargneRequise <= capaciteEpargne ? "success" : "danger" },
    { label: "Objectif atteint", value: Math.round(pct * 10) / 10, type: "progress", suffix: "%", max: 100, color: pct >= 100 ? "success" : pct >= 70 ? "warning" : "danger" },
  ];
};

const calcModule5: Calculator = (d) => {
  const extra = num(d.extra_remboursement);
  const detteStr = String(d.dettes_detail || "");
  const lines = detteStr.split("\n").filter((l) => l.trim());
  let totalDettes = 0, totalMinimums = 0, totalInterets = 0;

  for (const line of lines) {
    const nums = line.match(/[\d]+[.,]?[\d]*/g);
    if (nums && nums.length >= 3) {
      const solde = parseFloat(nums[0].replace(",", "."));
      const taux = parseFloat(nums[1].replace(",", "."));
      const minimum = parseFloat(nums[2].replace(",", "."));
      totalDettes += solde;
      totalMinimums += minimum;
      totalInterets += solde * (taux / 100);
    }
  }

  const paiementTotal = totalMinimums + extra;
  let moisEstime = 0;
  if (paiementTotal > 0 && totalDettes > 0) {
    const tauxMoyen = totalDettes > 0 ? totalInterets / totalDettes : 0;
    const tm = tauxMoyen / 12;
    if (tm > 0 && paiementTotal > totalDettes * tm) {
      moisEstime = Math.ceil(-Math.log(1 - (totalDettes * tm) / paiementTotal) / Math.log(1 + tm));
    } else if (tm === 0 && paiementTotal > 0) {
      moisEstime = Math.ceil(totalDettes / paiementTotal);
    } else {
      moisEstime = 999;
    }
  }

  return [
    { label: "Total des dettes", value: totalDettes, type: "currency", suffix: "€", color: "danger" },
    { label: "Paiements minimums", value: totalMinimums, type: "currency", suffix: "€/mois" },
    { label: "Intérêts annuels", value: Math.round(totalInterets), type: "currency", suffix: "€/an", color: "danger" },
    { label: "Estimation remboursement", value: moisEstime >= 999 ? "Insuffisant" : `${moisEstime} mois`, type: "metric", color: moisEstime <= 24 ? "success" : moisEstime <= 60 ? "warning" : "danger" },
  ];
};

const calcModule6: Calculator = (d) => {
  const depenses = num(d.depenses_mensuelles);
  const epargneUrgence = num(d.epargne_urgence);
  const stabilite = String(d.stabilite_emploi || "cdi_stable");
  const objectifMois = num(d.objectif_mois) || 6;

  const rec: Record<string, number> = { cdi_stable: 6, cdi_instable: 9, cdd_interim: 9, freelance: 12, entrepreneur: 12 };
  const moisCibles = Math.max(objectifMois, rec[stabilite] || 6);
  const objectif = depenses * moisCibles;
  const moisCouverts = depenses > 0 ? epargneUrgence / depenses : 0;
  const manquant = Math.max(0, objectif - epargneUrgence);
  const pct = objectif > 0 ? Math.min(100, (epargneUrgence / objectif) * 100) : 0;

  return [
    { label: "Objectif fonds d'urgence", value: objectif, type: "currency", suffix: `€ (${moisCibles}m)`, color: "accent" },
    { label: "Mois couverts", value: Math.round(moisCouverts * 10) / 10, type: "metric", suffix: "mois", color: moisCouverts >= moisCibles ? "success" : "warning" },
    { label: "Montant manquant", value: manquant, type: "currency", suffix: "€", color: manquant === 0 ? "success" : "warning" },
    { label: "Progression", value: Math.round(pct * 10) / 10, type: "progress", suffix: "%", max: 100, color: pct >= 100 ? "success" : pct >= 50 ? "warning" : "danger" },
  ];
};

const calcModule10: Calculator = (d) => {
  const prix = num(d.prix_bien);
  const loyer = num(d.loyer_mensuel);
  const apport = num(d.apport);
  const emprunt = prix - apport;
  const tm = 0.035 / 12;
  const n = 240;

  let mensualite = 0;
  if (emprunt > 0 && tm > 0) {
    mensualite = emprunt * (tm * Math.pow(1 + tm, n)) / (Math.pow(1 + tm, n) - 1);
  }

  const charges = loyer * 0.25;
  const cashFlow = loyer - mensualite - charges;
  const rendBrut = prix > 0 ? (loyer * 12) / prix * 100 : 0;
  const rendNet = prix > 0 ? ((loyer - charges) * 12) / prix * 100 : 0;
  const coc = apport > 0 ? (cashFlow * 12) / apport * 100 : 0;

  return [
    { label: "Emprunt", value: Math.round(emprunt), type: "currency", suffix: "€" },
    { label: "Mensualité crédit", value: Math.round(mensualite), type: "currency", suffix: "€/mois" },
    { label: "Cash-flow mensuel", value: Math.round(cashFlow), type: "currency", suffix: "€/mois", color: cashFlow >= 0 ? "success" : "danger" },
    { label: "Rendement brut", value: Math.round(rendBrut * 100) / 100, type: "percent", suffix: "%" },
    { label: "Rendement net", value: Math.round(rendNet * 100) / 100, type: "percent", suffix: "%" },
    { label: "Cash-on-cash", value: Math.round(coc * 100) / 100, type: "percent", suffix: "%", color: coc >= 8 ? "success" : coc >= 4 ? "warning" : "danger" },
  ];
};

const calcModule11: Calculator = (d) => {
  const revenu = num(d.revenu_mensuel);
  return [
    { label: "Besoins (50%)", value: Math.round(revenu * 0.5), type: "currency", suffix: "€/mois", color: "accent" },
    { label: "Envies (30%)", value: Math.round(revenu * 0.3), type: "currency", suffix: "€/mois", color: "warning" },
    { label: "Épargne & Invest. (20%)", value: Math.round(revenu * 0.2), type: "currency", suffix: "€/mois", color: "success" },
  ];
};

const calculators: Record<number, Calculator> = {
  1: calcModule1, 2: calcModule2, 5: calcModule5, 6: calcModule6, 10: calcModule10, 11: calcModule11,
};

export function calculate(moduleId: number, data: FormData): CalculationResult[] | null {
  const calc = calculators[moduleId];
  if (!calc) return null;
  try { return calc(data); } catch { return null; }
}
