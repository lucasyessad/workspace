/**
 * Tests e2e — Patrimoine 360°
 * Teste les flux critiques : calculateurs, scénarios, score global, rate limiting, analytics
 */

import { calculate } from "../lib/calculators";
import { computeScenarios } from "../lib/scenarios";
import { computeGlobalScore } from "../lib/score-global";
import { checkRateLimit } from "../lib/rate-limit";
import { AppState } from "../types";

// ===== Calculators (regression tests) =====

describe("Calculators regression", () => {
  test("Module 1 — patrimoine net correct", () => {
    const result = calculate(1, {
      revenus: 5000,
      depenses: 3500,
      epargne: 20000,
      dettes: 5000,
      investissements: 50000,
    });
    expect(result).not.toBeNull();
    const patrimoineNet = result!.find((r) => r.label === "Patrimoine net");
    expect(patrimoineNet?.value).toBe(65000);
  });

  test("Module 2 — projection retraite positive", () => {
    const result = calculate(2, {
      age: 30,
      epargne_retraite: 10000,
      capacite_epargne: 500,
      age_retraite: 65,
      niveau_vie: 3000,
    });
    expect(result).not.toBeNull();
    const projection = result!.find((r) => r.label.includes("Projection"));
    expect(typeof projection?.value).toBe("number");
    expect(projection?.value as number).toBeGreaterThan(10000);
  });

  test("Module 11 — budget 50/30/20", () => {
    const result = calculate(11, { revenu_mensuel: 4000 });
    expect(result).not.toBeNull();
    const besoins = result!.find((r) => r.label.includes("Besoins"));
    expect(besoins?.value).toBe(2000);
    const envies = result!.find((r) => r.label.includes("Envies"));
    expect(envies?.value).toBe(1200);
    const epargne = result!.find((r) => r.label.includes("Épargne"));
    expect(epargne?.value).toBe(800);
  });

  test("Module 6 — fonds urgence couverture", () => {
    const result = calculate(6, {
      depenses_mensuelles: 2000,
      epargne_urgence: 12000,
      stabilite_emploi: "cdi_stable",
      objectif_mois: 6,
    });
    expect(result).not.toBeNull();
    const mois = result!.find((r) => r.label.includes("couverts"));
    expect(mois?.value).toBe(6);
  });

  test("Module 10 — immobilier cash-flow", () => {
    const result = calculate(10, {
      prix_bien: 200000,
      loyer_mensuel: 800,
      apport: 40000,
    });
    expect(result).not.toBeNull();
    const cashFlow = result!.find((r) => r.label.includes("Cash-flow"));
    expect(typeof cashFlow?.value).toBe("number");
  });

  test("Module inexistant retourne null", () => {
    expect(calculate(99, {})).toBeNull();
  });
});

// ===== Scénarios =====

describe("Scenarios", () => {
  test("3 scénarios pour module retraite", () => {
    const scenarios = computeScenarios({
      epargne_retraite: 10000,
      capacite_epargne: 500,
      age: 30,
      age_retraite: 65,
    }, 2);

    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].type).toBe("prudent");
    expect(scenarios[1].type).toBe("equilibre");
    expect(scenarios[2].type).toBe("offensif");

    // Offensif > Equilibre > Prudent
    expect(scenarios[2].capitalFinal).toBeGreaterThan(scenarios[1].capitalFinal);
    expect(scenarios[1].capitalFinal).toBeGreaterThan(scenarios[0].capitalFinal);
  });

  test("scénarios avec module patrimoine", () => {
    const scenarios = computeScenarios({
      epargne: 50000,
      investissements: 30000,
      revenus: 5000,
      depenses: 3500,
    }, 1);
    expect(scenarios).toHaveLength(3);
    expect(scenarios[0].capitalFinal).toBeGreaterThan(0);
  });

  test("module non supporté retourne vide", () => {
    expect(computeScenarios({}, 7)).toHaveLength(0);
  });
});

// ===== Score Global =====

describe("Score Global", () => {
  test("retourne null si aucun module rempli", () => {
    const state: AppState = { modules: {} };
    expect(computeGlobalScore(state)).toBeNull();
  });

  test("calcule un score avec module 1", () => {
    const state: AppState = {
      modules: {
        1: {
          formData: { revenus: 5000, depenses: 3000, epargne: 30000, dettes: 0, investissements: 50000 },
          completed: true,
        },
      },
    };
    const score = computeGlobalScore(state);
    expect(score).not.toBeNull();
    expect(score!.score).toBeGreaterThan(0);
    expect(score!.score).toBeLessThanOrEqual(100);
    expect(["critique", "fragile", "correct", "bon", "excellent"]).toContain(score!.level);
    expect(score!.breakdown.length).toBeGreaterThan(0);
  });

  test("score multi-modules est meilleur avec bonne situation", () => {
    const state: AppState = {
      modules: {
        1: {
          formData: { revenus: 8000, depenses: 3000, epargne: 100000, dettes: 0, investissements: 200000 },
          completed: true,
        },
        6: {
          formData: { depenses_mensuelles: 3000, epargne_urgence: 36000, stabilite_emploi: "cdi_stable", objectif_mois: 6 },
          completed: true,
        },
        11: {
          formData: { revenu_mensuel: 8000, depenses_essentielles: 2000, depenses_discretionnaires: 1000 },
          completed: true,
        },
      },
    };
    const score = computeGlobalScore(state);
    expect(score).not.toBeNull();
    expect(score!.score).toBeGreaterThanOrEqual(70);
  });
});

// ===== Rate Limiting =====

describe("Rate Limiting", () => {
  test("autorise les premières requêtes", () => {
    const result = checkRateLimit("test-user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  test("bloque après trop de requêtes", () => {
    const id = "test-heavy-user-" + Date.now();
    for (let i = 0; i < 10; i++) {
      checkRateLimit(id);
    }
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
