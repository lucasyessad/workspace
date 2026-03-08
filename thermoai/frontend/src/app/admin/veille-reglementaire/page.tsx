"use client";
import { useState, useEffect } from "react";
import { loadAdminVars, saveAdminVars } from "@/lib/adminVars";
import {
  RefreshCw, Bell, CheckCircle, AlertTriangle, ExternalLink,
  Mail, Clock, ChevronDown, ChevronUp, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegulatorySource {
  id: string;
  /** Nom affiché de la source */
  label: string;
  /** URL de référence (pour afficher un lien cliquable) */
  url: string;
  /** Description de ce que cette source surveille */
  description: string;
  /** Catégorie réglementaire */
  category: "dpe" | "mpr" | "cee" | "ecoptz" | "anah" | "autre";
  /** Date de dernière vérification (ISO) */
  lastChecked: string | null;
  /** Résumé de la dernière version connue */
  lastKnownSummary: string;
}

interface WatchAlert {
  id: string;
  sourceId: string;
  /** Titre de l'alerte */
  title: string;
  /** Description du changement détecté */
  description: string;
  /** Date de détection (ISO) */
  detectedAt: string;
  /** Statut : "new" | "acknowledged" | "applied" */
  status: "new" | "acknowledged" | "applied";
  /** Sévérité : "info" | "warning" | "critical" */
  severity: "info" | "warning" | "critical";
}

interface WatchConfig {
  /** Fréquence de vérification en heures */
  checkFrequencyHours: number;
  /** Envoyer un email à l'admin lors d'une nouvelle alerte */
  emailOnNewAlert: boolean;
  /** Email de destination (hérite du profil admin si vide) */
  emailOverride: string;
  /** Sources actives (ids) */
  activeSources: string[];
  /** Alertes enregistrées */
  alerts: WatchAlert[];
  /** Dernière vérification globale */
  lastGlobalCheck: string | null;
}

// ─── Valeurs par défaut ────────────────────────────────────────────────────────

const REGULATORY_SOURCES: RegulatorySource[] = [
  {
    id: "ademe_dpe",
    label: "ADEME — Base de données DPE",
    url: "https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants",
    description: "Base nationale des DPE — nouveaux enregistrements, évolution des méthodes de calcul",
    category: "dpe",
    lastChecked: null,
    lastKnownSummary: "DPE V2 — méthode 3CL 2021 — PEF électricité 1,9 depuis jan. 2026",
  },
  {
    id: "france_renov_mpr",
    label: "France Rénov' — MaPrimeRénov'",
    url: "https://france-renov.gouv.fr/aides/maprimerenov",
    description: "Montants, plafonds, conditions d'éligibilité MPR — mis à jour chaque année",
    category: "mpr",
    lastChecked: null,
    lastKnownSummary: "MPR 2024–2025 — parcours accompagné et par geste — bonus BBC 10 000 €",
  },
  {
    id: "anah_thresholds",
    label: "ANAH — Plafonds de ressources",
    url: "https://www.anah.gouv.fr/proprietaires/proprietaires-occupants/etes-vous-eligible",
    description: "Plafonds de revenus ANAH par zone (IdF / province) — révisés chaque année",
    category: "anah",
    lastChecked: null,
    lastKnownSummary: "Plafonds 2025 — IdF très modeste : 22 461 € · Province très modeste : 16 229 €",
  },
  {
    id: "cee_arrete",
    label: "Ministère — Arrêtés CEE",
    url: "https://www.ecologie.gouv.fr/politiques-publiques/certificats-economies-denergie",
    description: "Fiches d'opérations standardisées CEE — montants, conditions, durée de la 5e période",
    category: "cee",
    lastChecked: null,
    lastKnownSummary: "5e période CEE — 2022–2026 — arrêté du 22 décembre 2020",
  },
  {
    id: "ecoptz_legifrance",
    label: "Légifrance — Éco-PTZ",
    url: "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037987662",
    description: "Article 244 quater U du CGI — plafonds, durées et conditions Éco-PTZ",
    category: "ecoptz",
    lastChecked: null,
    lastKnownSummary: "Plafond BBC : 50 000 € — durée max : 20 ans — prolongé jusqu'au 31/12/2027",
  },
  {
    id: "rt_batiment_logiciels",
    label: "Logiciels audit énergétique agréés",
    url: "https://rt-re-batiment.developpement-durable.gouv.fr/evaluation-des-logiciels-audit-energetique-a782.html",
    description: "Liste officielle des 10 logiciels agrées pour l'audit énergétique réglementaire",
    category: "dpe",
    lastChecked: null,
    lastKnownSummary: "10 logiciels validés — arrêté du 4 mai 2022 — PLEIADES, CLIMAWIN, DPEWIN…",
  },
  {
    id: "re2020_pef",
    label: "RE 2020 — Facteur d'énergie primaire",
    url: "https://rt-re-batiment.developpement-durable.gouv.fr",
    description: "Coefficient de conversion énergie finale → primaire (PEF) pour l'électricité",
    category: "dpe",
    lastChecked: null,
    lastKnownSummary: "PEF électricité = 1,9 depuis le 1er janvier 2026 (était 2,58)",
  },
];

const DEFAULT_WATCH_CONFIG: WatchConfig = {
  checkFrequencyHours: 24,
  emailOnNewAlert: true,
  emailOverride: "",
  activeSources: REGULATORY_SOURCES.map(s => s.id),
  alerts: [
    // Exemple d'alerte pré-chargée
    {
      id: "alert_pef_2026",
      sourceId: "re2020_pef",
      title: "Mise à jour PEF électricité — janvier 2026",
      description: "Le facteur d'énergie primaire pour l'électricité est passé de 2,58 à 1,9 depuis le 1er janvier 2026. Cela améliore les classes DPE des logements chauffés à l'électricité. Vérifiez vos variables réglementaires.",
      detectedAt: "2026-01-02T08:00:00.000Z",
      status: "applied",
      severity: "warning",
    },
  ],
  lastGlobalCheck: null,
};

const LS_KEY = "watch_config_v1";

function loadWatchConfig(): WatchConfig {
  if (typeof window === "undefined") return DEFAULT_WATCH_CONFIG;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_WATCH_CONFIG;
    const p = JSON.parse(raw) as Partial<WatchConfig>;
    return { ...DEFAULT_WATCH_CONFIG, ...p };
  } catch { return DEFAULT_WATCH_CONFIG; }
}

