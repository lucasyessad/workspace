"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2, Circle, ExternalLink, Shield, Save,
  Upload, Hash, RefreshCw, Info, ChevronRight, AlertTriangle,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SoftwareConfig {
  selectedSoftware: string | null;
  integrationMode: "xml_import" | "dpe_number" | "both";
  autoImport: boolean;
  exportPath: string;
}

// ─── Données des logiciels validés ─────────────────────────────────────────────

const VALIDATED_SOFTWARE = [
  {
    id: "pleiades",
    name: "PLEIADES",
    publisher: "IZUBA Énergies",
    status: "valide",
    since: "2022",
    description: "Logiciel de calcul thermique et audit énergétique 3CL-DPE 2021. Interface web et desktop, très répandu chez les bureaux d'études.",
    features: ["3CL-DPE 2021", "Audit réglementaire", "Export XML ADEME", "Rapport PDF"],
    website: "https://www.izuba.fr/logiciel/pleiades",
    integrationNotes: "Exporte un fichier XML conforme au schéma ADEME. Import direct dans ThermoPilot AI.",
    color: "#0ea5e9",
    popular: true,
  },
  {
    id: "climawin",
    name: "CLIMAWIN 2020",
    publisher: "BBS SLAMA",
    status: "valide",
    since: "2022",
    description: "Solution complète pour le DPE, l'audit et les calculs réglementaires RT/RE. Interface Windows dédiée.",
    features: ["3CL-DPE 2021", "RT 2012", "RE 2020", "Export XML"],
    website: "https://www.bbsslama.fr",
    integrationNotes: "Export XML standard ADEME depuis le menu Fichier > Export ADEME.",
    color: "#8b5cf6",
    popular: true,
  },
  {
    id: "dpewin",
    name: "DPEWIN",
    publisher: "Logiciels Perrenoud",
    status: "valide",
    since: "2022",
    description: "Spécialisé DPE résidentiel et tertiaire, utilisé par de nombreux diagnostiqueurs certifiés.",
    features: ["3CL-DPE 2021", "DPE résidentiel", "DPE tertiaire", "Export XML ADEME"],
    website: "https://www.logiciels-perrenoud.com",
    integrationNotes: "Génère un fichier XML ADEME standard lors de la finalisation du rapport.",
    color: `var(--brand-500)`,
    popular: false,
  },
  {
    id: "batiaudit",
    name: "BATIAUDIT",
    publisher: "Logiciels Perrenoud",
    status: "valide",
    since: "2022",
    description: "Module audit énergétique complet pour les auditeurs RGE, complémentaire à DPEWIN.",
    features: ["Audit réglementaire", "Parcours accompagné", "Plans de rénovation", "MPR"],
    website: "https://www.logiciels-perrenoud.com",
    integrationNotes: "Export compatible avec le format d'échange ADEME via XML.",
    color: "#059669",
    popular: false,
  },
  {
    id: "liciel",
    name: "LICIEL DIAGNOSTICS",
    publisher: "LICIEL ENVIRONNEMENT",
    status: "valide",
    since: "2022",
    description: "Suite logicielle dédiée aux diagnostiqueurs immobiliers incluant le DPE 2021.",
    features: ["DPE 2021", "Amiante", "Électricité", "Export XML"],
    website: "https://www.liciel.fr",
    integrationNotes: "Export ADEME disponible dans la section DPE du logiciel.",
    color: "#f59e0b",
    popular: false,
  },
  {
    id: "windpe3",
    name: "WINDPE3",
    publisher: "OBBC DEVELOPPEMENT",
    status: "valide",
    since: "2022",
    description: "Logiciel Windows pour le DPE résidentiel avec calcul 3CL-DPE 2021 intégré.",
    features: ["3CL-DPE 2021", "DPE résidentiel", "Rapport ADEME", "Export XML"],
    website: null,
    integrationNotes: "Export XML depuis le menu export du logiciel.",
    color: "#6366f1",
    popular: false,
  },
  {
    id: "analysimmo",
    name: "ANALYSIMMO",
    publisher: "ATLIBITUM",
    status: "valide",
    since: "2022",
    description: "Plateforme SaaS de diagnostics immobiliers incluant le DPE 2021 et l'audit énergétique.",
    features: ["DPE 2021", "Audit énergétique", "SaaS", "API disponible"],
    website: null,
    integrationNotes: "Plateforme web — export XML ADEME depuis le tableau de bord.",
    color: "#ef4444",
    popular: false,
  },
  {
    id: "audit_expert",
    name: "AUDIT EXPERT",
    publisher: "OFFICE EXPERT",
    status: "valide",
    since: "2022",
    description: "Logiciel d'audit énergétique réglementaire pour les professionnels RGE.",
    features: ["Audit réglementaire", "RGE", "Plans de rénovation", "Export"],
    website: null,
    integrationNotes: "Export des données audit au format XML ADEME.",
    color: "#0891b2",
    popular: false,
  },
  {
    id: "argos",
    name: "ARGOS",
    publisher: "ITHAQUE",
    status: "valide",
    since: "2022",
    description: "Solution de calcul énergétique pour bureaux d'études et diagnostiqueurs.",
    features: ["3CL-DPE 2021", "Calcul thermique", "Audit", "Export"],
    website: null,
    integrationNotes: "Export XML standard depuis la section finalisation du rapport.",
    color: "#7c3aed",
    popular: false,
  },
  {
    id: "cap_renov",
    name: "CAP RENOV+",
    publisher: "PIA PRODUCTION",
    status: "valide",
    since: "2022",
    description: "Logiciel orienté rénovation énergétique avec calcul DPE et aide au chiffrage.",
    features: ["DPE 2021", "Rénovation", "Aides MPR", "Export XML"],
    website: null,
    integrationNotes: "Export ADEME disponible après finalisation du DPE.",
    color: "#d97706",
    popular: false,
  },
];

