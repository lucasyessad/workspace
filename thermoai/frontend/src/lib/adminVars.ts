/**
 * adminVars.ts — Variables réglementaires configurables par l'administrateur
 * Toutes les valeurs sont stockées en localStorage et surchargent les defaults.
 * Modifiables via /admin/variables
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DpeClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type EnergyKey = "gaz" | "electricite" | "fioul" | "bois" | "reseau" | "autre";
export type YearKey =
  | "avant_1948" | "1948_1974" | "1975_1989"
  | "1990_1999" | "2000_2012" | "apres_2012";
export type WorkKey = "ite" | "combles" | "planchers" | "fenetres" | "pac" | "chaudiere" | "vmc" | "cet";
export type IncomeLevelKey = "tres_modeste" | "modeste" | "intermediaire" | "aise";

export interface AdminVars {
  // ── MaPrimeRénov' ────────────────────────────────────────────────────────────
  /** Montant de base MPR par geste (en €) avant application du facteur revenu */
  mprBase: Record<WorkKey, number>;
  /** Facteur multiplicateur selon le profil de revenus (0–1) */
  incomeFactors: Record<IncomeLevelKey, number>;
  /** Plafond MPR global par ménage (en €) */
  mprPlafondGlobal: number;
  /** Bonus BBC rénovation globale (en €) */
  mprBonusBbc: number;

  // ── CEE (Certificats d'Économies d'Énergie) ──────────────────────────────────
  /** Prime CEE de base par geste (en €) */
  ceeBase: Record<WorkKey, number>;

  // ── Éco-PTZ ──────────────────────────────────────────────────────────────────
  /** Plafond Éco-PTZ par catégorie de bouquet de travaux (en €) */
  ecoptzCaps: {
    action_isolante: number;
    bouquet_2_actions: number;
    bouquet_3_actions: number;
    bbc_renovation: number;
    solde_post_mpr: number;
  };
  /** Durée maximale Éco-PTZ (en mois) */
  ecoptzDureeMax: number;
  /** Durée minimale Éco-PTZ (en mois) */
  ecoptzDureeMin: number;

  // ── TVA réduite ───────────────────────────────────────────────────────────────
  /** Taux TVA réduit applicable aux travaux (%) */
  tvaTaux: number;

  // ── Seuils de revenus ANAH (2 personnes) ─────────────────────────────────────
  anahThresholds: {
    idf:      Record<IncomeLevelKey, number>;
    province: Record<IncomeLevelKey, number>;
  };

  // ── Matrice DPE estimative ────────────────────────────────────────────────────
  /** Énergie × Année de construction → Classe DPE estimée */
  dpeMatrix: Record<EnergyKey, Record<YearKey, DpeClass>>;

  // ── Réglementation thermique ──────────────────────────────────────────────────
  /** Facteur de conversion électricité → énergie primaire (PEF) */
  electricityPef: number;
  /** Date de mise à jour de la réglementation (ISO string) */
  regleVersion: string;

  // ── Méta ──────────────────────────────────────────────────────────────────────
  /** Date de dernière modification par l'admin (ISO) */
  lastModified: string | null;
  /** Email de l'admin pour les alertes réglementaires */
  adminEmail: string;
}

// ─── Valeurs par défaut (réglementation 2025–2026) ─────────────────────────────

export const DEFAULT_VARS: AdminVars = {
  mprBase: {
    ite:       15000,
    combles:   8000,
    planchers: 7000,
    fenetres:  4000,
    pac:       12000,
    chaudiere: 6000,
    vmc:       5000,
    cet:       4000,
  },

  incomeFactors: {
    tres_modeste:  1.00,   // 70 % → factor * baseMpr
    modeste:       0.70,
    intermediaire: 0.40,
    aise:          0.15,
  },

  mprPlafondGlobal: 70000,
  mprBonusBbc: 10000,

  ceeBase: {
    ite:       2000,
    combles:   1500,
    planchers: 1200,
    fenetres:  800,
    pac:       4000,
    chaudiere: 1500,
    vmc:       1000,
    cet:       600,
  },

  ecoptzCaps: {
    action_isolante:   15000,
    bouquet_2_actions: 25000,
    bouquet_3_actions: 30000,
    bbc_renovation:    50000,
    solde_post_mpr:    10000,
  },

  ecoptzDureeMax: 240,
  ecoptzDureeMin: 36,

  tvaTaux: 5.5,

  anahThresholds: {
    idf: {
      tres_modeste:  22461,
      modeste:       27343,
      intermediaire: 38184,
      aise:          Infinity,
    },
    province: {
      tres_modeste:  16229,
      modeste:       19769,
      intermediaire: 27076,
      aise:          Infinity,
    },
  },

  dpeMatrix: {
    gaz:         { avant_1948: "G", "1948_1974": "F", "1975_1989": "E", "1990_1999": "D", "2000_2012": "D", apres_2012: "C" },
    // PEF électricité = 1.9 depuis jan. 2026 (était 2.58) → classes améliorées
    electricite: { avant_1948: "E", "1948_1974": "D", "1975_1989": "D", "1990_1999": "C", "2000_2012": "C", apres_2012: "B" },
    fioul:       { avant_1948: "G", "1948_1974": "G", "1975_1989": "F", "1990_1999": "E", "2000_2012": "E", apres_2012: "D" },
    bois:        { avant_1948: "E", "1948_1974": "D", "1975_1989": "D", "1990_1999": "C", "2000_2012": "C", apres_2012: "B" },
    reseau:      { avant_1948: "D", "1948_1974": "D", "1975_1989": "C", "1990_1999": "C", "2000_2012": "B", apres_2012: "B" },
    autre:       { avant_1948: "F", "1948_1974": "E", "1975_1989": "E", "1990_1999": "D", "2000_2012": "D", apres_2012: "C" },
  },

  electricityPef: 1.9,
  regleVersion: "2025-2026",

  lastModified: null,
  adminEmail: "",
};

