"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Save, RotateCcw, Check, X, Info,
  Zap, Flame, Droplets, Leaf, Thermometer, Wind,
  Home, Building2, Building, Briefcase,
} from "lucide-react";
import {
  CompatRules, WorkKey, EnergyKey, BuildingKey,
  ENERGY_LABELS, BUILDING_LABELS, WORK_LABELS,
  DEFAULT_RULES, loadRules, saveRules, resetRules,
} from "@/lib/compatRules";
import AppLayout from "@/components/layout/AppLayout";

// ─── Icon maps ─────────────────────────────────────────────────────────────────
const ENERGY_ICONS: Record<EnergyKey, React.ElementType> = {
  gaz: Flame, electricite: Zap, fioul: Droplets,
  bois: Leaf, reseau: Thermometer, autre: Wind,
};
const BUILDING_ICONS: Record<BuildingKey, React.ElementType> = {
  maison: Home, appartement: Building2, immeuble: Building, tertiaire: Briefcase,
};

const ALL_WORKS   = Object.keys(WORK_LABELS) as WorkKey[];
const ALL_ENERGY  = Object.keys(ENERGY_LABELS) as EnergyKey[];
const ALL_BUILDING = Object.keys(BUILDING_LABELS) as BuildingKey[];

// ─── Matrix component ──────────────────────────────────────────────────────────

