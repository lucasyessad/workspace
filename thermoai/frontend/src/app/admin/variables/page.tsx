"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Save, RotateCcw, Check, Info, AlertTriangle,
  TrendingUp, CreditCard, BarChart3, Users, Settings2, Zap,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import {
  AdminVars, DEFAULT_VARS, WORK_LABELS, INCOME_LABELS,
  ENERGY_LABELS, YEAR_LABELS, DPE_CLASSES, DpeClass,
  WorkKey, IncomeLevelKey, EnergyKey, YearKey,
  loadAdminVars, saveAdminVars, resetAdminVars,
} from "@/lib/adminVars";

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "mpr",       label: "MaPrimeRénov'", icon: TrendingUp,  color: `var(--brand-500)` },
  { id: "cee",       label: "Prime CEE",     icon: BarChart3,   color: "#000091" },
  { id: "ecoptz",    label: "Éco-PTZ",       icon: CreditCard,  color: "#7C3AED" },
  { id: "revenus",   label: "Revenus ANAH",  icon: Users,       color: "#D97706" },
  { id: "dpe",       label: "Matrice DPE",   icon: Zap,         color: "#0891b2" },
  { id: "reglement", label: "Réglementation",icon: Settings2,   color: "#6b7280" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Components ────────────────────────────────────────────────────────────────

function NumberField({ label, value, onChange, unit, min, max, step, hint, warn }: {
  label: string; value: number; onChange: (v: number) => void;
  unit?: string; min?: number; max?: number; step?: number;
  hint?: string; warn?: string;
}) {
  const [raw, setRaw] = useState(String(value));
  useEffect(() => setRaw(String(value)), [value]);

  function commit() {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(n);
    else setRaw(String(value));
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number" value={raw} min={min} max={max} step={step ?? 1}
          onChange={e => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === "Enter" && commit()}
          className="w-28 px-2.5 py-1.5 border border-gray-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
      {warn && <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle size={10} />{warn}</p>}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">{children}</h3>;
}

// ─── Tab: MPR ──────────────────────────────────────────────────────────────────

function TabMpr({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  const works = Object.keys(WORK_LABELS) as WorkKey[];
  const incomes = Object.keys(INCOME_LABELS) as IncomeLevelKey[];

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 p-4 rounded text-xs" style={{ backgroundColor: `var(--brand-50)`, border: "1px solid #c5e8d3" }}>
        <Info size={13} style={{ color: `var(--brand-500)`, flexShrink: 0 }} className="mt-0.5" />
        <p className="text-gray-700">
          <strong>Montants MPR de base</strong> — avant application du facteur revenu.
          Aide réelle = <code className="bg-gray-100 px-1 rounded">baseMPR × facteurRevenu × facteurSurface</code>.
          Plafond global : <strong>{vars.mprPlafondGlobal.toLocaleString("fr-FR")} €</strong>.
        </p>
      </div>

      {/* Base amounts */}
      <div>
        <SectionTitle>Montants de base MPR par geste (€)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {works.map(w => (
            <NumberField key={w} label={WORK_LABELS[w]} value={vars.mprBase[w]} unit="€"
              min={0} max={100000}
              onChange={v => setVars(d => ({ ...d, mprBase: { ...d.mprBase, [w]: v } }))} />
          ))}
        </div>
      </div>

      {/* Income factors */}
      <div>
        <SectionTitle>Facteurs de revenus (0 = 0 %, 1 = 100 %)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {incomes.map(i => (
            <NumberField key={i} label={INCOME_LABELS[i]} value={vars.incomeFactors[i]}
              min={0} max={1} step={0.01}
              hint={`${Math.round(vars.incomeFactors[i] * 100)} % du coût des travaux`}
              onChange={v => setVars(d => ({ ...d, incomeFactors: { ...d.incomeFactors, [i]: v } }))} />
          ))}
        </div>
      </div>

      {/* Global caps */}
      <div>
        <SectionTitle>Plafonds globaux</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberField label="Plafond MPR global par ménage" value={vars.mprPlafondGlobal} unit="€"
            min={0} max={200000}
            onChange={v => setVars(d => ({ ...d, mprPlafondGlobal: v }))} />
          <NumberField label="Bonus BBC rénovation globale" value={vars.mprBonusBbc} unit="€"
            min={0} max={50000}
            onChange={v => setVars(d => ({ ...d, mprBonusBbc: v }))} />
        </div>
      </div>

      {/* Simulation preview */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100"><p className="font-semibold text-gray-900 text-xs">Aperçu — Aide MPR pour 100 m² (toiture, ménage très modeste)</p></div>
        <div className="px-4 py-3">
          <p className="text-2xl font-bold" style={{ color: `var(--brand-500)` }}>
            {Math.round(vars.mprBase.combles * vars.incomeFactors.tres_modeste * 1.0).toLocaleString("fr-FR")} €
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Formule : {vars.mprBase.combles.toLocaleString()} × {vars.incomeFactors.tres_modeste} × 1,0</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: CEE ──────────────────────────────────────────────────────────────────

function TabCee({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  const works = Object.keys(WORK_LABELS) as WorkKey[];
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 p-4 rounded text-xs" style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
        <Info size={13} style={{ color: "#000091", flexShrink: 0 }} className="mt-0.5" />
        <p className="text-gray-700">
          Les primes CEE sont négociées avec les fournisseurs d'énergie obligés (EDF, Total, etc.) et varient selon les périodes.
          Mettez à jour ces montants après chaque appel d'offres CEE (<strong>bonification coup de pouce incluse</strong>).
        </p>
      </div>
      <div>
        <SectionTitle>Primes CEE de base par geste (€)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {works.map(w => (
            <NumberField key={w} label={WORK_LABELS[w]} value={vars.ceeBase[w]} unit="€"
              min={0} max={20000}
              onChange={v => setVars(d => ({ ...d, ceeBase: { ...d.ceeBase, [w]: v } }))} />
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Cumul MPR + CEE — aperçu (ménage intermédiaire, 100 m²)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {works.map(w => {
            const mpr = Math.round(vars.mprBase[w] * vars.incomeFactors.intermediaire);
            const cee = vars.ceeBase[w];
            return (
              <div key={w} className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-[10px] text-gray-500 truncate mb-1">{WORK_LABELS[w]}</p>
                <p className="text-sm font-bold" style={{ color: `var(--brand-500)` }}>{mpr.toLocaleString("fr-FR")} €</p>
                <p className="text-xs text-gray-400">+ {cee.toLocaleString("fr-FR")} € CEE</p>
                <p className="text-xs font-semibold text-gray-700">{(mpr + cee).toLocaleString("fr-FR")} € total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Éco-PTZ ──────────────────────────────────────────────────────────────

function TabEcoPtz({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Plafonds Éco-PTZ par catégorie de bouquet (€)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {([
            { k: "action_isolante",   l: "1 action isolante seule",           h: "ITE, combles ou planchers seuls" },
            { k: "bouquet_2_actions", l: "Bouquet de 2 actions",              h: "Ex. isolation + chauffage" },
            { k: "bouquet_3_actions", l: "Bouquet de 3 actions ou plus",      h: "Ex. isolation + chauffage + VMC" },
            { k: "bbc_renovation",    l: "Rénovation BBC (≥ 2 sauts DPE)",   h: "Parcours accompagné MPR" },
            { k: "solde_post_mpr",    l: "Solde post-MaPrimeRénov'",          h: "Complément après obtention MPR" },
          ] as const).map(({ k, l, h }) => (
            <NumberField key={k} label={l} value={vars.ecoptzCaps[k]} unit="€" min={0} max={100000}
              hint={h}
              onChange={v => setVars(d => ({ ...d, ecoptzCaps: { ...d.ecoptzCaps, [k]: v } }))} />
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Durée de remboursement</SectionTitle>
        <div className="grid grid-cols-2 gap-5">
          <NumberField label="Durée minimale" value={vars.ecoptzDureeMin} unit="mois" min={12} max={60}
            hint={`${Math.round(vars.ecoptzDureeMin / 12)} ans minimum`}
            onChange={v => setVars(d => ({ ...d, ecoptzDureeMin: v }))} />
          <NumberField label="Durée maximale" value={vars.ecoptzDureeMax} unit="mois" min={60} max={360}
            hint={`${Math.round(vars.ecoptzDureeMax / 12)} ans maximum`}
            onChange={v => setVars(d => ({ ...d, ecoptzDureeMax: v }))} />
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Revenus ANAH ─────────────────────────────────────────────────────────

function TabRevenus({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  const incomes = (["tres_modeste", "modeste", "intermediaire"] as IncomeLevelKey[]);
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 p-4 rounded text-xs" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
        <AlertTriangle size={13} style={{ color: "#d97706", flexShrink: 0 }} className="mt-0.5" />
        <p className="text-gray-700">
          Seuils pour <strong>2 personnes</strong>. Ces plafonds sont actualisés par l'ANAH chaque année.
          <a href="https://www.anah.gouv.fr/proprietaires/proprietaires-occupants/etes-vous-eligible/" target="_blank" rel="noopener noreferrer"
            className="underline ml-1" style={{ color: "#d97706" }}>Vérifier sur anah.gouv.fr →</a>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <SectionTitle>Île-de-France (€/an)</SectionTitle>
          <div className="space-y-4">
            {incomes.map(i => (
              <NumberField key={i} label={INCOME_LABELS[i]} value={vars.anahThresholds.idf[i]} unit="€/an"
                min={0} max={200000}
                onChange={v => setVars(d => ({
                  ...d,
                  anahThresholds: { ...d.anahThresholds, idf: { ...d.anahThresholds.idf, [i]: v } },
                }))} />
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Province (€/an)</SectionTitle>
          <div className="space-y-4">
            {incomes.map(i => (
              <NumberField key={i} label={INCOME_LABELS[i]} value={vars.anahThresholds.province[i]} unit="€/an"
                min={0} max={200000}
                onChange={v => setVars(d => ({
                  ...d,
                  anahThresholds: { ...d.anahThresholds, province: { ...d.anahThresholds.province, [i]: v } },
                }))} />
            ))}
          </div>
        </div>
      </div>

      {/* Preview table */}
      <div>
        <SectionTitle>Aperçu des seuils configurés</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-gray-500 font-semibold">Profil</th>
                <th className="text-right py-2 px-4 text-gray-500 font-semibold">IdF</th>
                <th className="text-right py-2 px-4 text-gray-500 font-semibold">Province</th>
                <th className="text-right py-2 pl-4 text-gray-500 font-semibold">MPR max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(["tres_modeste", "modeste", "intermediaire", "aise"] as IncomeLevelKey[]).map(i => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2.5 pr-4 font-medium text-gray-700">{INCOME_LABELS[i]}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">
                    {i === "aise" ? "— (au-dessus)" : vars.anahThresholds.idf[i]?.toLocaleString("fr-FR") + " €"}
                  </td>
                  <td className="py-2.5 px-4 text-right text-gray-600">
                    {i === "aise" ? "—" : vars.anahThresholds.province[i]?.toLocaleString("fr-FR") + " €"}
                  </td>
                  <td className="py-2.5 pl-4 text-right font-semibold" style={{ color: `var(--brand-500)` }}>
                    {Math.round(vars.incomeFactors[i] * 100)} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Matrice DPE ──────────────────────────────────────────────────────────

const DPE_COLORS: Record<DpeClass, string> = {
  A: "#00a84f", B: "#52b748", C: "#c8d200", D: "#f7e400", E: "#f0a500", F: "#e8500a", G: "#cc0000",
};

function TabDpe({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  const energies = Object.keys(ENERGY_LABELS) as EnergyKey[];
  const years    = Object.keys(YEAR_LABELS) as YearKey[];

  function setCell(energy: EnergyKey, year: YearKey, val: DpeClass) {
    setVars(d => ({
      ...d,
      dpeMatrix: {
        ...d.dpeMatrix,
        [energy]: { ...d.dpeMatrix[energy], [year]: val },
      },
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded text-xs" style={{ backgroundColor: "#e0f2fe", border: "1px solid #bae6fd" }}>
        <Info size={13} style={{ color: "#0891b2", flexShrink: 0 }} className="mt-0.5" />
        <div className="text-gray-700">
          <p>Matrice estimative <strong>Énergie × Année de construction → Classe DPE</strong>.
          Depuis janvier 2026, le PEF électricité passe de 2,58 à <strong>{vars.electricityPef}</strong> — les logements à chauffage électrique gagnent environ une classe.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-3 pr-4 font-semibold text-gray-600 min-w-[140px]">Énergie</th>
              {years.map(y => (
                <th key={y} className="text-center px-2 py-3 font-semibold text-gray-600 whitespace-nowrap">{YEAR_LABELS[y]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {energies.map(energy => (
              <tr key={energy} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-700">{ENERGY_LABELS[energy]}</td>
                {years.map(year => {
                  const val = vars.dpeMatrix[energy]?.[year] as DpeClass ?? "D";
                  return (
                    <td key={year} className="px-2 py-2 text-center">
                      <select
                        value={val}
                        onChange={e => setCell(energy, year, e.target.value as DpeClass)}
                        className="w-14 px-1 py-1.5 rounded border text-xs font-bold text-center cursor-pointer focus:outline-none focus:ring-2"
                        style={{
                          borderColor: DPE_COLORS[val],
                          backgroundColor: DPE_COLORS[val] + "18",
                          color: val === "C" || val === "D" ? "#333" : val === "A" || val === "B" ? "#fff" : "#fff",
                          backgroundColor: DPE_COLORS[val],
                          color: "#fff",
                        }}>
                        {DPE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Réglementation ───────────────────────────────────────────────────────

function TabReglement({ vars, setVars }: { vars: AdminVars; setVars: React.Dispatch<React.SetStateAction<AdminVars>> }) {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Facteurs réglementaires</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <NumberField
            label="PEF électricité (facteur d'énergie primaire)"
            value={vars.electricityPef}
            min={1} max={3} step={0.01}
            hint="1.9 depuis janv. 2026 (était 2.58 avant la réforme)"
            warn={vars.electricityPef > 2 ? "Valeur pré-2026 — vérifiez si la réforme s'applique" : undefined}
            onChange={v => setVars(d => ({ ...d, electricityPef: v }))}
          />
          <NumberField
            label="Taux TVA réduit sur travaux (%)"
            value={vars.tvaTaux}
            min={0} max={20} step={0.1}
            hint="5,5 % pour les travaux d'amélioration énergétique"
            onChange={v => setVars(d => ({ ...d, tvaTaux: v }))}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Informations de version</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Version réglementation</label>
            <input type="text" value={vars.regleVersion}
              onChange={e => setVars(d => ({ ...d, regleVersion: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Ex : 2025-2026" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email admin (alertes réglementaires)</label>
            <input type="email" value={vars.adminEmail}
              onChange={e => setVars(d => ({ ...d, adminEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="admin@monorganisation.fr" />
            <p className="text-xs text-gray-400 mt-1">Utilisé pour les alertes de la veille réglementaire.</p>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Sources réglementaires de référence</SectionTitle>
        <div className="space-y-2">
          {[
            { label: "ANAH — Plafonds MPR 2025", href: "https://www.anah.gouv.fr/proprietaires/proprietaires-occupants/etes-vous-eligible/" },
            { label: "Logiciels audit agréés — Ministère", href: "https://rt-re-batiment.developpement-durable.gouv.fr/evaluation-des-logiciels-audit-energetique-a782.html" },
            { label: "Observatoire DPE — ADEME", href: "https://observatoire-dpe.fr/" },
            { label: "France Rénov' — Aides & parcours", href: "https://france-renov.gouv.fr/" },
          ].map(s => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all group">
              <span>{s.label}</span>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VariablesPage() {
  const [vars, setVars]       = useState<AdminVars>(DEFAULT_VARS);
  const [activeTab, setActiveTab] = useState<TabId>("mpr");
  const [saved, setSaved]     = useState(false);
  const [dirty, setDirty]     = useState(false);

  useEffect(() => { setVars(loadAdminVars()); }, []);

  // Detect changes
  const origRef = useCallback(() => loadAdminVars(), []);

  function handleChange(updater: React.Dispatch<React.SetStateAction<AdminVars>>) {
    setDirty(true);
    return updater;
  }

  const wrappedSetVars: React.Dispatch<React.SetStateAction<AdminVars>> = (v) => {
    setDirty(true);
    setVars(v);
  };

  function handleSave() {
    saveAdminVars(vars);
    setSaved(true); setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    const def = resetAdminVars();
    setVars(def); setDirty(false);
  }

  const tab = TABS.find(t => t.id === activeTab)!;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: `var(--brand-500)` }}>Administration</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Variables réglementaires</h1>
            <p className="text-sm text-gray-500">
              Toutes les valeurs utilisées dans les simulateurs, calculs d'aides et matrices DPE.
              {vars.lastModified && <span className="text-gray-400 ml-2">· Mis à jour le {new Date(vars.lastModified).toLocaleDateString("fr-FR")}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              <RotateCcw size={13} />Réinitialiser
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: saved ? "#16a34a" : dirty ? `var(--brand-500)` : "#999" }}>
              {saved ? <Check size={13} /> : <Save size={13} />}
              {saved ? "Enregistré !" : "Enregistrer"}
            </button>
          </div>
        </div>

        {dirty && (
          <div className="flex items-center gap-2 p-3 rounded mb-6 text-xs font-medium" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={13} style={{ color: "#d97706" }} />
            <span className="text-gray-700">Modifications non enregistrées — cliquez sur "Enregistrer" pour appliquer.</span>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} type="button"
                  className="flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                  style={{
                    borderBottomColor: active ? t.color : "transparent",
                    color: active ? t.color : "#666",
                    backgroundColor: active ? t.color + "08" : "transparent",
                  }}>
                  <Icon size={14} />{t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "mpr"       && <TabMpr      vars={vars} setVars={wrappedSetVars} />}
            {activeTab === "cee"       && <TabCee      vars={vars} setVars={wrappedSetVars} />}
            {activeTab === "ecoptz"    && <TabEcoPtz   vars={vars} setVars={wrappedSetVars} />}
            {activeTab === "revenus"   && <TabRevenus  vars={vars} setVars={wrappedSetVars} />}
            {activeTab === "dpe"       && <TabDpe      vars={vars} setVars={wrappedSetVars} />}
            {activeTab === "reglement" && <TabReglement vars={vars} setVars={wrappedSetVars} />}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Les modifications sont appliquées immédiatement dans les simulateurs · Données 2025–2026
        </p>
      </div>
    </AppLayout>
  );
}
