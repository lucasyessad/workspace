/**
 * Stockage centralisé avec versioning et migration.
 * Remplace les multiples loadState()/saveState() dupliqués.
 */

import { AppState } from "@/types";

const STATE_KEY = "patrimoine360_state";
const CURRENT_VERSION = 2;

interface VersionedData {
  v: number;
  data: AppState;
}

/** Migre les données d'une version à une autre */
function migrate(raw: unknown): AppState {
  // Version 0/1: pas de champ v, données brutes
  if (raw && typeof raw === "object" && !("v" in raw)) {
    return raw as AppState;
  }

  const versioned = raw as VersionedData;

  if (versioned.v === CURRENT_VERSION) {
    return versioned.data;
  }

  // Migration v1 → v2 (ajout du versioning)
  if (!versioned.v || versioned.v < 2) {
    return versioned.data || (raw as AppState);
  }

  return versioned.data;
}

export function loadAppState(): AppState {
  try {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return migrate(parsed);
    }
  } catch {
    // Données corrompues, repartir à zéro
  }
  return { modules: {} };
}

export function saveAppState(state: AppState): void {
  try {
    const versioned: VersionedData = { v: CURRENT_VERSION, data: state };
    const json = JSON.stringify(versioned);

    // Vérifier la taille avant d'écrire (~5 Mo max)
    if (json.length > 4_500_000) {
      console.warn("[Storage] Données proches de la limite localStorage. Nettoyage automatique.");
      trimHistory(state);
    }

    localStorage.setItem(STATE_KEY, JSON.stringify({ v: CURRENT_VERSION, data: state }));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.error("[Storage] Quota localStorage dépassé. Nettoyage en cours...");
      trimHistory(state);
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify({ v: CURRENT_VERSION, data: state }));
      } catch {
        // Impossible de sauvegarder
      }
    }
  }
}

/** Réduit l'historique pour libérer de l'espace */
function trimHistory(state: AppState): void {
  for (const moduleId of Object.keys(state.modules)) {
    const mod = state.modules[Number(moduleId)];
    if (mod.history && mod.history.length > 3) {
      mod.history = mod.history.slice(-3);
    }
  }
}

/** Génère un identifiant unique */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
