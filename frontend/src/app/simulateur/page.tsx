"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Check, ArrowRight,
  Home, Building2, Building, Briefcase,
  Flame, Zap, Droplets, Leaf, Thermometer, Wind,
  Layers, Square, Maximize2, DoorOpen, Snowflake,
  FileText, Info, AlertTriangle, Search, ExternalLink,
  BarChart3, CreditCard, Wrench, TrendingUp, X,
} from "lucide-react";
import {
  loadRules, getDisabledWorks,
  EnergyKey, BuildingKey, WorkKey,
} from "@/lib/compatRules";
import {
  loadAdminVars, calcAidesFromVars,
  WORK_LABELS, DEFAULT_VARS, type AdminVars,
} from "@/lib/adminVars";

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES & DATA
// ═══════════════════════════════════════════════════════════════════════════════

type BuildingType = BuildingKey | null;
type EnergyType   = EnergyKey | null;
type OwnerType    = "proprietaire" | "locataire" | null;
type YearRange    = "avant_1948" | "1948_1974" | "1975_1989" | "1990_1999" | "2000_2012" | "apres_2012" | null;
type IncomeLevel  = "tres_modeste" | "modeste" | "intermediaire" | "aise" | null;

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "dpe",       label: "Mon DPE",       icon: BarChart3,    color: `var(--brand-500)`, bg: `var(--brand-50)`, desc: "Estimez votre classe énergétique et les travaux prioritaires" },
  { id: "aides",     label: "Mes Aides",     icon: TrendingUp,   color: "#000091", bg: "#e8eeff", desc: "Calculez vos primes MPR, CEE et Éco-PTZ en quelques clics" },
  { id: "ecoptz",    label: "Éco-PTZ",       icon: CreditCard,   color: "#7C3AED", bg: "#f3e8ff", desc: "Simulez votre prêt à taux zéro et vos mensualités" },
  { id: "renovation",label: "Rénovation",    icon: Wrench,       color: "#D97706", bg: "#fffbeb", desc: "Globale ou partielle — trouvez la bonne stratégie" },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Hook : variables admin ────────────────────────────────────────────────────

function useAdminVars(): AdminVars {
  const [vars, setVars] = useState<AdminVars>(DEFAULT_VARS);
  useEffect(() => { setVars(loadAdminVars()); }, []);
  return vars;
}

// ─── DPE helpers ───────────────────────────────────────────────────────────────

const DPE_COLORS: Record<string, string> = {
  A: "#00a84f", B: "#52b748", C: "#c8d200", D: "#f7e400", E: "#f0a500", F: "#e8500a", G: "#cc0000",
};

function estimateDpe(energy: EnergyType, year: YearRange, vars: AdminVars): string {
  if (!energy || !year) return "?";
  return (vars.dpeMatrix[energy as keyof typeof vars.dpeMatrix] as Record<string, string>)?.[year] ?? "D";
}

function fmt(n: number) { return n.toLocaleString("fr-FR"); }

// ─── DPE search (ADEME) ────────────────────────────────────────────────────────

interface DpeRecord {
  numero_dpe: string; adresse_ban: string;
  etiquette_dpe: string; date_etablissement_dpe: string;
}