// ─── Labels lisibles ──────────────────────────────────────────────────────────

export const WORK_LABELS: Record<WorkKey, string> = {
  ite:       "Isolation murs extérieurs (ITE)",
  combles:   "Isolation combles & toiture",
  planchers: "Isolation planchers bas",
  fenetres:  "Menuiseries & fenêtres",
  pac:       "Pompe à chaleur air/eau",
  chaudiere: "Chaudière à condensation gaz",
  vmc:       "VMC double flux",
  cet:       "Chauffe-eau thermodynamique",
};

export const INCOME_LABELS: Record<IncomeLevelKey, string> = {
  tres_modeste:  "Très modeste",
  modeste:       "Modeste",
  intermediaire: "Intermédiaire",
  aise:          "Aisé",
};

export const ENERGY_LABELS: Record<EnergyKey, string> = {
  gaz:         "Gaz naturel",
  electricite: "Électricité",
  fioul:       "Fioul domestique",
  bois:        "Bois / Granulés",
  reseau:      "Réseau de chaleur",
  autre:       "Autre",
};

export const YEAR_LABELS: Record<YearKey, string> = {
  avant_1948:  "Avant 1948",
  "1948_1974": "1948–1974",
  "1975_1989": "1975–1989",
  "1990_1999": "1990–1999",
  "2000_2012": "2000–2012",
  apres_2012:  "Après 2012",
};

export const DPE_CLASSES: DpeClass[] = ["A", "B", "C", "D", "E", "F", "G"];

// ─── localStorage ─────────────────────────────────────────────────────────────

const LS_KEY = "admin_vars_v2";

export function loadAdminVars(): AdminVars {
  if (typeof window === "undefined") return DEFAULT_VARS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_VARS;
    const parsed = JSON.parse(raw) as Partial<AdminVars>;
    // Deep merge avec les defaults pour garantir que toutes les clés existent
    return deepMerge(DEFAULT_VARS, parsed) as AdminVars;
  } catch {
    return DEFAULT_VARS;
  }
}

export function saveAdminVars(vars: AdminVars): void {
  const stamped = { ...vars, lastModified: new Date().toISOString() };
  localStorage.setItem(LS_KEY, JSON.stringify(stamped));
}

export function resetAdminVars(): AdminVars {
  localStorage.removeItem(LS_KEY);
  return DEFAULT_VARS;
}

// ─── Calcul helper (utilisé par le simulateur) ────────────────────────────────

export function calcAidesFromVars(
  works: Set<WorkKey>,
  income: IncomeLevelKey | null,
  surface: string,
  vars: AdminVars,
) {
  const factor     = vars.incomeFactors[income ?? "intermediaire"] ?? 0.4;
  const surf       = Math.max(50, Math.min(500, Number(surface) || 100));
  const surfFactor = Math.min(surf / 100, 2);

  let totalMpr = 0, totalCee = 0, ecoptzElig = false;
  const rows: { key: WorkKey; label: string; mpr: number; cee: number }[] = [];

  for (const w of works) {
    const base = vars.mprBase[w];
    const ceeB = vars.ceeBase[w];
    if (base === undefined) continue;
    const mpr = Math.round(base * factor * surfFactor);
    const cee = Math.round(ceeB * surfFactor);
    totalMpr += mpr; totalCee += cee;
    ecoptzElig = true;
    rows.push({ key: w, label: WORK_LABELS[w], mpr, cee });
  }

  return {
    rows,
    totalMpr: Math.min(totalMpr, vars.mprPlafondGlobal),
    totalCee,
    totalAides: Math.min(totalMpr, vars.mprPlafondGlobal) + totalCee,
    ecoptzElig,
    ecoptzMax: ecoptzElig ? vars.ecoptzCaps.bbc_renovation : 0,
  };
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (sv !== null && typeof sv === "object" && !Array.isArray(sv) && typeof tv === "object" && tv !== null) {
      out[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
    } else if (sv !== undefined) {
      out[key] = sv;
    }
  }
  return out;
}
