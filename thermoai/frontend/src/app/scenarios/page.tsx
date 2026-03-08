"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { scenariosApi, exportsApi, auditsApi, buildingsApi } from "@/lib/api";
import { RenovationScenario, Audit, Building } from "@/types";
import { formatNumber, SCENARIO_TYPE_LABELS } from "@/lib/utils";
import { TrendingUp, Plus, FileDown, Euro, Zap, Leaf, ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";

const TYPE_COLORS: Record<string, string> = {
  minimal:            "bg-gray-100 text-gray-600",
  standard:           "bg-blue-50 text-blue-700",
  performant:         "bg-indigo-50 text-indigo-700",
  bbc_renovation:     "bg-emerald-50 text-emerald-700",
  renovation_globale: "bg-green-50 text-green-700",
};

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<RenovationScenario[]>([]);
  const [auditMap, setAuditMap] = useState<Record<string, Audit>>({});
  const [buildingMap, setBuildingMap] = useState<Record<string, Building>>({});
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([scenariosApi.list(), auditsApi.list(), buildingsApi.listBuildings()])
      .then(([s, a, b]) => {
        setScenarios(s.data);
        const am: Record<string, Audit> = {};
        for (const au of a.data) am[au.id] = au;
        setAuditMap(am);
        const bm: Record<string, Building> = {};
        for (const bl of b.data) bm[bl.id] = bl;
        setBuildingMap(bm);
      })
      .finally(() => setLoading(false));
  }, []);

  function getBuildingForScenario(s: RenovationScenario): Building | undefined {
    const audit = auditMap[s.audit_id];
    if (!audit) return undefined;
    return buildingMap[audit.building_id];
  }

  async function handleExcelExport() {
    setExporting(true);
    try {
      const r = await exportsApi.downloadScenariosXlsx();
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `thermopilot_scenarios_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  // Filtering
  const filtered = scenarios.filter((s) => {
    if (typeFilter !== "all" && s.scenario_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const building = getBuildingForScenario(s);
      const hits = [
        s.name,
        building?.name ?? "",
        building?.city ?? "",
        building?.address_line_1 ?? "",
        building?.postal_code ?? "",
      ].some((v) => v.toLowerCase().includes(q));
      if (!hits) return false;
    }
    return true;
  });

  // Global KPIs (all scenarios)
  const totalCost = scenarios.reduce((acc, sc) => acc + (sc.estimated_total_cost_eur ?? 0), 0);
  const totalKwh  = scenarios.reduce((acc, sc) => acc + (sc.estimated_energy_savings_kwh ?? 0), 0);
  const totalCo2  = scenarios.reduce((acc, sc) => acc + (sc.estimated_co2_reduction_kg ?? 0), 0);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plans de rénovation</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {scenarios.length} plan{scenarios.length !== 1 ? "s" : ""} · aides France Rénov&apos; intégrées
            </p>
          </div>
          <div className="flex gap-2">
            {scenarios.length > 0 && (
              <button className="btn-secondary" onClick={handleExcelExport} disabled={exporting}>
                <FileDown size={16} />
                {exporting ? "Export..." : "Export Excel"}
              </button>
            )}
            <Link href="/scenarios/new" className="btn-primary">
              <Plus size={16} />
              Nouveau plan
            </Link>
          </div>
        </div>

        {/* KPI banner */}
        {scenarios.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Euro size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatNumber(totalCost)} €</p>
                <p className="text-xs text-gray-400">Investissement total estimé</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatNumber(totalKwh)}</p>
                <p className="text-xs text-gray-400">kWh/an économisés</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Leaf size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatNumber(totalCo2)}</p>
                <p className="text-xs text-gray-400">kg CO₂ évités/an</p>
              </div>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        {scenarios.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input pl-9 pr-8"
                placeholder="Bâtiment, ville, nom du plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Type filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  typeFilter === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                Tous ({scenarios.length})
              </button>
              {Object.entries(SCENARIO_TYPE_LABELS).map(([k, label]) => {
                const count = scenarios.filter((s) => s.scenario_type === k).length;
                if (count === 0) return null;
                return (
                  <button
                    key={k}
                    onClick={() => setTypeFilter(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      typeFilter === k
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result count */}
        {(search || typeFilter !== "all") && scenarios.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            {search && ` pour "${search}"`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : scenarios.length === 0 ? (
          <div className="card p-16 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun plan de rénovation</h3>
            <p className="text-gray-500 mb-2 text-sm max-w-sm mx-auto">
              Créez un plan depuis un audit pour simuler les aides MaPrimeRénov&apos;, CEE et Éco-PTZ.
            </p>
            <Link href="/scenarios/new" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Créer un plan
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <Search size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun résultat pour cette recherche</p>
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); }}
              className="btn-secondary mt-3 text-xs"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((s) => {
              const building = getBuildingForScenario(s);
              const typeLabel = SCENARIO_TYPE_LABELS[s.scenario_type] ?? s.scenario_type;
              const typeColor = TYPE_COLORS[s.scenario_type] ?? "bg-gray-100 text-gray-600";
              return (
                <div key={s.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
                  {/* Building tag */}
                  {building && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span className="font-medium text-gray-600 truncate">{building.name}</span>
                      {building.city && <span className="text-gray-400 flex-shrink-0">· {building.city}</span>}
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <EnergyLabel label={s.target_energy_label} size="sm" />
                  </div>

                  {/* Financials */}
                  <dl className="space-y-2 text-sm flex-1">
                    {s.estimated_total_cost_eur != null && (
                      <div className="flex justify-between items-center">
                        <dt className="text-gray-400 text-xs flex items-center gap-1">
                          <Euro size={11} /> Coût total
                        </dt>
                        <dd className="font-semibold text-gray-800">{formatNumber(s.estimated_total_cost_eur)} €</dd>
                      </div>
                    )}
                    {s.estimated_energy_savings_kwh != null && (
                      <div className="flex justify-between items-center">
                        <dt className="text-gray-400 text-xs flex items-center gap-1">
                          <Zap size={11} className="text-yellow-500" /> Économies
                        </dt>
                        <dd className="font-semibold text-green-600">{formatNumber(s.estimated_energy_savings_kwh)} kWh/an</dd>
                      </div>
                    )}
                    {s.estimated_co2_reduction_kg != null && (
                      <div className="flex justify-between items-center">
                        <dt className="text-gray-400 text-xs flex items-center gap-1">
                          <Leaf size={11} className="text-green-500" /> CO₂ évité
                        </dt>
                        <dd className="font-semibold text-green-600">{formatNumber(s.estimated_co2_reduction_kg)} kg/an</dd>
                      </div>
                    )}
                    {s.simple_payback_years != null && (
                      <div className="flex justify-between items-center">
                        <dt className="text-gray-400 text-xs">Retour sur investissement</dt>
                        <dd className="font-semibold text-gray-800">{s.simple_payback_years} ans</dd>
                      </div>
                    )}
                  </dl>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <Link
                      href={`/audits/${s.audit_id}`}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      Voir l&apos;audit <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