async function searchDpeByAddress(address: string): Promise<DpeRecord[]> {
  try {
    const url = `https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q=${encodeURIComponent(address)}&size=5&select=numero_dpe,adresse_ban,etiquette_dpe,date_etablissement_dpe`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.results ?? [];
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function SelectCard({ selected, onClick, icon: Icon, label, sub, color = `var(--brand-500)` }: {
  selected: boolean; onClick: () => void;
  icon?: React.ElementType; label: string; sub?: string; color?: string;
}) {
  return (
    <button onClick={onClick} type="button"
      className="relative flex flex-col items-center gap-2 p-4 rounded-md border-2 text-center transition-all w-full hover:shadow-sm"
      style={{ borderColor: selected ? color : "#e0e0e0", backgroundColor: selected ? color + "12" : "#fff" }}>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
      {Icon && <Icon size={24} style={{ color: selected ? color : "#999" }} />}
      <p className="text-sm font-semibold" style={{ color: selected ? color : "#1e1e1e" }}>{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </button>
  );
}

function CheckCard({ selected, onClick, icon: Icon, label, sub, badges, color = `var(--brand-500)`, disabled, disabledReason }: {
  selected: boolean; onClick: () => void;
  icon?: React.ElementType; label: string; sub?: string;
  badges?: { label: string; color: string }[];
  color?: string; disabled?: boolean; disabledReason?: string;
}) {
  if (disabled) {
    return (
      <div title={disabledReason}
        className="relative flex flex-col items-start gap-2 p-4 rounded-md border-2 text-left opacity-40 cursor-not-allowed"
        style={{ borderColor: "#e0e0e0", backgroundColor: "#f9fafb" }}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-gray-300" />}
          <p className="text-sm font-semibold text-gray-400 line-through">{label}</p>
        </div>
        {disabledReason && <p className="text-xs text-gray-400">{disabledReason}</p>}
      </div>
    );
  }
  return (
    <button onClick={onClick} type="button"
      className="relative flex flex-col items-start gap-2 p-4 rounded-md border-2 text-left transition-all w-full hover:shadow-sm"
      style={{ borderColor: selected ? color : "#e0e0e0", backgroundColor: selected ? color + "12" : "#fff" }}>
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} style={{ color: selected ? color : "#999" }} />}
        <p className="text-sm font-semibold" style={{ color: selected ? color : "#1e1e1e" }}>{label}</p>
      </div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
      {badges && (
        <div className="flex flex-wrap gap-1 mt-1">
          {badges.map(b => <span key={b.label} className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: b.color }}>{b.label}</span>)}
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — MON DPE (5-step wizard)
// ═══════════════════════════════════════════════════════════════════════════════

const STEP_LABELS = ["Logement", "Énergie", "Travaux", "Situation", "Résultats"];

interface DpeData {
  buildingType: BuildingType; postalCode: string; surface: string; yearRange: YearRange;
  energyType: EnergyType; ownerType: OwnerType; works: Set<WorkKey>; incomeLevel: IncomeLevel;
  officialDpeRef: string;
}

function TabDpe() {
  const vars = useAdminVars();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DpeData>({
    buildingType: null, postalCode: "", surface: "", yearRange: null,
    energyType: null, ownerType: null, works: new Set(), incomeLevel: null, officialDpeRef: "",
  });
  const [disabledWorks, setDisabledWorks] = useState<Map<WorkKey, string>>(new Map());
  const [dpeSearch, setDpeSearch] = useState("");
  const [dpeResults, setDpeResults] = useState<DpeRecord[]>([]);
  const [dpeLoading, setDpeLoading] = useState(false);
  const [dpeDone, setDpeDone] = useState(false);

  useEffect(() => {
    const rules = loadRules();
    const nd = getDisabledWorks(rules, data.energyType, data.buildingType);
    setDisabledWorks(nd);
    if (data.works.size > 0) {
      const removed = [...data.works].filter(w => nd.has(w));
      if (removed.length > 0) setData(d => {
        const next = new Set(d.works); removed.forEach(w => next.delete(w));
        return { ...d, works: next };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.energyType, data.buildingType]);

  const currentDpe = estimateDpe(data.energyType, data.yearRange, vars);
  const aideResult = calcAidesFromVars(data.works, data.incomeLevel, data.surface, vars);
  const isValid = [
    () => !!data.buildingType && /^\d{5}$/.test(data.postalCode) && !!data.surface && !!data.yearRange,
    () => !!data.energyType && !!data.ownerType,
    () => data.works.size > 0,
    () => !!data.incomeLevel,
    () => true,
  ][step]?.() ?? false;

  async function searchDpe() {
    if (!dpeSearch.trim()) return;
    setDpeLoading(true); setDpeDone(false);
    const r = await searchDpeByAddress(dpeSearch);
    setDpeResults(r); setDpeLoading(false); setDpeDone(true);
  }

  const C = `var(--brand-500)`;
  const WORKS_LIST = [
    { key: "ite" as WorkKey,       label: WORK_LABELS.ite,       sub: `jusqu'à ${fmt(vars.mprBase.ite)} € MPR`,       icon: Maximize2, badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }, { label: "Éco-PTZ", color: "#7C3AED" }] },
    { key: "combles" as WorkKey,   label: WORK_LABELS.combles,   sub: `jusqu'à ${fmt(vars.mprBase.combles)} € MPR`,   icon: Layers,    badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }] },
    { key: "planchers" as WorkKey, label: WORK_LABELS.planchers, sub: `jusqu'à ${fmt(vars.mprBase.planchers)} € MPR`, icon: Square,    badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }] },
    { key: "fenetres" as WorkKey,  label: WORK_LABELS.fenetres,  sub: `jusqu'à ${fmt(vars.mprBase.fenetres)} € MPR`,  icon: DoorOpen,  badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }] },
    { key: "pac" as WorkKey,       label: WORK_LABELS.pac,       sub: `jusqu'à ${fmt(vars.mprBase.pac)} € MPR`,       icon: Snowflake, badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }, { label: "Coup de pouce", color: "#e8500a" }] },
    { key: "chaudiere" as WorkKey, label: WORK_LABELS.chaudiere, sub: `jusqu'à ${fmt(vars.mprBase.chaudiere)} € MPR`, icon: Flame,     badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }] },
    { key: "vmc" as WorkKey,       label: WORK_LABELS.vmc,       sub: `jusqu'à ${fmt(vars.mprBase.vmc)} € MPR`,       icon: Wind,      badges: [{ label: "MPR", color: C }, { label: "CEE", color: "#000091" }] },
    { key: "cet" as WorkKey,       label: WORK_LABELS.cet,       sub: `jusqu'à ${fmt(vars.mprBase.cet)} € MPR`,       icon: Zap,       badges: [{ label: "MPR", color: C }] },
  ];

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  borderColor: i < step ? C : i === step ? C : "#e0e0e0",
                  backgroundColor: i < step ? C : i === step ? "#fff" : "#fff",
                  color: i < step ? "#fff" : i === step ? C : "#aaa",
                }}>
                {i < step ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <p className="text-[10px] mt-1 text-center font-medium hidden sm:block" style={{ color: i <= step ? C : "#aaa" }}>{l}</p>
            </div>
          ))}
        </div>
        <div className="relative h-1 rounded-full mx-4" style={{ backgroundColor: "#e0e0e0" }}>
          <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500" style={{ backgroundColor: C, width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Step 0 — Logement */}
      {step === 0 && (
        <div className="space-y-6">
          <div><h2 className="text-xl font-bold text-gray-900">Votre logement</h2><p className="text-sm text-gray-500">À partir de vos informations, estimez votre DPE et vos aides éligibles.</p></div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ key: "maison", label: "Maison", sub: "individuelle", icon: Home }, { key: "appartement", label: "Appartement", sub: "copropriété", icon: Building2 }, { key: "immeuble", label: "Immeuble", sub: "collectif", icon: Building }, { key: "tertiaire", label: "Tertiaire", sub: "bureaux/ERP", icon: Briefcase }].map(t => (
                <SelectCard key={t.key} selected={data.buildingType === t.key} onClick={() => setData(d => ({ ...d, buildingType: t.key as BuildingType }))} icon={t.icon} label={t.label} sub={t.sub} color={C} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code postal <span className="text-red-500">*</span></label>
              <input type="text" maxLength={5} placeholder="75001" value={data.postalCode}
                onChange={e => setData(d => ({ ...d, postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Surface chauffée (m²) <span className="text-red-500">*</span></label>
              <input type="number" min="10" max="5000" placeholder="85" value={data.surface}
                onChange={e => setData(d => ({ ...d, surface: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Année de construction <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[{ key: "avant_1948", label: "Avant 1948", sub: "Vieille pierre" }, { key: "1948_1974", label: "1948 – 1974", sub: "Sans isolation" }, { key: "1975_1989", label: "1975 – 1989", sub: "Pré-RT 1988" }, { key: "1990_1999", label: "1990 – 1999", sub: "RT 1988" }, { key: "2000_2012", label: "2000 – 2012", sub: "RT 2005" }, { key: "apres_2012", label: "Après 2012", sub: "RT 2012/RE2020" }].map(y => (
                <SelectCard key={y.key} selected={data.yearRange === y.key} onClick={() => setData(d => ({ ...d, yearRange: y.key as YearRange }))} label={y.label} sub={y.sub} color={C} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Énergie */}
      {step === 1 && (
        <div className="space-y-6">
          <div><h2 className="text-xl font-bold text-gray-900">Votre énergie actuelle</h2><p className="text-sm text-gray-500">L'énergie principale de chauffage influence directement votre classe DPE.</p></div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Énergie principale <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[{ key: "gaz", label: "Gaz naturel", icon: Flame }, { key: "electricite", label: "Électricité", icon: Zap }, { key: "fioul", label: "Fioul domestique", icon: Droplets }, { key: "bois", label: "Bois / Granulés", icon: Leaf }, { key: "reseau", label: "Réseau de chaleur", icon: Thermometer }, { key: "autre", label: "Autre", icon: Wind }].map(e => (
                <SelectCard key={e.key} selected={data.energyType === e.key} onClick={() => setData(d => ({ ...d, energyType: e.key as EnergyType }))} icon={e.icon} label={e.label} color={C} />
              ))}
            </div>
          </div>
          {data.energyType && data.yearRange && (
            <div className="flex items-center gap-3 p-4 rounded-md border" style={{ backgroundColor: "#f0faf4", borderColor: `var(--brand-100)` }}>
              <Info size={15} style={{ color: C, flexShrink: 0 }} />
              <p className="text-sm text-gray-700">DPE estimé : <strong>classe {currentDpe}</strong> — affiné dans les résultats.</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Statut d'occupation <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[{ key: "proprietaire", label: "Propriétaire", sub: "MPR & Éco-PTZ" }, { key: "locataire", label: "Locataire", sub: "CEE uniquement" }].map(o => (
                <SelectCard key={o.key} selected={data.ownerType === o.key} onClick={() => setData(d => ({ ...d, ownerType: o.key as OwnerType }))} label={o.label} sub={o.sub} color={C} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Travaux */}
      {step === 2 && (
        <div className="space-y-5">
          <div><h2 className="text-xl font-bold text-gray-900">Vos travaux envisagés</h2><p className="text-sm text-gray-500">Sélectionnez un ou plusieurs gestes — les aides sont calculées pour chacun.</p></div>
          {disabledWorks.size > 0 && (
            <div className="flex items-start gap-2 p-3 rounded text-xs" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
              <AlertTriangle size={13} style={{ color: "#d97706", flexShrink: 0 }} className="mt-0.5" />
              <span className="text-gray-700"><strong>{disabledWorks.size} geste{disabledWorks.size > 1 ? "s" : ""}</strong> masqué{disabledWorks.size > 1 ? "s" : ""} car incompatible{disabledWorks.size > 1 ? "s" : ""} avec votre configuration.</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKS_LIST.map(w => {
              const reason = disabledWorks.get(w.key);
              return <CheckCard key={w.key} selected={data.works.has(w.key)}
                onClick={() => { if (!reason) setData(d => { const n = new Set(d.works); n.has(w.key) ? n.delete(w.key) : n.add(w.key); return { ...d, works: n }; }); }}
                icon={w.icon} label={w.label} sub={w.sub} badges={[...w.badges]} color={C}
                disabled={!!reason} disabledReason={reason} />;
            })}
          </div>
          {data.works.size > 0 && <p className="text-sm font-medium" style={{ color: C }}><Check size={14} className="inline mr-1" />{data.works.size} geste{data.works.size > 1 ? "s" : ""} sélectionné{data.works.size > 1 ? "s" : ""}</p>}
        </div>
      )}

      {/* Step 3 — Situation */}
      {step === 3 && (
        <div className="space-y-6">
          <div><h2 className="text-xl font-bold text-gray-900">Votre situation fiscale</h2><p className="text-sm text-gray-500">Le montant MPR dépend de vos revenus fiscaux de référence.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "tres_modeste",  label: "Très modeste",   sub: `≤ ${fmt(vars.anahThresholds.idf.tres_modeste)} € (IdF) · ≤ ${fmt(vars.anahThresholds.province.tres_modeste)} € (prov.)`,     pct: `jusqu'à ${Math.round(vars.incomeFactors.tres_modeste * 100)} %`,  color: `var(--brand-500)` },
              { key: "modeste",       label: "Modeste",        sub: `≤ ${fmt(vars.anahThresholds.idf.modeste)} € (IdF) · ≤ ${fmt(vars.anahThresholds.province.modeste)} € (prov.)`,                pct: `jusqu'à ${Math.round(vars.incomeFactors.modeste * 100)} %`,       color: "#3b82f6" },
              { key: "intermediaire", label: "Intermédiaire",  sub: `≤ ${fmt(vars.anahThresholds.idf.intermediaire)} € (IdF) · ≤ ${fmt(vars.anahThresholds.province.intermediaire)} € (prov.)`,  pct: `jusqu'à ${Math.round(vars.incomeFactors.intermediaire * 100)} %`, color: "#f59e0b" },
              { key: "aise",          label: "Aisé",           sub: "Au-dessus des plafonds intermédiaires",                                                                                       pct: `jusqu'à ${Math.round(vars.incomeFactors.aise * 100)} %`,          color: "#ef4444" },
            ].map(i => (
              <button key={i.key} type="button" onClick={() => setData(d => ({ ...d, incomeLevel: i.key as IncomeLevel }))}
                className="relative flex flex-col items-start gap-1.5 p-5 rounded-md border-2 text-left transition-all"
                style={{ borderColor: data.incomeLevel === i.key ? i.color : "#e0e0e0", backgroundColor: data.incomeLevel === i.key ? i.color + "10" : "#fff" }}>
                {data.incomeLevel === i.key && <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: i.color }}><Check size={11} className="text-white" strokeWidth={3} /></div>}
                <p className="font-bold text-sm text-gray-900">{i.label}</p>
                <p className="text-xs text-gray-500">{i.sub}</p>
                <p className="text-xs font-bold mt-1" style={{ color: i.color }}>{i.pct} des travaux</p>
              </button>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 rounded text-sm" style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
            <Info size={14} style={{ color: "#000091", flexShrink: 0 }} className="mt-0.5" />
            <p className="text-xs text-gray-700">Plafonds indicatifs 2025 pour 2 personnes. <a href="https://www.anah.gouv.fr/" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#000091" }}>Vérifiez sur anah.gouv.fr →</a></p>
          </div>
        </div>
      )}

      {/* Step 4 — Résultats */}
      {step === 4 && (
        <div className="space-y-5">
          <div><h2 className="text-xl font-bold text-gray-900">Vos résultats</h2><p className="text-xs text-gray-400">Estimation indicative · non contractuelle · données 2025–2026</p></div>

          {/* Disclaimer réglementaire */}
          <div className="flex items-start gap-3 p-4 rounded text-sm" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle size={14} style={{ color: "#d97706", flexShrink: 0 }} className="mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-xs mb-0.5">Estimation indicative — non réglementaire</p>
              <p className="text-xs text-gray-600">Le DPE officiel ne peut être établi que par un <strong>diagnostiqueur certifié</strong> (accréditation COFRAC). <a href="https://france-renov.gouv.fr/diagnostiqueurs" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#d97706" }}>Trouver un diagnostiqueur →</a></p>
            </div>
          </div>

          {/* DPE */}
          <div className="bg-white border border-gray-200 rounded-md p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Estimation DPE indicative</p>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-md flex items-center justify-center text-3xl font-bold text-white flex-shrink-0" style={{ backgroundColor: DPE_COLORS[currentDpe] ?? "#999" }}>{currentDpe}</div>
              <div>
                <p className="font-bold text-gray-900">Classe {currentDpe}</p>
                <p className="text-sm text-gray-500">{currentDpe === "G" ? "Passoire thermique — travaux urgents" : currentDpe === "F" ? "Très énergivore — passoire thermique (interdit loc. 2028)" : currentDpe === "E" ? "Énergivore — travaux conseillés" : currentDpe === "D" ? "Performance moyenne — améliorations recommandées" : currentDpe === "C" ? "Correct — quelques optimisations" : "Performant — peu de travaux nécessaires"}</p>
                {(currentDpe === "F" || currentDpe === "G") && <p className="text-xs font-semibold mt-1" style={{ color: "#cc0000" }}>⚠ Obligation de rénovation pour la location</p>}
              </div>
            </div>
          </div>

          {/* Aides */}
          {aideResult.rows.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100"><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Aides estimées par geste</p></div>
              <div className="divide-y divide-gray-50">
                {aideResult.rows.map(r => (
                  <div key={r.label} className="px-5 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700">{r.label}</p>
                    <div className="flex gap-4 text-right flex-shrink-0">
                      <div><p className="text-[10px] text-gray-400">MPR</p><p className="font-bold text-sm" style={{ color: C }}>{fmt(r.mpr)} €</p></div>
                      <div><p className="text-[10px] text-gray-400">CEE</p><p className="font-bold text-sm" style={{ color: "#000091" }}>{fmt(r.cee)} €</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-4 border-t-2 border-gray-100" style={{ backgroundColor: "#f9fafb" }}>
                <div><p className="text-xs text-gray-400 mb-0.5">Total MPR</p><p className="text-2xl font-bold" style={{ color: C }}>{fmt(aideResult.totalMpr)} €</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Total CEE</p><p className="text-2xl font-bold" style={{ color: "#000091" }}>{fmt(aideResult.totalCee)} €</p></div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="rounded-md p-5 text-center" style={{ backgroundColor: `var(--brand-50)`, border: "2px solid #18753c" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C }}>Total aides estimées</p>
            <p className="text-4xl font-bold mb-1" style={{ color: C }}>{fmt(aideResult.totalAides)} €</p>
            {aideResult.ecoptzElig && <p className="text-sm text-gray-600">+ Éco-PTZ jusqu'à <strong>{fmt(vars.ecoptzCaps.bbc_renovation)} €</strong> à taux zéro</p>}
            <p className="text-xs text-gray-400 mt-1">TVA réduite {vars.tvaTaux} % applicable</p>
          </div>

          {/* Recherche DPE ADEME */}
          <div className="bg-white border border-gray-200 rounded-md p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Retrouver votre DPE officiel (base ADEME)</p>
            <p className="text-xs text-gray-500 mb-3">Si un DPE a déjà été réalisé, recherchez-le dans la base nationale.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="Ex : 12 rue de la Paix, Paris 75001" value={dpeSearch}
                onChange={e => setDpeSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && searchDpe()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
              <button onClick={searchDpe} disabled={dpeLoading}
                className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: C }}>
                <Search size={14} />{dpeLoading ? "..." : "Rechercher"}
              </button>
            </div>
            {dpeDone && (
              <div className="mt-3 space-y-2">
                {dpeResults.length === 0
                  ? <p className="text-xs text-gray-400">Aucun DPE trouvé pour cette adresse.</p>
                  : dpeResults.map(r => (
                    <div key={r.numero_dpe} onClick={() => setData(d => ({ ...d, officialDpeRef: r.numero_dpe }))}
                      className="flex items-center justify-between p-3 rounded border cursor-pointer transition-colors"
                      style={{ borderColor: data.officialDpeRef === r.numero_dpe ? C : "#e0e0e0", backgroundColor: data.officialDpeRef === r.numero_dpe ? `var(--brand-50)` : "#f9fafb" }}>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{r.adresse_ban}</p>
                        <p className="text-[10px] text-gray-400">N° {r.numero_dpe} · {new Date(r.date_etablissement_dpe).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <span className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: DPE_COLORS[r.etiquette_dpe] ?? "#999" }}>{r.etiquette_dpe}</span>
                    </div>
                  ))
                }
                <a href="https://observatoire-dpe.fr/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs" style={{ color: C }}><ExternalLink size={11} />Observatoire DPE complet</a>
              </div>
            )}
          </div>

          {/* CTA pro */}
          <div className="bg-white border border-gray-200 rounded-md p-6 text-center">
            <FileText size={26} style={{ color: C }} className="mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Obtenez votre étude complète</h3>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">Rapport PDF professionnel avec DPE calculé, plans de rénovation et montages financiers.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-sm text-white" style={{ backgroundColor: C }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = C)}>Créer mon compte professionnel <ArrowRight size={14} /></Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Accéder à mon espace</Link>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"><ChevronLeft size={15} />Retour</button>
          : <span />
        }
        {step < 4 && (
          <button onClick={() => { if (isValid) setStep(s => s + 1); }} disabled={!isValid}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: isValid ? C : "#999" }}
            onMouseEnter={e => { if (isValid) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-600)`; }}
            onMouseLeave={e => { if (isValid) (e.currentTarget as HTMLElement).style.backgroundColor = C; }}>
            Continuer <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — MES AIDES (calculateur rapide)
// ═══════════════════════════════════════════════════════════════════════════════

function TabAides() {
  const vars = useAdminVars();
  const C = "#000091";
  const [income, setIncome]     = useState<IncomeLevel>(null);
  const [surface, setSurface]   = useState("");
  const [works, setWorks]       = useState<Set<WorkKey>>(new Set());
  const [energy, setEnergy]     = useState<EnergyType>(null);
  const [building, setBuilding] = useState<BuildingType>(null);
  const [disabledWorks, setDisabledWorks] = useState<Map<WorkKey, string>>(new Map());

  useEffect(() => {
    const rules = loadRules();
    const nd = getDisabledWorks(rules, energy, building);
    setDisabledWorks(nd);
    if (works.size > 0) {
      const removed = [...works].filter(w => nd.has(w));
      if (removed.length > 0) setWorks(prev => { const n = new Set(prev); removed.forEach(w => n.delete(w)); return n; });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energy, building]);

  const result = calcAidesFromVars(works, income, surface, vars);
  const canCompute = works.size > 0 && !!income && !!surface;

  return (
    <div className="space-y-7">
      <div><h2 className="text-xl font-bold text-gray-900">Calculateur d'aides</h2><p className="text-sm text-gray-500">Sélectionnez vos gestes et votre profil pour obtenir une estimation de vos primes en quelques secondes.</p></div>

      {/* Grille 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche — paramètres */}
        <div className="space-y-5">
          {/* Type bâtiment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: "maison", label: "Maison", icon: Home }, { key: "appartement", label: "Appartement", icon: Building2 }, { key: "immeuble", label: "Immeuble", icon: Building }, { key: "tertiaire", label: "Tertiaire", icon: Briefcase }].map(t => (
                <button key={t.key} type="button" onClick={() => setBuilding(b => b === t.key ? null : t.key as BuildingType)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded border-2 text-sm font-medium transition-all"
                  style={{ borderColor: building === t.key ? C : "#e0e0e0", backgroundColor: building === t.key ? C + "10" : "#fff", color: building === t.key ? C : "#555" }}>
                  <t.icon size={15} />{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Énergie */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Énergie de chauffage</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: "gaz", label: "Gaz", icon: Flame }, { key: "electricite", label: "Électricité", icon: Zap }, { key: "fioul", label: "Fioul", icon: Droplets }, { key: "bois", label: "Bois", icon: Leaf }, { key: "reseau", label: "Réseau", icon: Thermometer }, { key: "autre", label: "Autre", icon: Wind }].map(e => (
                <button key={e.key} type="button" onClick={() => setEnergy(v => v === e.key ? null : e.key as EnergyType)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded border-2 text-sm font-medium transition-all"
                  style={{ borderColor: energy === e.key ? C : "#e0e0e0", backgroundColor: energy === e.key ? C + "10" : "#fff", color: energy === e.key ? C : "#555" }}>
                  <e.icon size={15} />{e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surface */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Surface chauffée (m²) <span className="text-red-500">*</span></label>
            <input type="number" min="10" max="5000" placeholder="85" value={surface}
              onChange={e => setSurface(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-700" />
          </div>

          {/* Revenu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profil de revenus <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {[
                { key: "tres_modeste",  label: "Très modeste",  pct: `${Math.round(vars.incomeFactors.tres_modeste * 100)} %`,  color: `var(--brand-500)` },
                { key: "modeste",       label: "Modeste",       pct: `${Math.round(vars.incomeFactors.modeste * 100)} %`,       color: "#3b82f6" },
                { key: "intermediaire", label: "Intermédiaire", pct: `${Math.round(vars.incomeFactors.intermediaire * 100)} %`, color: "#f59e0b" },
                { key: "aise",          label: "Aisé",          pct: `${Math.round(vars.incomeFactors.aise * 100)} %`,          color: "#ef4444" },
              ].map(i => (
                <button key={i.key} type="button" onClick={() => setIncome(income === i.key ? null : i.key as IncomeLevel)}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded border-2 text-sm font-medium transition-all"
                  style={{ borderColor: income === i.key ? i.color : "#e0e0e0", backgroundColor: income === i.key ? i.color + "10" : "#fff" }}>
                  <span style={{ color: income === i.key ? i.color : "#555" }}>{i.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: i.color + "20", color: i.color }}>MPR {i.pct}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite — gestes + résultats */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gestes de travaux <span className="text-red-500">*</span></label>
            {disabledWorks.size > 0 && (
              <div className="flex items-center gap-2 p-2 rounded text-xs mb-2" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                <AlertTriangle size={12} style={{ color: "#d97706" }} />
                <span className="text-gray-600">{disabledWorks.size} geste{disabledWorks.size > 1 ? "s" : ""} masqué{disabledWorks.size > 1 ? "s" : ""} (incompatibles)</span>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(WORK_LABELS) as WorkKey[]).map(w => {
                const label  = WORK_LABELS[w];
                const baseMpr = vars.mprBase[w] ?? 0;
                const reason = disabledWorks.get(w);
                const sel = works.has(w);
                if (reason) return (
                  <div key={w} className="flex items-center justify-between px-3 py-2 rounded border text-sm opacity-40 cursor-not-allowed" style={{ borderColor: "#e0e0e0", backgroundColor: "#f9fafb" }} title={reason}>
                    <span className="text-gray-400 line-through">{label}</span>
                    <span className="text-xs text-gray-300">incompatible</span>
                  </div>
                );
                return (
                  <button key={w} type="button" onClick={() => setWorks(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n; })}
                    className="flex items-center justify-between px-3 py-2.5 rounded border-2 text-sm font-medium transition-all"
                    style={{ borderColor: sel ? C : "#e0e0e0", backgroundColor: sel ? C + "08" : "#fff" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors" style={{ borderColor: sel ? C : "#ccc", backgroundColor: sel ? C : "#fff" }}>
                        {sel && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span style={{ color: sel ? C : "#555" }}>{label}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: `var(--brand-500)` }}>MPR {fmt(baseMpr)} €</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats en temps réel */}
          {canCompute ? (
            <div className="rounded-md p-5 space-y-3" style={{ backgroundColor: "#e8eeff", border: "2px solid #000091" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C }}>Résultat estimé</p>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 mb-0.5">MaPrimeRénov'</p><p className="text-2xl font-bold" style={{ color: C }}>{fmt(result.totalMpr)} €</p></div>
                <div><p className="text-xs text-gray-500 mb-0.5">Prime CEE</p><p className="text-2xl font-bold text-gray-700">{fmt(result.totalCee)} €</p></div>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-500 mb-0.5">Total aides</p>
                <p className="text-3xl font-bold" style={{ color: C }}>{fmt(result.totalAides)} €</p>
                {result.ecoptzElig && <p className="text-xs text-gray-600 mt-1">+ Éco-PTZ jusqu'à <strong>{fmt(vars.ecoptzCaps.bbc_renovation)} €</strong></p>}
              </div>
              <p className="text-[10px] text-gray-400">TVA réduite {vars.tvaTaux} % applicable · Résultat indicatif</p>
            </div>
          ) : (
            <div className="rounded-md p-5 text-center border-2 border-dashed" style={{ borderColor: "#c5d0f5" }}>
              <p className="text-sm text-gray-400">Sélectionnez au moins un geste, votre surface et votre profil pour voir le résultat.</p>
            </div>
          )}

          <Link href="/aides" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Voir toutes les aides en détail <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — ÉCO-PTZ (calculateur mensualité)
// ═══════════════════════════════════════════════════════════════════════════════

function TabEcoPtz() {
  const vars = useAdminVars();
  const C = "#7C3AED";
  const [montant, setMontant] = useState("");
  const [duree, setDuree]     = useState("");

  const maxMontant = vars.ecoptzCaps.bbc_renovation;
  const minDuree   = vars.ecoptzDureeMin;
  const maxDuree   = vars.ecoptzDureeMax;

  const m = Math.max(1000, Math.min(maxMontant, Number(montant) || 0));
  const d = Math.max(minDuree, Math.min(maxDuree, Number(duree) || 0));
  const mensualite = (montant && duree && m && d) ? (m / d).toFixed(2) : null;

  const errMontant = montant && (Number(montant) < 1000 || Number(montant) > maxMontant);
  const errDuree   = duree && (Number(duree) < minDuree || Number(duree) > maxDuree);

  const ecoptzCaps = [
    { label: "1 action isolante",   max: vars.ecoptzCaps.action_isolante,   works: "Isolation murs, toiture ou planchers" },
    { label: "Bouquet de 2 actions", max: vars.ecoptzCaps.bouquet_2_actions, works: "Isolation + chauffage, ou 2 isolations" },
    { label: "Bouquet de 3+ actions", max: vars.ecoptzCaps.bouquet_3_actions, works: "Isolation + chauffage + VMC ou plus" },
    { label: "Rénovation BBC",       max: vars.ecoptzCaps.bbc_renovation,    works: "Rénovation globale avec 2 sauts DPE" },
    { label: "Solde après MPR",      max: vars.ecoptzCaps.solde_post_mpr,    works: "Complément financement post-MaPrimeRénov'" },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Simulateur Éco-PTZ</h2>
        <p className="text-sm text-gray-500">Prêt à taux zéro pour financer vos travaux de rénovation énergétique.</p>
      </div>

      {/* Calculateur */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-md p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Montant emprunté (€)</label>
              <input type="number" placeholder="20000" value={montant} onChange={e => setMontant(e.target.value)}
                className="w-full px-3 py-3 border rounded text-lg font-semibold text-center focus:outline-none focus:ring-2"
                style={{ borderColor: errMontant ? "#dc2626" : "#e0e0e0", color: C }} />
              {errMontant
                ? <p className="text-xs text-red-600 mt-1">Entre 1 000 € et {fmt(maxMontant)} €</p>
                : <p className="text-xs text-gray-400 mt-1">Entre 1 000 € et {fmt(maxMontant)} €</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Durée de remboursement (mois)</label>
              <input type="number" placeholder="120" value={duree} onChange={e => setDuree(e.target.value)}
                className="w-full px-3 py-3 border rounded text-lg font-semibold text-center focus:outline-none focus:ring-2"
                style={{ borderColor: errDuree ? "#dc2626" : "#e0e0e0", color: C }} />
              {errDuree
                ? <p className="text-xs text-red-600 mt-1">Entre {minDuree} mois ({Math.round(minDuree/12)} ans) et {maxDuree} mois ({Math.round(maxDuree/12)} ans)</p>
                : <p className="text-xs text-gray-400 mt-1">Entre {minDuree} et {maxDuree} mois · soit {duree ? Math.round(Number(duree) / 12 * 10) / 10 : "?"} ans</p>}
            </div>
          </div>

          {/* Résultat */}
          {mensualite && !errMontant && !errDuree ? (
            <div className="rounded-md p-6 text-center space-y-4" style={{ backgroundColor: "#f3e8ff", border: "2px solid #7C3AED" }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: C }}>Votre mensualité</p>
                <p className="text-5xl font-bold mb-0.5" style={{ color: C }}>{mensualite} €</p>
                <p className="text-sm text-gray-500">par mois pendant {duree} mois</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-purple-200 text-center">
                <div><p className="text-xs text-gray-500">TAEG</p><p className="font-bold text-lg text-gray-900">0 %</p></div>
                <div><p className="text-xs text-gray-500">Coût total</p><p className="font-bold text-lg text-gray-900">0 €</p></div>
                <div><p className="text-xs text-gray-500">Total dû</p><p className="font-bold text-lg" style={{ color: C }}>{fmt(Number(montant))} €</p></div>
              </div>
              <p className="text-[10px] text-gray-400">Simulation non contractuelle · TAEG 0 % garanti · Sous réserve d'éligibilité bancaire</p>
            </div>
          ) : (
            <div className="rounded-md p-6 text-center border-2 border-dashed" style={{ borderColor: "#d8b4fe" }}>
              <p className="text-sm text-gray-400">Saisissez un montant et une durée valides pour voir le résultat.</p>
            </div>
          )}
        </div>

        {/* Tableau plafonds */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-sm">Plafonds par catégorie de travaux</p>
              <p className="text-xs text-gray-500 mt-0.5">Cliquez pour pré-remplir le simulateur</p>
            </div>
            <div className="divide-y divide-gray-50">
              {ecoptzCaps.map(cap => (
                <button key={cap.label} type="button"
                  onClick={() => setMontant(String(cap.max))}
                  className="w-full flex items-start justify-between gap-4 px-5 py-3 text-left hover:bg-gray-50 transition-colors group">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{cap.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cap.works}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: C }}>jusqu'à {fmt(cap.max)} €</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded text-sm" style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
            <Info size={14} style={{ color: "#000091", flexShrink: 0 }} className="mt-0.5" />
            <div className="text-xs text-gray-700 space-y-1">
              <p><strong>Conditions d'éligibilité :</strong> Propriétaire occupant, bailleur ou SCI — logement de plus de 2 ans.</p>
              <p>Travaux réalisés par un artisan <strong>RGE</strong> (Reconnu Garant de l'Environnement).</p>
              <p>Cumulable avec MaPrimeRénov' et les primes CEE.</p>
            </div>
          </div>

          <Link href="/aides#eco-ptz" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            En savoir plus sur l'Éco-PTZ <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — RÉNOVATION (globale vs partielle + quiz)
// ═══════════════════════════════════════════════════════════════════════════════

const QUIZ_QUESTIONS = [
  {
    id: "dpe", q: "Quelle est votre classe DPE actuelle ?",
    opts: [{ k: "fg", l: "F ou G (passoire thermique)" }, { k: "de", l: "D ou E (énergivore)" }, { k: "abc", l: "A, B ou C (correct ou bon)" }],
  },
  {
    id: "budget", q: "Quel est votre budget envisagé ?",
    opts: [{ k: "small", l: "< 10 000 €" }, { k: "mid", l: "10 000 – 30 000 €" }, { k: "big", l: "> 30 000 €" }],
  },
  {
    id: "objectif", q: "Quel est votre principal objectif ?",
    opts: [{ k: "loyer", l: "Louer ou vendre le bien" }, { k: "confort", l: "Améliorer le confort" }, { k: "facture", l: "Réduire la facture énergétique" }],
  },
];

type QuizAnswers = Record<string, string>;

function getRecommandation(a: QuizAnswers): { type: "globale" | "partielle" | "urgente"; title: string; desc: string; color: string; aids: string } {
  if (a.dpe === "fg") return { type: "urgente", title: "Rénovation globale urgente", color: "#cc0000", desc: "Votre logement est une passoire thermique. Une rénovation globale (≥ 2 sauts DPE) est obligatoire pour maintenir la location et indispensable pour valoriser le bien. Vous pouvez prétendre au Parcours accompagné MPR.", aids: "Jusqu'à 70 % du coût (ménage très modeste) + bonus BBC" };
  if (a.budget === "big" || a.objectif === "loyer") return { type: "globale", title: "Rénovation globale recommandée", color: `var(--brand-500)`, desc: "Votre profil est idéal pour une rénovation globale. Elle maximise les aides (MPR accompagné), améliore significativement le DPE et valorise durablement votre patrimoine.", aids: "MPR accompagné + bonus BBC jusqu'à 40 000 €" };
  return { type: "partielle", title: "Rénovation par gestes prioritaires", color: "#D97706", desc: "Une rénovation partielle bien ciblée est adaptée à votre situation. Commencez par l'isolation ou le remplacement du système de chauffage pour un maximum de retour sur investissement.", aids: "MPR par geste + CEE + Éco-PTZ (si plusieurs gestes)" };
}

function TabRenovation() {
  const C = "#D97706";
  const [answers, setAnswers]       = useState<QuizAnswers>({});
  const [showResult, setShowResult] = useState(false);
  const allAnswered = QUIZ_QUESTIONS.every(q => answers[q.id]);
  const reco = getRecommandation(answers);

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Rénovation globale ou partielle ?</h2>
        <p className="text-sm text-gray-500">Trouvez la stratégie adaptée à votre logement en 3 questions.</p>
      </div>

      {/* Tableau comparatif */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        <div className="grid grid-cols-3 text-sm font-semibold border-b border-gray-100">
          <div className="px-4 py-3 text-gray-500 text-xs uppercase tracking-wide">Critère</div>
          <div className="px-4 py-3 text-center" style={{ color: `var(--brand-500)`, backgroundColor: `var(--brand-50)` }}>Rénovation globale</div>
          <div className="px-4 py-3 text-center" style={{ color: C, backgroundColor: "#fffbeb" }}>Rénovation partielle</div>
        </div>
        {[
          ["Définition", "≥ 2 sauts de classe DPE — travaux coordonnés", "1 ou 2 gestes isolés"],
          ["Performance", "Amélioration majeure (ex. G→D ou mieux)", "Amélioration partielle, souvent faible"],
          ["Aides MPR", "Jusqu'à 70 % + bonus BBC + Mon Acc. Rénov'", "Jusqu'à 70 % par geste, sans bonus"],
          ["Audit", "Obligatoire (audit énergétique réglementaire)", "Non obligatoire"],
          ["Accompagnement", "Mon Accompagnateur Rénov' obligatoire", "Facultatif"],
          ["Coût moyen", "30 000 € à 80 000 €+", "3 000 € à 20 000 €"],
        ].map(([crit, glob, part]) => (
          <div key={crit} className="grid grid-cols-3 text-sm border-b border-gray-50 last:border-0">
            <div className="px-4 py-3 font-medium text-gray-700 text-xs">{crit}</div>
            <div className="px-4 py-3 text-xs text-gray-600 text-center" style={{ backgroundColor: "#f8fff9" }}>{glob}</div>
            <div className="px-4 py-3 text-xs text-gray-600 text-center" style={{ backgroundColor: "#fffdf5" }}>{part}</div>
          </div>
        ))}
      </div>

      {/* Quiz */}
      <div className="bg-white border border-gray-200 rounded-md p-6 space-y-5">
        <p className="font-bold text-gray-900 text-sm">Quel type de rénovation pour votre situation ?</p>
        {QUIZ_QUESTIONS.map(q => (
          <div key={q.id}>
            <p className="text-sm font-semibold text-gray-700 mb-2">{q.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {q.opts.map(o => {
                const sel = answers[q.id] === o.k;
                return (
                  <button key={o.k} type="button" onClick={() => { setAnswers(a => ({ ...a, [q.id]: o.k })); setShowResult(false); }}
                    className="px-3 py-2.5 rounded border-2 text-sm font-medium text-left transition-all"
                    style={{ borderColor: sel ? C : "#e0e0e0", backgroundColor: sel ? C + "10" : "#fff", color: sel ? C : "#555" }}>
                    {sel && <Check size={12} className="inline mr-1.5" />}{o.l}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {allAnswered && !showResult && (
          <button onClick={() => setShowResult(true)}
            className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm text-white transition-colors"
            style={{ backgroundColor: C }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#b45309")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = C)}>
            Voir ma recommandation <ArrowRight size={14} />
          </button>
        )}

        {showResult && (
          <div className="rounded-md p-5" style={{ backgroundColor: reco.color + "10", border: `2px solid ${reco.color}` }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: reco.color }}>
                <Check size={18} className="text-white" strokeWidth={3} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{reco.title}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: reco.color }}>{reco.aids}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">{reco.desc}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/simulateur?tab=dpe"
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white"
                style={{ backgroundColor: reco.color }}>
                Simuler mon DPE <ArrowRight size={13} />
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-white transition-colors">
                Créer mon dossier professionnel
              </Link>
            </div>
            <button onClick={() => { setAnswers({}); setShowResult(false); }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
              <X size={11} /> Recommencer le quiz
            </button>
          </div>
        )}
      </div>

      {/* Info Mon Acc. Rénov' */}
      <div className="flex items-start gap-3 p-4 rounded text-sm" style={{ backgroundColor: `var(--brand-50)`, border: "1px solid #c5e8d3" }}>
        <Info size={14} style={{ color: `var(--brand-500)`, flexShrink: 0 }} className="mt-0.5" />
        <div className="text-xs text-gray-700">
          <p><strong>Mon Accompagnateur Rénov' (MAR)</strong> est obligatoire pour le Parcours accompagné MPR. Il valide le projet, l'audit énergétique et coordonne les entreprises RGE.</p>
          <a href="https://france-renov.gouv.fr/aides/maprimerenov/parcours-accompagne" target="_blank" rel="noopener noreferrer" className="underline font-medium mt-1 block" style={{ color: `var(--brand-500)` }}>En savoir plus sur France Rénov' →</a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SimulateurPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dpe");

  // Lire ?tab= depuis l'URL au montage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabId | null;
    if (t && TABS.find(x => x.id === t)) setActiveTab(t);
  }, []);

  const tab = TABS.find(t => t.id === activeTab)!;

  return (
    <div style={{ fontFamily: "Outfit, system-ui, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "2px solid #18753c" }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ backgroundColor: `var(--brand-500)` }}>🌡️</div>
            <span className="font-bold">ThermoPilot <span style={{ color: `var(--brand-500)` }}>AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 hidden sm:block">Simulation gratuite · Sans inscription</p>
            <Link href="/login" className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Espace pro</Link>
          </div>
        </div>
      </header>

      {/* ── Tab bar ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {TABS.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                  style={{
                    borderBottomColor: active ? t.color : "transparent",
                    color: active ? t.color : "#666",
                    backgroundColor: active ? t.color + "08" : "transparent",
                  }}>
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab description strip ───────────────────────────────────── */}
      <div className="border-b border-gray-100" style={{ backgroundColor: tab.bg }}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <p className="text-xs font-medium" style={{ color: tab.color }}>{tab.desc}</p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 shadow-sm">
          {activeTab === "dpe"        && <TabDpe />}
          {activeTab === "aides"      && <TabAides />}
          {activeTab === "ecoptz"     && <TabEcoPtz />}
          {activeTab === "renovation" && <TabRenovation />}
        </div>

        {/* Footer disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Simulation indicative · Résultats non contractuels · Données 2025–2026 ·{" "}
          <a href="https://france-renov.gouv.fr/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">France Rénov'</a>
        </p>
      </div>
    </div>
  );
}
