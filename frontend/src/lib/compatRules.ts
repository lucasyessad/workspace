// ─── Types ─────────────────────────────────────────────────────────────────────

export type EnergyKey   = "gaz" | "electricite" | "fioul" | "bois" | "reseau" | "autre";
export type BuildingKey = "maison" | "appartement" | "immeuble" | "tertiaire";
export type WorkKey     = "ite" | "combles" | "planchers" | "fenetres" | "pac" | "chaudiere" | "vmc" | "cet";

export interface CompatRules {
  /** Pour chaque énergie, liste des gestes incompatibles */
  energyRules: Record<EnergyKey, WorkKey[]>;
  /** Pour chaque type de bâtiment, liste des gestes incompatibles */
  buildingRules: Record<BuildingKey, WorkKey[]>;
}

// ─── Labels lisibles ────────────────────────────────────────────────────────────

export const ENERGY_LABELS: Record<EnergyKey, string> = {
  gaz:         "Gaz naturel",
  electricite: "Électricité",
  fioul:       "Fioul domestique",
  bois:        "Bois / Granulés",
  reseau:      "Réseau de chaleur",
  autre:       "Autre",
};

export const BUILDING_LABELS: Record<BuildingKey, string> = {
  maison:      "Maison individuelle",
  appartement: "Appartement",
  immeuble:    "Immeuble collectif",
  tertiaire:   "Bâtiment tertiaire",
};

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

// Raisons d'incompatibilité affichées à l'utilisateur
export const ENERGY_REASONS: Record<EnergyKey, Partial<Record<WorkKey, string>>> = {
  gaz:         {},
  electricite: { chaudiere: "Chaudière gaz non applicable sans réseau gaz" },
  fioul:       {},
  bois:        {
    chaudiere: "Chaudière gaz incompatible avec un chauffage bois existant",
  },
  reseau:      {
    chaudiere: "Chaudière inutile — chaleur fournie par le réseau",
    pac:       "PAC chauffage inutile — chaleur fournie par le réseau",
  },
  autre:       {},
};

export const BUILDING_REASONS: Record<BuildingKey, Partial<Record<WorkKey, string>>> = {
  maison:      {},
  appartement: {
    ite:       "L'ITE est décidée par la copropriété, pas par le lot individuel",
    planchers: "Isolation des planchers bas non applicable en appartement standard",
  },
  immeuble:    {
    cet:       "Chauffe-eau thermodynamique individuel non adapté à un immeuble collectif",
  },
  tertiaire:   {
    cet:       "Chauffe-eau thermodynamique résidentiel non adapté au tertiaire",
  },
};

// ─── Règles par défaut ─────────────────────────────────────────────────────────

export const DEFAULT_RULES: CompatRules = {
  energyRules: {
    gaz:         [],
    electricite: ["chaudiere"],
    fioul:       [],
    bois:        ["chaudiere"],
    reseau:      ["chaudiere", "pac"],
    autre:       [],
  },
  buildingRules: {
    maison:      [],
    appartement: ["ite", "planchers"],
    immeuble:    ["cet"],
    tertiaire:   ["cet"],
  },
};

// ─── localStorage ───────────────────────────────────────────────────────────────

const LS_KEY = "compat_rules_v1";

export function loadRules(): CompatRules {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CompatRules;
      // Merge with defaults to handle new keys added after save
      return {
        energyRules:   { ...DEFAULT_RULES.energyRules,   ...parsed.energyRules },
        buildingRules: { ...DEFAULT_RULES.buildingRules, ...parsed.buildingRules },
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_RULES;
}

export function saveRules(rules: CompatRules): void {
  localStorage.setItem(LS_KEY, JSON.stringify(rules));
}

export function resetRules(): CompatRules {
  localStorage.removeItem(LS_KEY);
  return DEFAULT_RULES;
}

// ─── Moteur de compatibilité ────────────────────────────────────────────────────

export interface DisabledWork {
  key: WorkKey;
  reason: string;
}

export function getDisabledWorks(
  rules: CompatRules,
  energy: EnergyKey | null,
  building: BuildingKey | null,
): Map<WorkKey, string> {
  const disabled = new Map<WorkKey, string>();

  if (energy) {
    for (const w of rules.energyRules[energy] ?? []) {
      const reason = ENERGY_REASONS[energy]?.[w] ?? `Incompatible avec ${ENERGY_LABELS[energy]}`;
      disabled.set(w, reason);
    }
  }

  if (building) {
    for (const w of rules.buildingRules[building] ?? []) {
      const reason = BUILDING_REASONS[building]?.[w] ?? `Non applicable pour ${BUILDING_LABELS[building]}`;
      if (!disabled.has(w)) disabled.set(w, reason);
    }
  }

  return disabled;
}
