"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildingsApi, auditsApi, scenariosApi } from "@/lib/api";
import { Building, Audit, RenovationScenario } from "@/types";
import { AUDIT_STATUS_LABELS, SCENARIO_TYPE_LABELS, ENERGY_LABEL_COLORS } from "@/lib/utils";
import { Search, Building2, ClipboardList, TrendingUp, X, ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "building" | "audit" | "scenario";
  title: string;
  subtitle: string;
  href: string;
  label?: string;
  badge?: string;
  badgeColor?: string;
}

let dataCache: {
  buildings: Building[];
  audits: Audit[];
  scenarios: RenovationScenario[];
  buildingMap: Record<string, Building>;
} | null = null;

async function loadData() {
  if (dataCache) return dataCache;
  const [b, a, s] = await Promise.all([
    buildingsApi.listBuildings(),
    auditsApi.list(),
    scenariosApi.list(),
  ]);
  const buildingMap: Record<string, Building> = {};
  for (const bl of b.data) buildingMap[bl.id] = bl;
  dataCache = { buildings: b.data, audits: a.data, scenarios: s.data, buildingMap };
  return dataCache;
}

function buildResults(
  query: string,
  buildings: Building[],
  audits: Audit[],
  scenarios: RenovationScenario[],
  buildingMap: Record<string, Building>
): SearchResult[] {
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Buildings
  for (const b of buildings) {
    const haystack = [b.name, b.city ?? "", b.address_line_1 ?? "", b.postal_code ?? "", b.building_type ?? ""]
      .join(" ")
      .toLowerCase();
    if (!q || haystack.includes(q)) {
      results.push({
        id: b.id,
        type: "building",
        title: b.name,
        subtitle: [b.address_line_1, b.postal_code, b.city].filter(Boolean).join(", ") || "Bâtiment",
        href: `/buildings/${b.id}`,
        label: b.current_energy_label,
      });
    }
  }

  // Audits
  for (const a of audits) {
    const building = buildingMap[a.building_id];
    const statusInfo = AUDIT_STATUS_LABELS[a.status];
    const haystack = [building?.name ?? "", building?.city ?? "", a.status, a.computed_energy_label ?? ""]
      .join(" ")
      .toLowerCase();
    if (!q || haystack.includes(q)) {
      results.push({
        id: a.id,
        type: "audit",
        title: building?.name ?? `Audit ${a.id.slice(0, 8)}`,
        subtitle: `Audit · ${new Date(a.created_at).toLocaleDateString("fr-FR")}`,
        href: `/audits/${a.id}`,
        label: a.computed_energy_label,
        badge: statusInfo?.label ?? a.status,
        badgeColor: statusInfo?.color,
      });
    }
  }

  // Scenarios
  for (const s of scenarios) {
    const audit = audits.find((a) => a.id === s.audit_id);
    const building = audit ? buildingMap[audit.building_id] : undefined;
    const typeLabel = SCENARIO_TYPE_LABELS[s.scenario_type] ?? s.scenario_type;
    const haystack = [s.name, building?.name ?? "", building?.city ?? "", typeLabel]
      .join(" ")
      .toLowerCase();
    if (!q || haystack.includes(q)) {
      results.push({
        id: s.id,
        type: "scenario",
        title: s.name,
        subtitle: building ? `${building.name} · ${typeLabel}` : typeLabel,
        href: `/audits/${s.audit_id}`,
        badge: typeLabel,
        badgeColor: "bg-indigo-50 text-indigo-700",
      });
    }
  }

  return results.slice(0, 20);
}

const TYPE_ICONS = {
  building: Building2,
  audit: ClipboardList,
  scenario: TrendingUp,
};

const TYPE_LABELS = {
  building: "Bâtiments",
  audit: "Audits",
  scenario: "Plans de rénovation",
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      // Preload data
      setLoading(true);
      loadData()
        .then(({ buildings, audits, scenarios, buildingMap }) => {
          setResults(buildResults("", buildings, audits, scenarios, buildingMap));
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Search as user types
  const handleQuery = useCallback(async (q: string) => {
    setQuery(q);
    setSelected(0);
    const data = await loadData();
    setResults(buildResults(q, data.buildings, data.audits, data.scenarios, data.buildingMap));
  }, []);

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].href);
    }
  }

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  // Group results
  const grouped: Record<string, SearchResult[]> = {};
  for (const r of results) {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-sm transition-colors border border-gray-200 min-w-[200px]"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Rechercher un projet...</span>
        <span className="flex items-center gap-0.5 text-[11px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5">
          <Command size={10} />K
        </span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Bâtiment, audit, plan de rénovation..."
              className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button onClick={() => handleQuery("")} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
            <kbd className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[420px] overflow-y-auto py-2">
            {loading && (
              <p className="text-center text-sm text-gray-400 py-8">Chargement...</p>
            )}

            {!loading && results.length === 0 && query && (
              <div className="text-center py-10 text-gray-400">
                <Search size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun résultat pour &quot;{query}&quot;</p>
              </div>
            )}

            {!loading && results.length === 0 && !query && (
              <div className="text-center py-10 text-gray-400">
                <Search size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tapez pour rechercher dans vos projets</p>
              </div>
            )}

            {!loading && Object.entries(grouped).map(([type, items]) => {
              const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? Search;
              return (
                <div key={type}>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                  </p>
                  {items.map((r) => {
                    const idx = results.indexOf(r);
                    const isSelected = idx === selected;
                    const LabelColor = r.label ? ENERGY_LABEL_COLORS[r.label] : null;
                    return (
                      <button
                        key={r.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          isSelected ? "bg-brand-50" : "hover:bg-gray-50"
                        )}
                        onMouseEnter={() => setSelected(idx)}
                        onClick={() => navigate(r.href)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          type === "building" ? "bg-brand-50" : type === "audit" ? "bg-green-50" : "bg-indigo-50"
                        )}>
                          <Icon size={15} className={
                            type === "building" ? "text-brand-600" : type === "audit" ? "text-green-600" : "text-indigo-600"
                          } />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                          <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {r.label && LabelColor && (
                            <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${LabelColor}`}>
                              {r.label}
                            </span>
                          )}
                          {r.badge && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${r.badgeColor ?? "bg-gray-100 text-gray-600"}`}>
                              {r.badge}
                            </span>
                          )}
                          {isSelected && <ArrowRight size={14} className="text-brand-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-2">
              <kbd className="border border-gray-200 rounded px-1 py-0.5 bg-gray-50">↑↓</kbd> naviguer
              <kbd className="border border-gray-200 rounded px-1 py-0.5 bg-gray-50">↵</kbd> ouvrir
            </span>
            <span>{results.length} résultat{results.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
    </>
  );
}