function MatrixTable<R extends string>({
  rows, rowLabels, rowIcons, works, disabledMap, onChange,
}: {
  rows: R[];
  rowLabels: Record<R, string>;
  rowIcons?: Record<R, React.ElementType>;
  works: WorkKey[];
  disabledMap: Record<R, WorkKey[]>;
  onChange: (row: R, work: WorkKey, disabled: boolean) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 pr-4 font-semibold text-gray-600 whitespace-nowrap min-w-[180px]">
              Source / Geste
            </th>
            {works.map((w) => (
              <th key={w} className="text-center px-2 py-3 font-semibold text-gray-600 whitespace-nowrap">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-wider">{WORK_LABELS[w].split(" ").slice(0, 3).join(" ")}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const Icon = rowIcons?.[row];
            const disabledSet = new Set(disabledMap[row] ?? []);
            return (
              <tr key={row} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-gray-400 flex-shrink-0" />}
                    <span className="font-medium text-gray-700">{rowLabels[row]}</span>
                  </div>
                </td>
                {works.map((work) => {
                  const isDisabled = disabledSet.has(work);
                  return (
                    <td key={work} className="text-center px-2 py-3">
                      <button
                        type="button"
                        onClick={() => onChange(row, work, !isDisabled)}
                        title={isDisabled ? "Incompatible — cliquer pour autoriser" : "Compatible — cliquer pour bloquer"}
                        className="w-7 h-7 rounded flex items-center justify-center mx-auto transition-all hover:scale-110"
                        style={{
                          backgroundColor: isDisabled ? "#fee2e2" : "#dcfce7",
                          border: `1px solid ${isDisabled ? "#fca5a5" : "#86efac"}`,
                        }}
                      >
                        {isDisabled
                          ? <X size={12} style={{ color: "#dc2626" }} strokeWidth={2.5} />
                          : <Check size={12} style={{ color: "#16a34a" }} strokeWidth={2.5} />
                        }
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────────────────

export default function ParametragePage() {
  const [rules, setRules] = useState<CompatRules>(DEFAULT_RULES);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);

  useEffect(() => { setRules(loadRules()); }, []);

  function updateEnergy(energy: EnergyKey, work: WorkKey, makeDisabled: boolean) {
    setDirty(true);
    setRules((prev) => {
      const current = new Set(prev.energyRules[energy]);
      makeDisabled ? current.add(work) : current.delete(work);
      return { ...prev, energyRules: { ...prev.energyRules, [energy]: [...current] } };
    });
  }

  function updateBuilding(building: BuildingKey, work: WorkKey, makeDisabled: boolean) {
    setDirty(true);
    setRules((prev) => {
      const current = new Set(prev.buildingRules[building]);
      makeDisabled ? current.add(work) : current.delete(work);
      return { ...prev, buildingRules: { ...prev.buildingRules, [building]: [...current] } };
    });
  }

  function handleSave() {
    saveRules(rules);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setRules(resetRules());
    setDirty(false);
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} style={{ color: `var(--brand-500)` }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `var(--brand-500)` }}>
                Administration
              </p>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Paramétrage des compatibilités
            </h1>
            <p className="text-sm text-gray-500">
              Définissez quels gestes de travaux sont proposés selon l'énergie et le type de bâtiment.
              Ces règles s'appliquent au simulateur public et aux formulaires de création d'audit.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: saved ? "#16a34a" : dirty ? `var(--brand-500)` : "#999" }}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* ── Info banner ─────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-md mb-8 text-sm"
          style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
          <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#000091" }} />
          <div className="text-gray-700">
            <strong className="text-gray-900">Légende :</strong>{" "}
            <span className="inline-flex items-center gap-1 mx-1">
              <span className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "#dcfce7", border: "1px solid #86efac" }}>
                <Check size={10} style={{ color: "#16a34a" }} />
              </span>
              Compatible
            </span>{" "}
            ·{" "}
            <span className="inline-flex items-center gap-1 mx-1">
              <span className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5" }}>
                <X size={10} style={{ color: "#dc2626" }} />
              </span>
              Incompatible / masqué dans le simulateur
            </span>{" "}
            — Cliquez sur une cellule pour basculer l'état.
          </div>
        </div>

        {/* ── Section 1 : Énergie × Gestes ────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Énergie principale → Gestes disponibles</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ex : avec un chauffage bois, la chaudière gaz n'a pas de sens — la masquer évite les erreurs de conseil.
            </p>
          </div>
          <div className="p-6">
            <MatrixTable<EnergyKey>
              rows={ALL_ENERGY}
              rowLabels={ENERGY_LABELS}
              rowIcons={ENERGY_ICONS}
              works={ALL_WORKS}
              disabledMap={rules.energyRules}
              onChange={updateEnergy}
            />
          </div>
        </section>

        {/* ── Section 2 : Type bâtiment × Gestes ──────────────── */}
        <section className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Type de bâtiment → Gestes disponibles</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ex : l'ITE d'un appartement est décidée par la copropriété — la proposer à un lot individuel crée de la confusion.
            </p>
          </div>
          <div className="p-6">
            <MatrixTable<BuildingKey>
              rows={ALL_BUILDING}
              rowLabels={BUILDING_LABELS}
              rowIcons={BUILDING_ICONS}
              works={ALL_WORKS}
              disabledMap={rules.buildingRules}
              onChange={updateBuilding}
            />
          </div>
        </section>

        {/* ── Section 3 : Récap règles actives ────────────────── */}
        <section className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Récapitulatif des incompatibilités actives</h2>
          </div>
          <div className="p-6">
            {ALL_ENERGY.filter(e => rules.energyRules[e].length > 0).length === 0 &&
             ALL_BUILDING.filter(b => rules.buildingRules[b].length > 0).length === 0 ? (
              <p className="text-sm text-gray-400">Aucune incompatibilité configurée — tous les gestes sont disponibles partout.</p>
            ) : (
              <div className="space-y-3">
                {ALL_ENERGY.filter(e => rules.energyRules[e].length > 0).map(e => (
                  <div key={e} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 min-w-[160px]">{ENERGY_LABELS[e]}</span>
                    <span className="text-gray-400 text-xs">masque</span>
                    {rules.energyRules[e].map(w => (
                      <span key={w} className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        {WORK_LABELS[w]}
                      </span>
                    ))}
                  </div>
                ))}
                {ALL_BUILDING.filter(b => rules.buildingRules[b].length > 0).map(b => (
                  <div key={b} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700 min-w-[160px]">{BUILDING_LABELS[b]}</span>
                    <span className="text-gray-400 text-xs">masque</span>
                    {rules.buildingRules[b].map(w => (
                      <span key={w} className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
                        {WORK_LABELS[w]}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Les règles sont stockées pour cette organisation et s'appliquent immédiatement au simulateur.{" "}
          <Link href="/simulateur" className="underline hover:text-gray-600">
            Tester le simulateur →
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
