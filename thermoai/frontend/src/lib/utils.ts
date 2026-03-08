import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ENERGY_LABEL_COLORS: Record<string, string> = {
  A: "bg-[#00a84f] text-white",
  B: "bg-[#52b748] text-white",
  C: "bg-[#c8d200] text-gray-900",
  D: "bg-[#f7e400] text-gray-900",
  E: "bg-[#f0a500] text-white",
  F: "bg-[#e8500a] text-white",
  G: "bg-[#cc0000] text-white",
};

export const ENERGY_LABEL_HEX: Record<string, string> = {
  A: "#00a84f",
  B: "#52b748",
  C: "#c8d200",
  D: "#f7e400",
  E: "#f0a500",
  F: "#e8500a",
  G: "#cc0000",
};

// ─── Mesures de rénovation ────────────────────────────────────────────────────
// Source : France Rénov', ANAH, barème CEE, MaPrimeRénov'

export interface MeasureMeta {
  label: string;
  category: string;
  maprimerenov: boolean; // éligible MaPrimeRénov' geste par geste
  cee: boolean;          // éligible Certificats d'Économies d'Énergie
  eco_ptz: boolean;      // éligible Éco-Prêt à Taux Zéro
}

export const MEASURES: Record<string, MeasureMeta> = {
  // ── Isolation ──────────────────────────────────────────────────────────────
  ite: {
    label: "Isolation thermique par l'extérieur (ITE)",
    category: "Isolation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  iti: {
    label: "Isolation thermique par l'intérieur (ITI)",
    category: "Isolation",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  combles_perdus: {
    label: "Isolation des combles perdus",
    category: "Isolation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  isolation_toiture: {
    label: "Isolation de toiture (sarking / sous-rampants)",
    category: "Isolation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  toiture_terrasse: {
    label: "Isolation toiture-terrasse",
    category: "Isolation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  isolation_plancher: {
    label: "Isolation du plancher bas",
    category: "Isolation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  isolation_vide_sanitaire: {
    label: "Isolation vide sanitaire / cave",
    category: "Isolation",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  calorifugeage: {
    label: "Calorifugeage des réseaux (canalisations)",
    category: "Isolation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },

  // ── Menuiseries ────────────────────────────────────────────────────────────
  menuiseries: {
    label: "Remplacement fenêtres / doubles vitrages",
    category: "Menuiseries",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  portes_fenetres: {
    label: "Remplacement portes-fenêtres",
    category: "Menuiseries",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  porte_entree: {
    label: "Remplacement porte d'entrée isolante",
    category: "Menuiseries",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  triple_vitrage: {
    label: "Triple vitrage haute performance",
    category: "Menuiseries",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  protection_solaire: {
    label: "Protection solaire extérieure (volets, brise-soleil)",
    category: "Menuiseries",
    maprimerenov: false, cee: false, eco_ptz: false,
  },

  // ── Chauffage ──────────────────────────────────────────────────────────────
  pac_air_eau: {
    label: "Pompe à chaleur air/eau",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  pac_sol_eau: {
    label: "Pompe à chaleur géothermique sol/eau",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  pac_air_air: {
    label: "Pompe à chaleur air/air (climatisation réversible)",
    category: "Chauffage",
    maprimerenov: false, cee: true, eco_ptz: false,
  },
  chaudiere_biomasse: {
    label: "Chaudière biomasse (granulés / bûches)",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  poele_granules: {
    label: "Poêle / insert à granulés (pellets)",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: false,
  },
  poele_bois: {
    label: "Poêle à bûches haute performance",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: false,
  },
  remplacement_chaudiere: {
    label: "Remplacement chaudière gaz à condensation",
    category: "Chauffage",
    maprimerenov: false, cee: true, eco_ptz: true,
  },
  reseau_chaleur: {
    label: "Raccordement réseau de chaleur urbain",
    category: "Chauffage",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  plancher_chauffant: {
    label: "Installation plancher chauffant basse température",
    category: "Chauffage",
    maprimerenov: false, cee: false, eco_ptz: true,
  },

  // ── Eau Chaude Sanitaire ───────────────────────────────────────────────────
  chauffe_eau_thermo: {
    label: "Chauffe-eau thermodynamique (CET)",
    category: "Eau chaude sanitaire",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  chauffe_eau_solaire: {
    label: "Chauffe-eau solaire individuel (CESI)",
    category: "Eau chaude sanitaire",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  systeme_solaire_combine: {
    label: "Système Solaire Combiné (SSC — chauffage + ECS)",
    category: "Eau chaude sanitaire",
    maprimerenov: true, cee: true, eco_ptz: true,
  },

  // ── Ventilation ────────────────────────────────────────────────────────────
  vmc_double_flux: {
    label: "VMC double flux à récupération de chaleur",
    category: "Ventilation",
    maprimerenov: true, cee: true, eco_ptz: true,
  },
  vmc_simple_flux: {
    label: "VMC simple flux hygroréglable (type B)",
    category: "Ventilation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },
  vmc_basse_conso: {
    label: "VMC basse consommation",
    category: "Ventilation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },

  // ── Régulation ────────────────────────────────────────────────────────────
  thermostat_connecte: {
    label: "Thermostat connecté / programmable",
    category: "Régulation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },
  gtb: {
    label: "GTB — Gestion Technique du Bâtiment",
    category: "Régulation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },
  equilibrage_reseau: {
    label: "Équilibrage du réseau de chauffage",
    category: "Régulation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },
  robinets_thermostatiques: {
    label: "Robinets thermostatiques sur radiateurs",
    category: "Régulation",
    maprimerenov: false, cee: true, eco_ptz: false,
  },

  // ── Solaire / ENR ──────────────────────────────────────────────────────────
  photovoltaique: {
    label: "Panneaux photovoltaïques (autoconsommation)",
    category: "Énergies renouvelables",
    maprimerenov: false, cee: false, eco_ptz: true,
  },
  solaire_thermique: {
    label: "Panneaux solaires thermiques",
    category: "Énergies renouvelables",
    maprimerenov: false, cee: true, eco_ptz: true,
  },

  // ── DOM-TOM spécifiques ────────────────────────────────────────────────────
  bardage_ventile: {
    label: "Bardage ventilé (isolation + protection solaire — DOM)",
    category: "DOM-TOM",
    maprimerenov: true, cee: true, eco_ptz: false,
  },
  toiture_ventilee: {
    label: "Toiture ventilée anti-chaleur (DOM)",
    category: "DOM-TOM",
    maprimerenov: true, cee: true, eco_ptz: false,
  },
  brise_soleil: {
    label: "Brise-soleil / film réfléchissant (DOM)",
    category: "DOM-TOM",
    maprimerenov: true, cee: false, eco_ptz: false,
  },

  // ── Audit / Accompagnement ─────────────────────────────────────────────────
  audit_energetique: {
    label: "Audit énergétique réglementaire",
    category: "Audit & accompagnement",
    maprimerenov: true, cee: false, eco_ptz: false,
  },
  mon_accompagnateur_renov: {
    label: "Mon Accompagnateur Rénov' (AMO)",
    category: "Audit & accompagnement",
    maprimerenov: true, cee: false, eco_ptz: false,
  },
};

// Backward-compatible alias
export const MEASURE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(MEASURES).map(([k, v]) => [k, v.label])
);

// Group by category
export function getMeasuresByCategory(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const [key, meta] of Object.entries(MEASURES)) {
    if (!groups[meta.category]) groups[meta.category] = [];
    groups[meta.category].push(key);
  }
  return groups;
}

export const AUDIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Terminé", color: "bg-green-100 text-green-700" },
  validated: { label: "Validé", color: "bg-emerald-100 text-emerald-700" },
};

export const SCENARIO_TYPE_LABELS: Record<string, string> = {
  minimal: "Geste isolé",
  standard: "Rénovation partielle",
  performant: "Rénovation performante",
  bbc_renovation: "BBC Rénovation (≥ 2 sauts DPE)",
  renovation_globale: "Rénovation globale (A/B)",
};

export function formatNumber(n?: number, decimals = 0): string {
  if (n == null) return "—";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: decimals });
}
