"use client";
import { useEffect, useState, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { auditsApi, buildingsApi, scenariosApi } from "@/lib/api";
import { Audit, Building, RenovationScenario } from "@/types";
import { formatNumber, AUDIT_STATUS_LABELS } from "@/lib/utils";
import {
  Building2, ClipboardList, TrendingUp, Zap, Leaf, Plus, ArrowRight,
  Lock, CheckCircle2, Clock, AlertCircle, FileText, FolderOpen,
  LayoutGrid, X, RotateCcw, GripVertical, Euro, Maximize2,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

// ─── Widget catalogue ─────────────────────────────────────────────────────────

type WidgetId =
  | "kpi_buildings" | "kpi_audits" | "kpi_energy_cost" | "kpi_co2"
  | "kpi_surface" | "kpi_scenarios" | "kpi_savings" | "kpi_projects"
  | "pipeline" | "savings_banner" | "chart_dpe" | "chart_consumption"
  | "recent_audits" | "quick_actions";

interface WidgetMeta {
  id: WidgetId;
  label: string;
  desc: string;
  category: "KPI" | "Sections" | "Graphiques";
  default: boolean;
  icon: React.ElementType;
}

const WIDGET_CATALOGUE: WidgetMeta[] = [
  // KPI
  { id: "kpi_buildings",   label: "Bâtiments",               desc: "Nombre total de bâtiments",               category: "KPI",        default: true,  icon: Building2 },
  { id: "kpi_audits",      label: "Audits complétés",        desc: "Audits terminés / total",                 category: "KPI",        default: true,  icon: ClipboardList },
  { id: "kpi_energy_cost", label: "Coût énergétique",        desc: "Coût annuel cumulé en €",                 category: "KPI",        default: true,  icon: Zap },
  { id: "kpi_co2",         label: "CO₂ moyen",               desc: "kgCO₂/m²/an moyen",                      category: "KPI",        default: true,  icon: Leaf },
  { id: "kpi_surface",     label: "Surface totale",           desc: "m² chauffés dans le parc",               category: "KPI",        default: false, icon: Maximize2 },
  { id: "kpi_scenarios",   label: "Plans de rénovation",     desc: "Nombre de scénarios actifs",              category: "KPI",        default: false, icon: TrendingUp },
  { id: "kpi_savings",     label: "Économies potentielles",  desc: "kWh/an cumulés sur les scénarios",        category: "KPI",        default: false, icon: Euro },
  { id: "kpi_projects",    label: "Projets actifs",           desc: "Projets avec statut actif",              category: "KPI",        default: false, icon: FolderOpen },
  // Sections
  { id: "pipeline",        label: "Pipeline des missions",   desc: "Brouillon · En cours · Complété · Validé",category: "Sections",   default: true,  icon: LayoutGrid },
  { id: "savings_banner",  label: "Bandeau économies",       desc: "Total kWh/an économisés via plans",       category: "Sections",   default: true,  icon: TrendingUp },
  { id: "quick_actions",   label: "Actions rapides",          desc: "Boutons Bâtiment, Audit, Rapport",       category: "Sections",   default: true,  icon: Plus },
  // Graphiques
  { id: "chart_dpe",       label: "Graphique classes DPE",   desc: "Répartition A→G du parc audité",         category: "Graphiques", default: true,  icon: LayoutGrid },
  { id: "chart_consumption",label: "Consommations moyennes", desc: "Chauffage · ECS · Ventilation (kWh)",    category: "Graphiques", default: true,  icon: BarChart },
  { id: "recent_audits",   label: "Missions récentes",       desc: "5 derniers audits avec statut",           category: "Graphiques", default: true,  icon: ClipboardList },
];

const DEFAULT_WIDGETS = WIDGET_CATALOGUE.filter((w) => w.default).map((w) => w.id);
const LS_KEY = "dashboard_widgets_v2";

function loadPrefs(): WidgetId[] {
  if (typeof window === "undefined") return DEFAULT_WIDGETS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_WIDGETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as WidgetId[];
  } catch {}
  return DEFAULT_WIDGETS;
}

function savePrefs(ids: WidgetId[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

// ─── Couleurs DPE ─────────────────────────────────────────────────────────────
const LABEL_COLORS: Record<string, string> = {
  A: "#00a84f", B: "#52b748", C: "#c8d200", D: "#f7e400", E: "#f0a500", F: "#e8500a", G: "#cc0000",
};

const PIPELINE_STAGES = [
  { key: "draft",       label: "Brouillon", icon: AlertCircle,  color: "text-gray-400",   bg: "bg-gray-50",   border: "border-gray-200",  dot: "bg-gray-300"  },
  { key: "in_progress", label: "En cours",  icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200", dot: "bg-amber-400" },
  { key: "completed",   label: "Complété",  icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200", dot: "bg-green-500" },
  { key: "validated",   label: "Validé",    icon: Lock,         color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-500"  },
];

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none"
      style={{ backgroundColor: on ? `var(--brand-500)` : "#d1d5db" }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [audits, setAudits]       = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [scenarios, setScenarios] = useState<RenovationScenario[]>([]);
  const [projects, setProjects]   = useState<{ id: string; project_status: string }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [enabled, setEnabled]     = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [draft, setDraft]         = useState<WidgetId[]>([]);

  // Load prefs client-side
  useEffect(() => { setEnabled(loadPrefs()); }, []);

  useEffect(() => {
    Promise.all([
      auditsApi.list(),
      buildingsApi.listBuildings(),
      scenariosApi.list(),
      buildingsApi.listProjects(),
    ]).then(([a, b, s, p]) => {
      setAudits(a.data);
      setBuildings(b.data);
      setScenarios(s.data);
      setProjects(p.data);
    }).finally(() => setLoading(false));
  }, []);

  // Open panel — clone current prefs into draft
  const openPanel = useCallback(() => {
    setDraft([...enabled]);
    setPanelOpen(true);
  }, [enabled]);

  function applyDraft() {
    setEnabled(draft);
    savePrefs(draft);
    setPanelOpen(false);
  }

  function resetDefaults() { setDraft([...DEFAULT_WIDGETS]); }

  function toggleDraft(id: WidgetId) {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const has = (id: WidgetId) => enabled.includes(id);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const buildingMap: Record<string, Building> = {};
  for (const b of buildings) buildingMap[b.id] = b;

  const completedAudits  = audits.filter((a) => a.status === "completed" || a.status === "validated");
  const totalArea        = buildings.reduce((s, b) => s + (b.heated_area_m2 ?? 0), 0);
  const totalEnergyCost  = completedAudits.reduce((s, a) => s + (a.result_snapshot?.estimated_annual_cost_eur ?? 0), 0);
  const totalCo2         = completedAudits.reduce((s, a) => s + (a.result_snapshot?.co2_per_m2 ?? 0), 0);
  const totalSavingsKwh  = scenarios.reduce((s, sc) => s + (sc.estimated_energy_savings_kwh ?? 0), 0);
  const activeProjects   = projects.filter((p) => p.project_status === "active").length;

  const labelData = Object.entries(
    completedAudits.reduce<Record<string, number>>((acc, a) => {
      const l = a.computed_energy_label ?? "?";
      acc[l] = (acc[l] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));

  const avgHeating = completedAudits.reduce((s, a) => s + (a.result_snapshot?.heating_kwh ?? 0), 0) / (completedAudits.length || 1);
  const avgEcs     = completedAudits.reduce((s, a) => s + (a.result_snapshot?.ecs_kwh ?? 0), 0) / (completedAudits.length || 1);
  const avgVent    = completedAudits.reduce((s, a) => s + (a.result_snapshot?.ventilation_kwh ?? 0), 0) / (completedAudits.length || 1);
  const breakdownData = [
    { name: "Chauffage", kwh: Math.round(avgHeating), fill: `var(--brand-500)` },
    { name: "ECS",       kwh: Math.round(avgEcs),     fill: "#3b82f6" },
    { name: "Ventil.",   kwh: Math.round(avgVent),     fill: "#f59e0b" },
  ];

  const recentAudits = [...audits].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  // ── KPI widgets config ────────────────────────────────────────────────────────
  const KPI_WIDGETS = [
    {
      id: "kpi_buildings" as WidgetId,
      label: "Bâtiments",
      value: buildings.length,
      sub: <Link href="/buildings" className="text-xs font-medium hover:underline mt-1 inline-flex items-center gap-1" style={{ color: "var(--brand-500)" }}>Voir le patrimoine <ArrowRight size={11} /></Link>,
      icon: Building2, color: `var(--brand-500)`, bg: `var(--brand-50)`,
    },
    {
      id: "kpi_audits" as WidgetId,
      label: "Audits complétés",
      value: completedAudits.length,
      sub: <p className="text-xs text-gray-400 mt-1">sur {audits.length} créé(s)</p>,
      icon: ClipboardList, color: "#2563eb", bg: "#eff6ff",
    },
    {
      id: "kpi_energy_cost" as WidgetId,
      label: "Coût énergétique",
      value: completedAudits.length ? formatNumber(totalEnergyCost) : "—",
      sub: <p className="text-xs text-gray-400 mt-1">€/an (cumul)</p>,
      icon: Zap, color: "#f59e0b", bg: "#fffbeb",
    },
    {
      id: "kpi_co2" as WidgetId,
      label: "CO₂ moyen",
      value: completedAudits.length ? formatNumber(totalCo2 / completedAudits.length, 1) : "—",
      sub: <p className="text-xs text-gray-400 mt-1">kgCO₂/m²/an</p>,
      icon: Leaf, color: "#10b981", bg: "#d1fae5",
    },
    {
      id: "kpi_surface" as WidgetId,
      label: "Surface totale",
      value: Math.round(totalArea),
      sub: <p className="text-xs text-gray-400 mt-1">m² chauffés</p>,
      icon: Maximize2, color: "#8b5cf6", bg: "#f3e8ff",
    },
    {
      id: "kpi_scenarios" as WidgetId,
      label: "Plans de rénovation",
      value: scenarios.length,
      sub: <p className="text-xs text-gray-400 mt-1">scénarios actifs</p>,
      icon: TrendingUp, color: "#0891b2", bg: "#e0f2fe",
    },
    {
      id: "kpi_savings" as WidgetId,
      label: "Économies potentielles",
      value: formatNumber(totalSavingsKwh),
      sub: <p className="text-xs text-gray-400 mt-1">kWh/an</p>,
      icon: Euro, color: "#dc2626", bg: "#fef2f2",
    },
    {
      id: "kpi_projects" as WidgetId,
      label: "Projets actifs",
      value: activeProjects,
      sub: <Link href="/projects" className="text-xs font-medium hover:underline mt-1 inline-flex items-center gap-1" style={{ color: "var(--brand-500)" }}>Voir les projets <ArrowRight size={11} /></Link>,
      icon: FolderOpen, color: "#d97706", bg: "#fffbeb",
    },
  ];

  const visibleKpis = KPI_WIDGETS.filter((k) => has(k.id));

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Vue d&apos;ensemble de votre activité</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openPanel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutGrid size={15} />
              Personnaliser
            </button>
            <Link href="/buildings/new" className="btn-secondary">
              <Building2 size={15} /> Bâtiment
            </Link>
            <Link href="/audits/new" className="btn-primary">
              <Plus size={15} /> Audit
            </Link>
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────── */}
        {visibleKpis.length > 0 && (
          <div className={`grid gap-4 mb-8 ${
            visibleKpis.length === 1 ? "grid-cols-1 max-w-xs"
            : visibleKpis.length === 2 ? "grid-cols-2 max-w-lg"
            : visibleKpis.length === 3 ? "grid-cols-3"
            : visibleKpis.length <= 4 ? "grid-cols-2 lg:grid-cols-4"
            : visibleKpis.length <= 6 ? "grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-4"
          }`}>
            {visibleKpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</span>
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: kpi.bg }}>
                      <Icon size={15} style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  {kpi.sub}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pipeline ─────────────────────────────────────────────── */}
        {has("pipeline") && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Pipeline des missions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const count = audits.filter((a) => a.status === stage.key).length;
                const Icon = stage.icon;
                return (
                  <Link key={stage.key} href={`/audits?status=${stage.key}`}
                    className={`card p-4 border ${stage.border} ${stage.bg} hover:shadow-md transition-all group`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className={`text-xs font-semibold ${stage.color}`}>{stage.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-400 mt-0.5">audit{count !== 1 ? "s" : ""}</p>
                    <div className={`flex items-center gap-1 mt-2 text-xs ${stage.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Voir <ArrowRight size={11} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Savings banner ───────────────────────────────────────── */}
        {has("savings_banner") && scenarios.length > 0 && (
          <div className="card p-5 mb-8 border-green-200" style={{ background: "linear-gradient(to right, #f0faf4, #ecfdf5)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm">Potentiel d&apos;économies identifié</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {scenarios.length} plan{scenarios.length !== 1 ? "s" : ""} de rénovation actif{scenarios.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">{formatNumber(totalSavingsKwh)}</p>
                <p className="text-xs text-green-600">kWh/an économisés</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Charts + recent audits ───────────────────────────────── */}
        {(has("chart_dpe") || has("chart_consumption") || has("recent_audits")) && (
          <div className={`grid gap-6 mb-8 ${
            [has("chart_dpe"), has("chart_consumption"), has("recent_audits")].filter(Boolean).length === 1
              ? "grid-cols-1"
              : [has("chart_dpe"), has("chart_consumption"), has("recent_audits")].filter(Boolean).length === 2
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 lg:grid-cols-3"
          }`}>
            {/* DPE pie */}
            {has("chart_dpe") && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-1 text-sm">Classes DPE</h2>
                <p className="text-xs text-gray-400 mb-3">Répartition du parc audité</p>
                {labelData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                    <ClipboardList size={32} className="mb-2" />
                    <p className="text-xs text-center">Complétez des audits pour voir la répartition</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={labelData} dataKey="count" nameKey="label" cx="50%" cy="50%"
                        outerRadius={72} label={({ label, count }) => `${label} (${count})`} labelLine={false}>
                        {labelData.map((e) => <Cell key={e.label} fill={LABEL_COLORS[e.label] ?? "#888"} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} audit(s)`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Consumption bar */}
            {has("chart_consumption") && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-1 text-sm">Consommations moyennes</h2>
                <p className="text-xs text-gray-400 mb-3">kWh/an — {completedAudits.length} audit(s)</p>
                {completedAudits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                    <Zap size={32} className="mb-2" />
                    <p className="text-xs text-center">Aucune donnée disponible</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={breakdownData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${formatNumber(v)} kWh`, ""]} />
                      <Bar dataKey="kwh" radius={[3, 3, 0, 0]}>
                        {breakdownData.map((e) => <Cell key={e.name} fill={e.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* Recent audits */}
            {has("recent_audits") && (
              <div className="card p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800 text-sm">Missions récentes</h2>
                  <Link href="/audits" className="text-xs font-medium hover:underline" style={{ color: "var(--brand-500)" }}>
                    Tout voir →
                  </Link>
                </div>
                {loading ? (
                  <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Chargement...</div>
                ) : recentAudits.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-6">
                    <ClipboardList size={28} className="mb-2" />
                    <p className="text-xs">Aucun audit</p>
                    <Link href="/audits/new" className="btn-primary mt-3 text-xs py-1.5"><Plus size={13} /> Créer</Link>
                  </div>
                ) : (
                  <div className="flex-1 space-y-1">
                    {recentAudits.map((audit) => {
                      const building = buildingMap[audit.building_id];
                      const statusInfo = AUDIT_STATUS_LABELS[audit.status] ?? { label: audit.status, color: "bg-gray-100 text-gray-600" };
                      return (
                        <Link key={audit.id} href={`/audits/${audit.id}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group">
                          <EnergyLabel label={audit.computed_energy_label} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{building?.name ?? "Bâtiment inconnu"}</p>
                            <p className="text-[10px] text-gray-400">{new Date(audit.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Quick actions ────────────────────────────────────────── */}
        {has("quick_actions") && (
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Actions rapides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { href: "/buildings/new", icon: Building2,   color: `var(--brand-500)`, bg: `var(--brand-50)`, label: "Ajouter un bâtiment",   sub: "Enregistrer un nouveau site à auditer" },
                { href: "/audits/new",    icon: ClipboardList, color: "#2563eb", bg: "#eff6ff", label: "Lancer un audit",        sub: "Calculer la performance énergétique DPE" },
                { href: "/reports",       icon: FileText,     color: "#f59e0b", bg: "#fffbeb", label: "Générer un livrable",   sub: "Exporter un rapport PDF pour l'AG" },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.href} href={a.href}
                    className="card p-5 hover:shadow-md transition-all group"
                    style={{ "--hover-border": a.color } as React.CSSProperties}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = a.color + "66"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = "#e0e0e0"}
                  >
                    <div className="w-10 h-10 rounded flex items-center justify-center mb-3 transition-colors"
                      style={{ backgroundColor: a.bg }}>
                      <Icon size={20} style={{ color: a.color }} />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.sub}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {visibleKpis.length === 0 && !has("pipeline") && !has("chart_dpe") && !has("chart_consumption") && !has("recent_audits") && !has("quick_actions") && !has("savings_banner") && (
          <div className="card p-16 text-center">
            <LayoutGrid size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-4 font-medium">Votre tableau de bord est vide</p>
            <button onClick={openPanel} className="btn-primary">
              <LayoutGrid size={15} /> Personnaliser le tableau de bord
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          PANEL DE PERSONNALISATION
      ════════════════════════════════════════════════════════════ */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-white z-50 flex flex-col"
            style={{ boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}>

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <LayoutGrid size={17} style={{ color: `var(--brand-500)` }} />
                <h2 className="font-bold text-gray-900 text-base">Personnaliser</h2>
              </div>
              <button onClick={() => setPanelOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-500">
                <X size={17} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <p className="text-xs text-gray-500">
                Activez ou désactivez les blocs affichés sur votre tableau de bord. Vos préférences sont sauvegardées localement.
              </p>

              {(["KPI", "Sections", "Graphiques"] as const).map((cat) => {
                const widgets = WIDGET_CATALOGUE.filter((w) => w.category === cat);
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{cat}</p>
                    <div className="space-y-1">
                      {widgets.map((w) => {
                        const Icon = w.icon;
                        const on = draft.includes(w.id);
                        return (
                          <div key={w.id}
                            className="flex items-center gap-3 p-3 rounded-md border transition-colors cursor-pointer"
                            style={{
                              borderColor:     on ? "#18753c33" : "#e0e0e0",
                              backgroundColor: on ? "#f0faf4" : "#fff",
                            }}
                            onClick={() => toggleDraft(w.id)}>
                            {/* Drag handle placeholder */}
                            <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: on ? `var(--brand-50)` : "#f4f4f4" }}>
                              <Icon size={14} style={{ color: on ? `var(--brand-500)` : "#999" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{w.label}</p>
                              <p className="text-[11px] text-gray-400 truncate">{w.desc}</p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Toggle on={on} onChange={() => toggleDraft(w.id)} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-gray-200 flex-shrink-0 space-y-3">
              {/* Selection count */}
              <p className="text-xs text-gray-500 text-center">
                {draft.length} bloc{draft.length !== 1 ? "s" : ""} sélectionné{draft.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-2">
                <button onClick={resetDefaults}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <RotateCcw size={13} /> Par défaut
                </button>
                <button onClick={applyDraft}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded text-sm font-bold text-white transition-colors"
                  style={{ backgroundColor: `var(--brand-500)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
