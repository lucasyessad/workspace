"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { buildingsApi, auditsApi, scenariosApi, reportsApi } from "@/lib/api";
import { BuildingProject, Building, Audit, RenovationScenario, GeneratedReport, System, Envelope } from "@/types";
import { AUDIT_STATUS_LABELS, SCENARIO_TYPE_LABELS, formatNumber, cn } from "@/lib/utils";
import {
  Building2, ClipboardList, TrendingUp, FileText, Settings, ChevronLeft,
  MapPin, Calendar, Zap, Leaf, Euro, User, Phone, Mail, Plus, ArrowRight,
  Receipt, Lock, Edit3, Save, X, Download, Check, Circle, ChevronRight,
  AlertCircle, Thermometer, Layers,
} from "lucide-react";
import Link from "next/link";

// ─── Workflow definition ──────────────────────────────────────────────────────

type StageKey =
  | "project_created"
  | "buildings_added"
  | "technical_data"
  | "audit_configured"
  | "audit_calculated"
  | "renovation_plan"
  | "report_generated"
  | "project_closed";

interface WorkflowStage {
  key: StageKey;
  label: string;
  description: string;
  icon: React.ElementType;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    key: "project_created",
    label: "Projet créé",
    description: "Informations générales, méthode de calcul, zone climatique, contact référent.",
    icon: Building2,
  },
  {
    key: "buildings_added",
    label: "Bâtiments renseignés",
    description: "Ajout des bâtiments avec adresse, surface, année de construction et classe DPE actuelle.",
    icon: Building2,
  },
  {
    key: "technical_data",
    label: "Données techniques",
    description: "Systèmes (chauffage, ECS, VMC) et enveloppe (murs, toiture, planchers, menuiseries) saisis.",
    icon: Thermometer,
  },
  {
    key: "audit_configured",
    label: "Audit configuré",
    description: "Type d'audit, méthode de calcul réglementaire et zone climatique définis pour chaque bâtiment.",
    icon: ClipboardList,
  },
  {
    key: "audit_calculated",
    label: "Audit calculé",
    description: "Calcul énergétique effectué — classe DPE, kWhpe/m², coût annuel et CO₂ disponibles.",
    icon: Zap,
  },
  {
    key: "renovation_plan",
    label: "Plan de rénovation",
    description: "Scénarios de travaux définis avec aides (MaPrimeRénov', CEE, Éco-PTZ) et retour sur investissement.",
    icon: TrendingUp,
  },
  {
    key: "report_generated",
    label: "Rapport généré",
    description: "Rapport PDF produit — prêt pour l'assemblée générale ou le dossier de financement.",
    icon: FileText,
  },
  {
    key: "project_closed",
    label: "Projet clôturé",
    description: "Mission terminée. Le projet peut être archivé ou conservé comme référence.",
    icon: Check,
  },
];

const STAGE_ORDER: StageKey[] = WORKFLOW_STAGES.map((s) => s.key);

// Derive current stage from actual data
function deriveStage(
  project: BuildingProject,
  buildings: Building[],
  hasTechnical: boolean,
  audits: Audit[],
  completedAudits: Audit[],
  scenarios: RenovationScenario[],
  reports: GeneratedReport[]
): StageKey {
  if (project.project_status === "completed" || project.project_status === "archived") return "project_closed";
  if (reports.some((r) => r.status === "ready")) return "report_generated";
  if (scenarios.length > 0) return "renovation_plan";
  if (completedAudits.length > 0) return "audit_calculated";
  if (audits.length > 0) return "audit_configured";
  if (hasTechnical) return "technical_data";
  if (buildings.length > 0) return "buildings_added";
  return "project_created";
}

type Tab = "workflow" | "buildings" | "audits" | "scenarios" | "reports" | "billing" | "settings";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "workflow",   label: "Workflow",            icon: Circle },
  { key: "buildings",  label: "Bâtiments",           icon: Building2 },
  { key: "audits",     label: "Audits",              icon: ClipboardList },
  { key: "scenarios",  label: "Plans de rénovation", icon: TrendingUp },
  { key: "reports",    label: "Rapports",            icon: FileText },
  { key: "billing",    label: "Facturation",         icon: Receipt },
  { key: "settings",   label: "Paramètres",          icon: Settings },
];

const CALC_LABELS: Record<string, string> = {
  "3CL_DPE_2021": "3CL-DPE 2021",
  ThCE_Ex: "Th-CE-Ex",
  RE2020: "RE2020",
  RT2012: "RT2012",
};