const INTEGRATION_MODES = [
  {
    id: "xml_import" as const,
    label: "Import fichier XML ADEME",
    desc: "Importez le fichier XML exporté par le logiciel agréé. Format standard ADEME — toutes les données DPE sont extraites automatiquement.",
    icon: Upload,
    color: `var(--brand-500)`,
  },
  {
    id: "dpe_number" as const,
    label: "Numéro de DPE (base ADEME)",
    desc: "Saisissez le numéro de DPE pour récupérer les données officielles depuis la base nationale ADEME. Le DPE doit avoir été transmis à l'ADEME par le diagnostiqueur.",
    icon: Hash,
    color: "#000091",
  },
  {
    id: "both" as const,
    label: "Les deux méthodes",
    desc: "Autorisez à la fois l'import XML et la récupération par numéro DPE selon la situation.",
    icon: RefreshCw,
    color: "#7C3AED",
  },
];

const LS_KEY = "software_config_v1";

function loadConfig(): SoftwareConfig {
  if (typeof window === "undefined") return { selectedSoftware: null, integrationMode: "both", autoImport: false, exportPath: "" };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { selectedSoftware: null, integrationMode: "both", autoImport: false, exportPath: "" };
}

function saveConfig(cfg: SoftwareConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LogicielsAgreesPage() {
  const [config, setConfig] = useState<SoftwareConfig>({ selectedSoftware: null, integrationMode: "both", autoImport: false, exportPath: "" });
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { setConfig(loadConfig()); }, []);

  function handleSave() {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const selected = VALIDATED_SOFTWARE.find(s => s.id === config.selectedSoftware);
  const displayed = showAll ? VALIDATED_SOFTWARE : VALIDATED_SOFTWARE.filter(s => s.popular).concat(VALIDATED_SOFTWARE.filter(s => !s.popular).slice(0, 3));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} style={{ color: `var(--brand-500)` }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: `var(--brand-500)` }}>Administration</p>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Logiciels d'audit agréés</h1>
            <p className="text-sm text-gray-500 max-w-xl">
              Sélectionnez le logiciel validé par le Ministère utilisé par vos diagnostiqueurs.
              ThermoPilot AI importera les DPE officiels produits par ce logiciel pour les associer à vos audits.
            </p>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-white flex-shrink-0 transition-colors"
            style={{ backgroundColor: saved ? "#16a34a" : `var(--brand-500)` }}
            onMouseEnter={e => { if (!saved) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-600)`; }}
            onMouseLeave={e => { if (!saved) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-500)`; }}>
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? "Enregistré !" : "Enregistrer"}
          </button>
        </div>

        {/* ── Banner réglementaire ────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-md mb-8 text-sm"
          style={{ backgroundColor: "#e8eeff", border: "1px solid #c5d0f5" }}>
          <Info size={15} style={{ color: "#000091", flexShrink: 0 }} className="mt-0.5" />
          <div className="text-gray-700 text-xs">
            <p className="font-semibold text-gray-900 mb-0.5">Cadre réglementaire — Arrêté du 4 mai 2022</p>
            <p>Seuls les logiciels évalués et validés par le Ministère chargé de la Construction peuvent produire un <strong>audit énergétique réglementaire</strong> (obligatoire pour MPR Accompagné, vente de passoires F/G). ThermoPilot AI ne remplace pas ces outils — il les complète en gérant le workflow, les aides et les rapports.</p>
            <a href="https://rt-re-batiment.developpement-durable.gouv.fr/evaluation-des-logiciels-audit-energetique-a782.html"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1.5 font-semibold underline" style={{ color: "#000091" }}>
              <ExternalLink size={11} /> Liste officielle des logiciels validés — Ministère de la Construction
            </a>
          </div>
        </div>

        {/* ── Étape 1 : Sélection du logiciel ─────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ backgroundColor: `var(--brand-500)` }}>1</span>
              Choisissez votre logiciel agréé
            </h2>
            <button onClick={() => setShowAll(v => !v)} className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              {showAll ? "Voir moins" : `Voir les ${VALIDATED_SOFTWARE.length} logiciels`}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayed.map(sw => {
              const isSelected = config.selectedSoftware === sw.id;
              return (
                <button key={sw.id} type="button"
                  onClick={() => setConfig(c => ({ ...c, selectedSoftware: isSelected ? null : sw.id }))}
                  className="relative flex items-start gap-4 p-4 rounded-md border-2 text-left transition-all hover:shadow-sm"
                  style={{
                    borderColor: isSelected ? sw.color : "#e0e0e0",
                    backgroundColor: isSelected ? sw.color + "08" : "#fff",
                  }}>
                  {/* Sélection indicator */}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                    style={{ borderColor: isSelected ? sw.color : "#d1d5db", backgroundColor: isSelected ? sw.color : "#fff" }}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">{sw.name}</span>
                      {sw.popular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: sw.color + "18", color: sw.color }}>
                          Populaire
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                        ✓ Validé
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1.5">{sw.publisher}</p>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{sw.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {sw.features.map(f => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{f}</span>
                      ))}
                    </div>
                  </div>

                  {sw.website && (
                    <a href={sw.website} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                      <ExternalLink size={13} />
                    </a>
                  )}
                </button>
              );
            })}
          </div>

          {!showAll && VALIDATED_SOFTWARE.length > displayed.length && (
            <button onClick={() => setShowAll(true)}
              className="mt-3 w-full py-2.5 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:bg-gray-50 transition-colors font-medium">
              + {VALIDATED_SOFTWARE.length - displayed.length} autres logiciels validés
            </button>
          )}
        </section>

        {/* ── Étape 2 : Mode d'intégration ───────────────────────── */}
        {config.selectedSoftware && (
          <section className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ backgroundColor: `var(--brand-500)` }}>2</span>
              Mode d'intégration avec ThermoPilot AI
            </h2>

            {selected && (
              <div className="flex items-start gap-3 p-4 rounded-md mb-4 text-xs"
                style={{ backgroundColor: "#f0faf4", border: "1px solid #c5e8d3" }}>
                <Info size={13} style={{ color: `var(--brand-500)`, flexShrink: 0 }} className="mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 mb-0.5">Comment exporter depuis {selected.name}</p>
                  <p className="text-gray-600">{selected.integrationNotes}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {INTEGRATION_MODES.map(mode => {
                const Icon = mode.icon;
                const isActive = config.integrationMode === mode.id;
                return (
                  <button key={mode.id} type="button"
                    onClick={() => setConfig(c => ({ ...c, integrationMode: mode.id }))}
                    className="w-full flex items-start gap-4 p-4 rounded-md border-2 text-left transition-all"
                    style={{
                      borderColor: isActive ? mode.color : "#e0e0e0",
                      backgroundColor: isActive ? mode.color + "08" : "#fff",
                    }}>
                    <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: mode.color + "15" }}>
                      <Icon size={18} style={{ color: mode.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{mode.label}</p>
                        {isActive && <CheckCircle2 size={14} style={{ color: mode.color }} />}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{mode.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Option auto-import */}
            <div className="mt-4 flex items-center justify-between p-4 rounded-md border border-gray-200 bg-white">
              <div>
                <p className="text-sm font-semibold text-gray-700">Pré-remplissage automatique</p>
                <p className="text-xs text-gray-400 mt-0.5">Lors de l'import DPE, pré-remplir automatiquement les champs de l'audit ThermoPilot AI (surface, classe, énergie).</p>
              </div>
              <button type="button" onClick={() => setConfig(c => ({ ...c, autoImport: !c.autoImport }))}
                className="w-11 h-6 rounded-full flex-shrink-0 transition-colors relative"
                style={{ backgroundColor: config.autoImport ? `var(--brand-500)` : "#e0e0e0" }}>
                <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                  style={{ left: config.autoImport ? "calc(100% - 22px)" : "2px" }} />
              </button>
            </div>
          </section>
        )}

        {/* ── Étape 3 : Tester l'intégration ─────────────────────── */}
        {config.selectedSoftware && (
          <section className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mr-2" style={{ backgroundColor: `var(--brand-500)` }}>3</span>
              Tester l'intégration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(config.integrationMode === "xml_import" || config.integrationMode === "both") && (
                <Link href="/admin/import-dpe?mode=xml"
                  className="flex items-center gap-4 p-5 rounded-md border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all group">
                  <Upload size={22} className="text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-700 group-hover:text-green-700 transition-colors">Importer un fichier XML</p>
                    <p className="text-xs text-gray-400 mt-0.5">Testez avec un export {selected?.name}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-green-500 ml-auto transition-colors" />
                </Link>
              )}
              {(config.integrationMode === "dpe_number" || config.integrationMode === "both") && (
                <Link href="/admin/import-dpe?mode=number"
                  className="flex items-center gap-4 p-5 rounded-md border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <Hash size={22} className="text-gray-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-gray-700 group-hover:text-blue-700 transition-colors">Rechercher par numéro DPE</p>
                    <p className="text-xs text-gray-400 mt-0.5">Interroge la base nationale ADEME</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 ml-auto transition-colors" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ── Récapitulatif ───────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900 text-sm">Configuration actuelle</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Logiciel sélectionné</span>
              {selected
                ? <span className="text-sm font-semibold" style={{ color: selected.color }}>{selected.name} — {selected.publisher}</span>
                : <span className="text-sm text-gray-400 flex items-center gap-1.5"><AlertTriangle size={13} />Non configuré</span>
              }
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mode d'intégration</span>
              <span className="text-sm font-semibold text-gray-700">
                {config.integrationMode === "xml_import" ? "Import XML" : config.integrationMode === "dpe_number" ? "Numéro DPE" : "XML + Numéro DPE"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pré-remplissage auto</span>
              <span className="text-sm font-semibold" style={{ color: config.autoImport ? `var(--brand-500)` : "#999" }}>
                {config.autoImport ? "Activé" : "Désactivé"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              {selected
                ? <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#16a34a" }}><CheckCircle2 size={14} />Prêt à l'utilisation</span>
                : <span className="flex items-center gap-1.5 text-sm text-gray-400"><Circle size={14} />En attente de configuration</span>
              }
            </div>
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center mt-6">
          Conformément à l'arrêté du 4 mai 2022 · Logiciels évalués par le Ministère chargé de la Construction ·{" "}
          <a href="https://rt-re-batiment.developpement-durable.gouv.fr/evaluation-des-logiciels-audit-energetique-a782.html"
            target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            Liste officielle
          </a>
        </p>
      </div>
    </AppLayout>
  );
}