function saveWatchConfig(cfg: WatchConfig): void {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<RegulatorySource["category"], string> = {
  dpe:    "DPE",
  mpr:    "MaPrimeRénov'",
  cee:    "CEE",
  ecoptz: "Éco-PTZ",
  anah:   "ANAH",
  autre:  "Autre",
};

const CATEGORY_COLORS: Record<RegulatorySource["category"], string> = {
  dpe:    `var(--brand-500)`,
  mpr:    "#000091",
  cee:    "#7C3AED",
  ecoptz: "#D97706",
  anah:   "#0ea5e9",
  autre:  "#6b7280",
};

const SEVERITY_CONFIG = {
  info:     { label: "Info",      color: "#0ea5e9", bg: "#e0f2fe" },
  warning:  { label: "Attention", color: "#d97706", bg: "#fffbeb" },
  critical: { label: "Critique",  color: "#dc2626", bg: "#fef2f2" },
};

const STATUS_CONFIG = {
  new:          { label: "Nouveau",    color: "#dc2626" },
  acknowledged: { label: "Lu",         color: "#d97706" },
  applied:      { label: "Appliqué",   color: "#16a34a" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "Jamais";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function VeilleReglementairePage() {
  const C = `var(--brand-500)`;
  const [cfg, setCfg]               = useState<WatchConfig>(DEFAULT_WATCH_CONFIG);
  const [adminEmail, setAdminEmail] = useState("");
  const [checking, setChecking]     = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [saved, setSaved]           = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    setCfg(loadWatchConfig());
    const vars = loadAdminVars();
    setAdminEmail(vars.adminEmail);
  }, []);

  function updateCfg(patch: Partial<WatchConfig>) {
    setCfg(prev => {
      const next = { ...prev, ...patch };
      saveWatchConfig(next);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleSource(id: string) {
    const next = cfg.activeSources.includes(id)
      ? cfg.activeSources.filter(s => s !== id)
      : [...cfg.activeSources, id];
    updateCfg({ activeSources: next });
  }

  function acknowledgeAlert(alertId: string) {
    const alerts = cfg.alerts.map(a => a.id === alertId ? { ...a, status: "acknowledged" as const } : a);
    updateCfg({ alerts });
  }

  function applyAlert(alertId: string) {
    const alerts = cfg.alerts.map(a => a.id === alertId ? { ...a, status: "applied" as const } : a);
    updateCfg({ alerts });
  }

  function dismissAlert(alertId: string) {
    const alerts = cfg.alerts.filter(a => a.id !== alertId);
    updateCfg({ alerts });
  }

  /** Simule une vérification manuelle d'une source */
  async function checkSource(source: RegulatorySource) {
    setChecking(source.id);
    // Délai simulé (dans une vraie app : appel API backend qui vérifie la source)
    await new Promise(r => setTimeout(r, 1500));

    const now = new Date().toISOString();
    // On met à jour la date de dernier check — aucun changement fictif simulé
    setCfg(prev => {
      const next = { ...prev, lastGlobalCheck: now };
      saveWatchConfig(next);
      return next;
    });
    setChecking(null);
  }

  /** Simule une vérification globale de toutes les sources actives */
  async function checkAll() {
    setChecking("all");
    await new Promise(r => setTimeout(r, 2500));
    const now = new Date().toISOString();
    setCfg(prev => {
      const next = { ...prev, lastGlobalCheck: now };
      saveWatchConfig(next);
      return next;
    });
    setChecking(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveAdminEmailToVars() {
    const vars = loadAdminVars();
    saveAdminVars({ ...vars, adminEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function sendTestEmail() {
    // Simulation — dans une vraie app : appel API backend
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3000);
  }

  const newAlerts = cfg.alerts.filter(a => a.status === "new");
  const effectiveEmail = cfg.emailOverride || adminEmail;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── En-tête ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veille réglementaire</h1>
          <p className="text-sm text-gray-500 mt-1">
            Surveillez les évolutions réglementaires (DPE, MPR, CEE, Éco-PTZ) et recevez des alertes par email.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle size={15} /> Enregistré
            </span>
          )}
          <button
            onClick={checkAll}
            disabled={checking !== null}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: C }}
          >
            <RefreshCw size={14} className={checking === "all" ? "animate-spin" : ""} />
            {checking === "all" ? "Vérification…" : "Vérifier tout"}
          </button>
        </div>
      </div>

      {/* ── Alertes en attente ──────────────────────────────────── */}
      {newAlerts.length > 0 && (
        <div className="rounded-md p-4 space-y-3" style={{ backgroundColor: "#fff7ed", border: "2px solid #f97316" }}>
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: "#f97316" }} />
            <p className="font-bold text-gray-900 text-sm">{newAlerts.length} nouvelle{newAlerts.length > 1 ? "s" : ""} alerte{newAlerts.length > 1 ? "s" : ""} réglementaire{newAlerts.length > 1 ? "s" : ""}</p>
          </div>
          {newAlerts.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity];
            return (
              <div key={alert.id} className="rounded p-3" style={{ backgroundColor: sev.bg, border: `1px solid ${sev.color}30` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: sev.color }}>{sev.label}</span>
                      <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    </div>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Détectée le {fmtDate(alert.detectedAt)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => acknowledgeAlert(alert.id)} className="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-700 hover:bg-white transition-colors whitespace-nowrap">
                      Marquer lu
                    </button>
                    <button onClick={() => applyAlert(alert.id)} className="text-xs px-2.5 py-1 rounded text-white whitespace-nowrap" style={{ backgroundColor: C }}>
                      Appliqué
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Grille 2 colonnes ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sources surveillées ─────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest text-gray-400">Sources surveillées</h2>
          {REGULATORY_SOURCES.map(source => {
            const active  = cfg.activeSources.includes(source.id);
            const catColor = CATEGORY_COLORS[source.category];
            const isChecking = checking === source.id;
            return (
              <div key={source.id} className="bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleSource(source.id)}
                      className="mt-0.5 w-9 h-5 rounded-full flex-shrink-0 relative transition-colors"
                      style={{ backgroundColor: active ? C : "#d1d5db" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                        style={{ left: active ? "calc(100% - 18px)" : "2px" }}
                      />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{source.label}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: catColor }}>
                          {CATEGORY_LABELS[source.category]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{source.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1 italic">État connu : {source.lastKnownSummary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={source.url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-700 transition-colors" title="Ouvrir la source">
                      <ExternalLink size={13} />
                    </a>
                    <button
                      onClick={() => checkSource(source)}
                      disabled={!active || checking !== null}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={11} className={isChecking ? "animate-spin" : ""} />
                      {isChecking ? "…" : "Vérifier"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Colonne droite — config + historique */}
        <div className="space-y-4">
          {/* Config notifications */}
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
            <p className="font-bold text-gray-900 text-sm">Notifications email</p>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Email de destination</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@exemple.fr"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-[10px] text-gray-400 mt-1">Hérité du profil admin — modifiable ici.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Override email (optionnel)</label>
              <input
                type="email"
                value={cfg.emailOverride}
                onChange={e => updateCfg({ emailOverride: e.target.value })}
                placeholder="autre@exemple.fr"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Fréquence de vérification (heures)
              </label>
              <select
                value={cfg.checkFrequencyHours}
                onChange={e => updateCfg({ checkFrequencyHours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none bg-white"
              >
                <option value={6}>Toutes les 6 heures</option>
                <option value={12}>Toutes les 12 heures</option>
                <option value={24}>Toutes les 24 heures</option>
                <option value={72}>Tous les 3 jours</option>
                <option value={168}>Toutes les semaines</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cfg.emailOnNewAlert}
                onChange={e => updateCfg({ emailOnNewAlert: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs text-gray-700">Notifier par email à chaque nouvelle alerte</span>
            </label>

            <div className="pt-2 space-y-2 border-t border-gray-100">
              <button
                onClick={saveAdminEmailToVars}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-semibold text-white"
                style={{ backgroundColor: C }}
              >
                <CheckCircle size={13} /> Enregistrer
              </button>
              <button
                onClick={sendTestEmail}
                disabled={!effectiveEmail}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                <Mail size={13} />
                {testEmailSent ? "Email simulé envoyé ✓" : "Envoyer un email de test"}
              </button>
              {effectiveEmail && (
                <p className="text-[10px] text-gray-400 text-center">→ {effectiveEmail}</p>
              )}
            </div>
          </div>

          {/* Statut global */}
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-2">
            <p className="font-bold text-gray-900 text-sm">Statut global</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={12} />
              <span>Dernière vérification : <strong>{fmtDate(cfg.lastGlobalCheck)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Eye size={12} />
              <span><strong>{cfg.activeSources.length}</strong> sources actives sur {REGULATORY_SOURCES.length}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Bell size={12} />
              <span><strong>{newAlerts.length}</strong> alerte{newAlerts.length !== 1 ? "s" : ""} en attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historique des alertes ──────────────────────────────── */}
      <div>
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest text-gray-400 mb-3">Historique des alertes</h2>
        {cfg.alerts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
            <CheckCircle size={28} style={{ color: C }} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm text-gray-500">Aucune alerte enregistrée — tout est à jour.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...cfg.alerts].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()).map(alert => {
              const sev    = SEVERITY_CONFIG[alert.severity];
              const status = STATUS_CONFIG[alert.status];
              const source = REGULATORY_SOURCES.find(s => s.id === alert.sourceId);
              const expanded = expandedAlert === alert.id;
              return (
                <div key={alert.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <button
                    onClick={() => setExpandedAlert(expanded ? null : alert.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sev.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{alert.title}</p>
                        <p className="text-[10px] text-gray-400">{fmtDate(alert.detectedAt)} · {source?.label ?? alert.sourceId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: status.color, backgroundColor: status.color + "15" }}>
                        {status.label}
                      </span>
                      {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                    </div>
                  </button>
                  {expanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                      <p className="text-sm text-gray-700">{alert.description}</p>
                      {source && (
                        <a href={source.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: C }}>
                          <ExternalLink size={11} /> Consulter la source officielle
                        </a>
                      )}
                      {alert.status !== "applied" && (
                        <div className="flex gap-2 pt-1">
                          {alert.status === "new" && (
                            <button onClick={() => acknowledgeAlert(alert.id)}
                              className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                              Marquer lu
                            </button>
                          )}
                          <button onClick={() => applyAlert(alert.id)}
                            className="text-xs px-3 py-1.5 rounded text-white" style={{ backgroundColor: C }}>
                            Marquer comme appliqué
                          </button>
                          <button onClick={() => dismissAlert(alert.id)}
                            className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50">
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Note sur la vérification automatique ───────────────── */}
      <div className="flex items-start gap-3 p-4 rounded text-sm" style={{ backgroundColor: `var(--brand-50)`, border: "1px solid #c5e8d3" }}>
        <AlertTriangle size={14} style={{ color: C, flexShrink: 0 }} className="mt-0.5" />
        <div className="text-xs text-gray-700 space-y-1">
          <p><strong>Vérification automatique :</strong> La vérification automatique nécessite un service backend (cron job). En mode démo, utilisez le bouton &quot;Vérifier tout&quot; pour simuler une vérification manuelle.</p>
          <p>Les modifications réglementaires sont détectées en comparant les métadonnées des sources officielles. Toute mise à jour déclenche une alerte et un email si activé.</p>
        </div>
      </div>
    </div>
  );
}