const STATUS_OPTIONS = [
  { value: "active",    label: "Actif" },
  { value: "on_hold",   label: "En pause" },
  { value: "completed", label: "Clôturé" },
  { value: "archived",  label: "Archivé" },
];

// ─── Next-action guide per stage ─────────────────────────────────────────────

interface NextAction {
  title: string;
  description: string;
  cta: string;
  href: string;
  color: string;
}

function getNextAction(stage: StageKey, projectId: string, buildings: Building[], audits: Audit[]): NextAction | null {
  const firstBuilding = buildings[0];
  const firstIncompleteAudit = audits.find((a) => a.status === "draft" || a.status === "in_progress");

  const map: Record<StageKey, NextAction | null> = {
    project_created: {
      title: "Ajouter le premier bâtiment",
      description: "Renseignez l'adresse, la surface chauffée, l'année de construction et la classe DPE actuelle.",
      cta: "Ajouter un bâtiment",
      href: "/buildings/new",
      color: "brand",
    },
    buildings_added: {
      title: "Saisir les données techniques",
      description: "Renseignez les systèmes de chauffage, d'ECS, de ventilation et les composants d'enveloppe du bâtiment.",
      cta: "Configurer le bâtiment",
      href: firstBuilding ? `/buildings/${firstBuilding.id}` : "/buildings",
      color: "blue",
    },
    technical_data: {
      title: "Créer l'audit énergétique",
      description: `Choisissez le type d'audit (${CALC_LABELS["3CL_DPE_2021"]} par défaut) et lancez le calcul réglementaire.`,
      cta: "Créer l'audit",
      href: firstBuilding ? `/audits/new?building_id=${firstBuilding.id}` : "/audits/new",
      color: "green",
    },
    audit_configured: {
      title: "Lancer le calcul énergétique",
      description: "Vérifiez les paramètres saisis puis lancez le moteur de calcul pour obtenir la classe DPE et les consommations.",
      cta: "Voir l'audit",
      href: firstIncompleteAudit ? `/audits/${firstIncompleteAudit.id}` : "/audits",
      color: "amber",
    },
    audit_calculated: {
      title: "Créer un plan de rénovation",
      description: "Définissez des gestes de travaux, simulez les aides financières (MaPrimeRénov', CEE, Éco-PTZ) et estimez le retour sur investissement.",
      cta: "Nouveau plan de rénovation",
      href: "/scenarios/new",
      color: "indigo",
    },
    renovation_plan: {
      title: "Générer le rapport",
      description: "Produisez le rapport PDF complet pour l'assemblée générale, le syndic ou le dossier de financement.",
      cta: "Gérer les rapports",
      href: "/reports",
      color: "red",
    },
    report_generated: {
      title: "Clôturer le projet",
      description: "La mission est terminée. Archivez le projet ou marquez-le comme clôturé pour le conserver comme référence.",
      cta: "Paramètres du projet",
      href: "#settings",
      color: "gray",
    },
    project_closed: null,
  };
  return map[stage];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };

  const [project, setProject] = useState<BuildingProject | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [allAudits, setAllAudits] = useState<Audit[]>([]);
  const [scenarios, setScenarios] = useState<RenovationScenario[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [hasTechnical, setHasTechnical] = useState(false);
  const [tab, setTab] = useState<Tab>("workflow");
  const [editSettings, setEditSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Partial<BuildingProject>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [proj, blds, auds, scens, reps] = await Promise.all([
      buildingsApi.getProject(id),
      buildingsApi.listBuildings(id),
      auditsApi.list(),
      scenariosApi.list(),
      reportsApi.list(),
    ]);
    setProject(proj.data);
    setSettingsForm(proj.data);
    setBuildings(blds.data);
    setAllAudits(auds.data);
    setScenarios(scens.data);
    setReports(reps.data);

    // Check if any building has systems or envelopes
    if (blds.data.length > 0) {
      const checks = await Promise.all(
        blds.data.slice(0, 3).map(async (b: Building) => {
          const [sys, env] = await Promise.all([
            buildingsApi.listSystems(b.id),
            buildingsApi.listEnvelopes(b.id),
          ]);
          return sys.data.length > 0 || env.data.length > 0;
        })
      );
      setHasTechnical(checks.some(Boolean));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Derived project-scoped data
  const buildingIds = new Set(buildings.map((b) => b.id));
  const projectAudits = allAudits.filter((a) => buildingIds.has(a.building_id));
  const auditIds = new Set(projectAudits.map((a) => a.id));
  const projectScenarios = scenarios.filter((s) => auditIds.has(s.audit_id));
  const projectReports = reports.filter((r) => r.audit_id && auditIds.has(r.audit_id));
  const completedAudits = projectAudits.filter((a) => a.status === "completed" || a.status === "validated");

  const buildingMap: Record<string, Building> = {};
  for (const b of buildings) buildingMap[b.id] = b;

  const currentStage: StageKey = project
    ? deriveStage(project, buildings, hasTechnical, projectAudits, completedAudits, projectScenarios, projectReports)
    : "project_created";
  const currentStageIdx = STAGE_ORDER.indexOf(currentStage);

  // KPIs
  const totalArea = buildings.reduce((s, b) => s + (b.heated_area_m2 ?? 0), 0);
  const totalEnergyCost = completedAudits.reduce((s, a) => s + (a.result_snapshot?.estimated_annual_cost_eur ?? 0), 0);
  const totalSavings = projectScenarios.reduce((s, sc) => s + (sc.estimated_energy_savings_kwh ?? 0), 0);
  const totalRenovCost = projectScenarios.reduce((s, sc) => s + (sc.estimated_total_cost_eur ?? 0), 0);

  const tabCounts: Partial<Record<Tab, number>> = {
    buildings: buildings.length,
    audits:    projectAudits.length,
    scenarios: projectScenarios.length,
    reports:   projectReports.length,
  };

  async function saveSettings() {
    if (!project) return;
    setSaving(true);
    try {
      const res = await buildingsApi.updateProject(id, settingsForm);
      setProject(res.data);
      setEditSettings(false);
    } finally {
      setSaving(false);
    }
  }

  if (!project) {
    return <AppLayout><div className="p-8 text-gray-400">Chargement...</div></AppLayout>;
  }

  const nextAction = getNextAction(currentStage, id, buildings, projectAudits);
  const progressPct = Math.round(((currentStageIdx + 1) / STAGE_ORDER.length) * 100);

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <Link href="/projects" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ChevronLeft size={15} /> Projets
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              {project.project_code && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">#{project.project_code}</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {CALC_LABELS[project.calculation_method ?? ""] ?? project.calculation_method} · {project.climate_zone}
              </span>
              {buildings.length > 0 && (
                <span className="text-xs text-gray-400">{buildings.length} bâtiment{buildings.length > 1 ? "s" : ""} · {Math.round(totalArea)} m²</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/buildings/new" className="btn-secondary text-sm"><Building2 size={14} /> Bâtiment</Link>
            <Link href="/audits/new" className="btn-primary text-sm"><Plus size={14} /> Audit</Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Avancement du projet</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = tabCounts[t.key];
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  tab === t.key
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={14} />
                {t.label}
                {count !== undefined && count > 0 && (
                  <span className={cn(
                    "text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                    tab === t.key ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-500"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Workflow ──────────────────────────────────────────────── */}
        {tab === "workflow" && (
          <div className="space-y-6">
            {/* Next action card */}
            {nextAction && (
              <div className="card p-5 border-brand-200 bg-brand-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowRight size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Prochaine étape</p>
                      <h3 className="font-semibold text-gray-900">{nextAction.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{nextAction.description}</p>
                    </div>
                  </div>
                  <Link
                    href={nextAction.href}
                    className="btn-primary flex-shrink-0"
                    onClick={nextAction.href === "#settings" ? (e) => { e.preventDefault(); setTab("settings"); setEditSettings(true); } : undefined}
                  >
                    {nextAction.cta}
                  </Link>
                </div>
              </div>
            )}

            {/* Stepper */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-6 text-sm">Étapes du projet</h2>
              <div className="space-y-0">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const isCompleted = idx < currentStageIdx;
                  const isCurrent  = idx === currentStageIdx;
                  const isPending  = idx > currentStageIdx;
                  const Icon = stage.icon;
                  const isLast = idx === WORKFLOW_STAGES.length - 1;

                  return (
                    <div key={stage.key} className="flex gap-4">
                      {/* Step indicator + connector */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all",
                          isCompleted ? "bg-green-500 border-green-500 text-white"
                            : isCurrent  ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-200"
                            : "bg-white border-gray-200 text-gray-300"
                        )}>
                          {isCompleted ? <Check size={16} /> : <Icon size={15} />}
                        </div>
                        {!isLast && (
                          <div className={cn(
                            "w-0.5 flex-1 my-1 min-h-[24px]",
                            isCompleted ? "bg-green-300" : "bg-gray-100"
                          )} />
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn(
                            "text-sm font-semibold",
                            isCompleted ? "text-green-700"
                              : isCurrent  ? "text-brand-700"
                              : "text-gray-400"
                          )}>
                            {stage.label}
                          </p>
                          {isCompleted && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Complété</span>
                          )}
                          {isCurrent && (
                            <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium animate-pulse">En cours</span>
                          )}
                        </div>
                        <p className={cn(
                          "text-xs leading-relaxed",
                          isPending ? "text-gray-300" : "text-gray-500"
                        )}>
                          {stage.description}
                        </p>

                        {/* Contextual data for completed steps */}
                        {isCompleted && stage.key === "buildings_added" && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {buildings.slice(0, 4).map((b) => (
                              <Link key={b.id} href={`/buildings/${b.id}`}
                                className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded hover:border-brand-300 transition-colors">
                                {b.name}
                              </Link>
                            ))}
                            {buildings.length > 4 && <span className="text-xs text-gray-400">+{buildings.length - 4} autres</span>}
                          </div>
                        )}
                        {isCompleted && stage.key === "audit_calculated" && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {completedAudits.slice(0, 3).map((a) => (
                              <Link key={a.id} href={`/audits/${a.id}`}
                                className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded hover:border-brand-300 transition-colors">
                                <EnergyLabel label={a.computed_energy_label} size="sm" />
                                {buildingMap[a.building_id]?.name ?? "—"}
                              </Link>
                            ))}
                          </div>
                        )}
                        {isCompleted && stage.key === "renovation_plan" && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {projectScenarios.slice(0, 3).map((s) => (
                              <span key={s.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPI summary */}
            {completedAudits.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                  <p className="text-xs text-gray-400 mb-1">Surface totale</p>
                  <p className="text-xl font-bold text-gray-900">{Math.round(totalArea)}</p>
                  <p className="text-xs text-gray-400">m² chauffés</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-400 mb-1">Coût énergétique</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(totalEnergyCost)} €</p>
                  <p className="text-xs text-gray-400">par an</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-400 mb-1">Économies potentielles</p>
                  <p className="text-xl font-bold text-green-600">{formatNumber(totalSavings)}</p>
                  <p className="text-xs text-gray-400">kWh/an</p>
                </div>
                <div className="card p-4">
                  <p className="text-xs text-gray-400 mb-1">Budget rénovation</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(totalRenovCost)} €</p>
                  <p className="text-xs text-gray-400">estimé</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bâtiments ──────────────────────────────────────────────── */}
        {tab === "buildings" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <Link href="/buildings/new" className="btn-primary text-sm"><Plus size={14} /> Nouveau bâtiment</Link>
            </div>
            {buildings.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm mb-3">Aucun bâtiment dans ce projet</p>
                <Link href="/buildings/new" className="btn-primary text-sm inline-flex"><Plus size={14} /> Ajouter</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buildings.map((b) => (
                  <Link key={b.id} href={`/buildings/${b.id}`}>
                    <div className="card p-4 hover:border-brand-300 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">{b.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{b.building_type ?? "—"}</p>
                        </div>
                        <EnergyLabel label={b.current_energy_label} size="sm" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {b.city && <span className="flex items-center gap-1"><MapPin size={11} />{b.postal_code} {b.city}</span>}
                        {b.heated_area_m2 && <span>{b.heated_area_m2} m²</span>}
                        {b.construction_year && <span className="flex items-center gap-1"><Calendar size={11} />{b.construction_year}</span>}
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {projectAudits.filter((a) => a.building_id === b.id).length} audit(s)
                        </span>
                        <span className="text-xs text-brand-600 group-hover:underline flex items-center gap-1">
                          Configurer <ChevronRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Audits ─────────────────────────────────────────────────── */}
        {tab === "audits" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <Link href="/audits/new" className="btn-primary text-sm"><Plus size={14} /> Nouvel audit</Link>
            </div>
            {projectAudits.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm mb-3">Aucun audit pour ce projet</p>
                <Link href="/audits/new" className="btn-primary text-sm inline-flex"><Plus size={14} /> Créer</Link>
              </div>
            ) : (
              projectAudits.map((a) => {
                const b = buildingMap[a.building_id];
                const st = AUDIT_STATUS_LABELS[a.status];
                return (
                  <div key={a.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <EnergyLabel label={a.computed_energy_label} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{b?.name ?? "Bâtiment"}</p>
                        <p className="text-xs text-gray-400">
                          {a.audit_type} · {new Date(a.created_at).toLocaleDateString("fr-FR")} · v{a.version_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {a.result_snapshot && (
                        <div className="text-right text-xs text-gray-500">
                          <p className="font-semibold text-gray-800">{formatNumber(a.result_snapshot.primary_energy_per_m2)} kWhpe/m²</p>
                          <p>{formatNumber(a.result_snapshot.estimated_annual_cost_eur)} €/an</p>
                        </div>
                      )}
                      {a.status === "validated"
                        ? <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded"><Lock size={10} /> Validé</span>
                        : <span className={`text-xs px-2 py-0.5 rounded font-medium ${st?.color}`}>{st?.label}</span>
                      }
                      <Link href={`/audits/${a.id}`} className="btn-secondary text-xs py-1.5">
                        Voir <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Plans de rénovation ─────────────────────────────────────── */}
        {tab === "scenarios" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <Link href="/scenarios/new" className="btn-primary text-sm"><Plus size={14} /> Nouveau plan</Link>
            </div>
            {projectScenarios.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm mb-3">Aucun plan de rénovation pour ce projet</p>
                {completedAudits.length > 0
                  ? <Link href="/scenarios/new" className="btn-primary text-sm inline-flex"><Plus size={14} /> Créer</Link>
                  : <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1"><AlertCircle size={12} /> Complétez un audit en premier</p>
                }
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectScenarios.map((s) => (
                  <div key={s.id} className="card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                        <span className="text-xs text-gray-400">{SCENARIO_TYPE_LABELS[s.scenario_type] ?? s.scenario_type}</span>
                      </div>
                      <EnergyLabel label={s.target_energy_label} size="sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3">
                      {s.estimated_total_cost_eur != null && (
                        <div className="flex items-center gap-1"><Euro size={11} /> {formatNumber(s.estimated_total_cost_eur)} €</div>
                      )}
                      {s.estimated_energy_savings_kwh != null && (
                        <div className="flex items-center gap-1 text-green-600"><Zap size={11} /> {formatNumber(s.estimated_energy_savings_kwh)} kWh/an</div>
                      )}
                      {s.simple_payback_years != null && <div>RSI : {s.simple_payback_years} ans</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Rapports ───────────────────────────────────────────────── */}
        {tab === "reports" && (
          <div className="space-y-3">
            <div className="flex justify-end mb-1">
              <Link href="/reports" className="btn-secondary text-sm"><FileText size={14} /> Gérer les rapports</Link>
            </div>
            {projectReports.length === 0 ? (
              <div className="card p-10 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun rapport généré pour ce projet</p>
              </div>
            ) : (
              projectReports.map((r) => {
                const audit = projectAudits.find((a) => a.id === r.audit_id);
                const building = audit ? buildingMap[audit.building_id] : undefined;
                return (
                  <div key={r.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.report_type}</p>
                        <p className="text-xs text-gray-400">{building?.name ?? "—"} · {new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${r.status === "ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.status === "ready" ? "Prêt" : r.status}
                      </span>
                      {r.status === "ready" && (
                        <Link href="/reports" className="btn-secondary text-xs py-1.5"><Download size={13} /> PDF</Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Facturation ─────────────────────────────────────────────── */}
        {tab === "billing" && (
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm">Budget rénovation</h2>
              {projectScenarios.length === 0 ? (
                <p className="text-sm text-gray-400">Ajoutez des plans de rénovation pour simuler le budget.</p>
              ) : (
                <div className="space-y-2">
                  {projectScenarios.map((s) => (
                    <div key={s.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{SCENARIO_TYPE_LABELS[s.scenario_type] ?? s.scenario_type}</p>
                      </div>
                      <div className="text-right">
                        {s.estimated_total_cost_eur != null && <p className="font-semibold">{formatNumber(s.estimated_total_cost_eur)} €</p>}
                        {s.simple_payback_years != null && <p className="text-xs text-gray-400">RSI : {s.simple_payback_years} ans</p>}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-gray-900">
                    <span>Total estimé</span><span>{formatNumber(totalRenovCost)} €</span>
                  </div>
                </div>
              )}
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4 text-sm">Coûts énergétiques annuels</h2>
              {completedAudits.length === 0 ? (
                <p className="text-sm text-gray-400">Complétez des audits pour visualiser les coûts.</p>
              ) : (
                <div className="space-y-2">
                  {completedAudits.map((a) => (
                    <div key={a.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm items-center">
                      <div className="flex items-center gap-2">
                        <EnergyLabel label={a.computed_energy_label} size="sm" />
                        <p className="text-gray-700">{buildingMap[a.building_id]?.name ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        {a.result_snapshot?.estimated_annual_cost_eur != null && (
                          <p className="font-semibold">{formatNumber(a.result_snapshot.estimated_annual_cost_eur)} €/an</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-gray-900">
                    <span>Total</span><span>{formatNumber(totalEnergyCost)} €/an</span>
                  </div>
                </div>
              )}
            </div>
            {totalSavings > 0 && (
              <div className="card p-5 bg-green-50 border-green-200 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-green-800 text-sm">Économies potentielles</p>
                  <p className="text-xs text-green-600">{projectScenarios.length} plan(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-700">{formatNumber(totalSavings)} kWh/an</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Paramètres ──────────────────────────────────────────────── */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex justify-end">
              {!editSettings
                ? <button onClick={() => setEditSettings(true)} className="btn-secondary text-sm"><Edit3 size={14} /> Modifier</button>
                : <div className="flex gap-2">
                    <button onClick={() => { setEditSettings(false); setSettingsForm(project); }} className="btn-secondary text-sm"><X size={14} /> Annuler</button>
                    <button onClick={saveSettings} disabled={saving} className="btn-primary text-sm"><Save size={14} /> {saving ? "Sauvegarde..." : "Sauvegarder"}</button>
                  </div>
              }
            </div>

            {[
              {
                title: "Informations générales",
                fields: [
                  { label: "Nom du projet", key: "name", type: "text" },
                  { label: "Code projet", key: "project_code", type: "text", placeholder: "PROJ-001" },
                  { label: "Référence client", key: "client_reference", type: "text" },
                  { label: "Description", key: "description", type: "textarea" },
                ],
              },
              {
                title: "Paramètres de calcul",
                fields: [
                  { label: "Méthode de calcul", key: "calculation_method", type: "select", options: [
                    { value: "3CL_DPE_2021", label: "3CL-DPE 2021" },
                    { value: "ThCE_Ex", label: "Th-CE-Ex" },
                    { value: "RE2020", label: "RE2020" },
                    { value: "RT2012", label: "RT2012" },
                  ]},
                  { label: "Zone climatique", key: "climate_zone", type: "select", options:
                    ["H1a","H1b","H1c","H2a","H2b","H2c","H2d","H3","DOM_971","DOM_972","DOM_973","DOM_974","DOM_976"].map((z) => ({ value: z, label: z }))
                  },
                  { label: "Statut", key: "project_status", type: "select", options: STATUS_OPTIONS },
                ],
              },
              {
                title: "Contact référent",
                fields: [
                  { label: "Nom", key: "contact_name", type: "text" },
                  { label: "Email", key: "contact_email", type: "email" },
                  { label: "Téléphone", key: "contact_phone", type: "text" },
                  { label: "Notes internes", key: "notes", type: "textarea" },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="card p-5 space-y-4">
                <h2 className="font-semibold text-gray-800 text-sm">{section.title}</h2>
                {section.fields.map((field) => {
                  const val = (settingsForm as Record<string, string | undefined>)[field.key] ?? "";
                  const displayVal = (project as Record<string, string | undefined>)[field.key] ?? "—";
                  return (
                    <div key={field.key}>
                      <label className="label">{field.label}</label>
                      {!editSettings ? (
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{displayVal}</p>
                      ) : field.type === "textarea" ? (
                        <textarea className="input h-20 resize-none" value={val}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, [field.key]: e.target.value }))} />
                      ) : field.type === "select" ? (
                        <select className="input" value={val}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, [field.key]: e.target.value }))}>
                          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input className="input" type={field.type} value={val}
                          placeholder={(field as { placeholder?: string }).placeholder}
                          onChange={(e) => setSettingsForm((f) => ({ ...f, [field.key]: e.target.value }))} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
