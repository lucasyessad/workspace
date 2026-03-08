import { calculate } from "@/lib/calculators";

describe("Module 01 — Diagnostic Patrimonial", () => {
  it("calculates patrimoine net correctly", () => {
    const results = calculate(1, { revenus: 5000, depenses: 3500, epargne: 50000, dettes: 15000, investissements: 30000 });
    expect(results).not.toBeNull();
    const patrimoine = results!.find((r) => r.label === "Patrimoine net");
    expect(patrimoine).toBeDefined();
    expect(patrimoine!.value).toBe(65000); // 50000 + 30000 - 15000
  });

  it("calculates taux d'épargne correctly", () => {
    const results = calculate(1, { revenus: 5000, depenses: 3500, epargne: 0, dettes: 0, investissements: 0 });
    const taux = results!.find((r) => r.label === "Taux d'épargne");
    expect(taux!.value).toBe(30); // (5000-3500)/5000 * 100
  });

  it("calculates fonds urgence months correctly", () => {
    const results = calculate(1, { revenus: 5000, depenses: 2000, epargne: 12000, dettes: 0, investissements: 0 });
    const fonds = results!.find((r) => r.label === "Fonds d'urgence");
    expect(fonds!.value).toBe(6); // 12000 / 2000
  });

  it("assigns correct score colors", () => {
    const good = calculate(1, { revenus: 10000, depenses: 5000, epargne: 100000, dettes: 5000, investissements: 200000 });
    const score = good!.find((r) => r.label === "Score de santé financière");
    expect(score!.color).toBe("success");

    const bad = calculate(1, { revenus: 2000, depenses: 1900, epargne: 100, dettes: 50000, investissements: 0 });
    const scoreBad = bad!.find((r) => r.label === "Score de santé financière");
    expect(scoreBad!.color).toBe("warning");
  });

  it("handles zero revenues gracefully", () => {
    const results = calculate(1, { revenus: 0, depenses: 0, epargne: 0, dettes: 0, investissements: 0 });
    expect(results).not.toBeNull();
    const taux = results!.find((r) => r.label === "Taux d'épargne");
    expect(taux!.value).toBe(0);
  });
});

describe("Module 02 — Planification Retraite", () => {
  it("calculates objectif retraite with 4% rule", () => {
    const results = calculate(2, { age: 35, epargne_retraite: 50000, revenus_annuels: 60000, capacite_epargne: 800, age_retraite: 65, niveau_vie: 3000 });
    const objectif = results!.find((r) => r.label === "Objectif retraite (règle 4%)");
    expect(objectif!.value).toBe(900000); // 3000 * 12 * 25
  });

  it("projects portfolio growth with compound interest", () => {
    const results = calculate(2, { age: 35, epargne_retraite: 100000, capacite_epargne: 1000, age_retraite: 65, niveau_vie: 3000 });
    const projection = results!.find((r) => r.label === "Projection du portefeuille");
    expect(Number(projection!.value)).toBeGreaterThan(100000);
  });

  it("handles edge case where age equals retirement age", () => {
    const results = calculate(2, { age: 65, epargne_retraite: 500000, capacite_epargne: 0, age_retraite: 65, niveau_vie: 2000 });
    const projection = results!.find((r) => r.label === "Projection du portefeuille");
    expect(projection!.value).toBe(500000);
  });
});

describe("Module 05 — Dettes", () => {
  it("parses and totals debts correctly", () => {
    const results = calculate(5, {
      dettes_detail: "Crédit auto : 15000, 4.5, 350\nCarte : 3000, 18, 90",
      revenu_mensuel: 4000,
      extra_remboursement: 500,
    });
    const total = results!.find((r) => r.label === "Total des dettes");
    expect(total!.value).toBe(18000);
  });

  it("handles empty debt input", () => {
    const results = calculate(5, { dettes_detail: "", revenu_mensuel: 4000, extra_remboursement: 500 });
    const total = results!.find((r) => r.label === "Total des dettes");
    expect(total!.value).toBe(0);
  });
});

describe("Module 06 — Fonds d'urgence", () => {
  it("calculates months covered correctly", () => {
    const results = calculate(6, { revenu_mensuel: 4000, depenses_mensuelles: 3000, epargne_urgence: 9000, stabilite_emploi: "cdi_stable", objectif_mois: "6" });
    const mois = results!.find((r) => r.label === "Mois actuellement couverts");
    expect(mois!.value).toBe(3); // 9000 / 3000
  });

  it("recommends 12 months for freelancers", () => {
    const results = calculate(6, { revenu_mensuel: 4000, depenses_mensuelles: 3000, epargne_urgence: 0, stabilite_emploi: "freelance", objectif_mois: "6" });
    const objectif = results!.find((r) => r.label === "Objectif fonds d'urgence");
    expect(objectif!.value).toBe(36000); // 3000 * 12
  });
});

describe("Module 10 — Immobilier", () => {
  it("calculates cash-flow correctly", () => {
    const results = calculate(10, { prix_bien: 200000, loyer_mensuel: 1000, apport: 40000 });
    const cashFlow = results!.find((r) => r.label === "Cash-flow mensuel");
    expect(cashFlow).toBeDefined();
    // Loyer 1000 - mensualité ~928 - charges 250 ≈ negative
    expect(Number(cashFlow!.value)).toBeLessThan(1000);
  });

  it("calculates rendement brut correctly", () => {
    const results = calculate(10, { prix_bien: 200000, loyer_mensuel: 1000, apport: 40000 });
    const rend = results!.find((r) => r.label === "Rendement brut");
    expect(rend!.value).toBe(6); // (1000*12)/200000 * 100
  });
});

describe("Module 11 — Budget", () => {
  it("applies 50/30/20 rule correctly", () => {
    const results = calculate(11, { revenu_mensuel: 4000 });
    const besoins = results!.find((r) => r.label === "Besoins (50%)");
    const envies = results!.find((r) => r.label === "Envies (30%)");
    const epargne = results!.find((r) => r.label.includes("20%"));
    expect(besoins!.value).toBe(2000);
    expect(envies!.value).toBe(1200);
    expect(epargne!.value).toBe(800);
  });
});

describe("Non-calculator modules", () => {
  it("returns null for modules without calculators", () => {
    expect(calculate(3, {})).toBeNull();
    expect(calculate(4, {})).toBeNull();
    expect(calculate(7, {})).toBeNull();
    expect(calculate(8, {})).toBeNull();
    expect(calculate(9, {})).toBeNull();
    expect(calculate(12, {})).toBeNull();
  });
});
