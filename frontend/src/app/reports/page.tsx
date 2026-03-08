"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { reportsApi, auditsApi, buildingsApi } from "@/lib/api";
import { GeneratedReport, Audit, Building } from "@/types";
import {
  FileText, Download, CheckCircle, Building2, AlertTriangle, Info,
} from "lucide-react";

// ─── Types de rapports disponibles ────────────────────────────────────────────

interface ReportTypeDef {
  id: string;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  anah: boolean;   // conforme ANAH
  ag: boolean;     // pour AG copropriété
}

const REPORT_TYPES: ReportTypeDef[] = [
  {
    id:          "audit_complet",
    label:       "Rapport d'audit complet",
    description: "Rapport ANAH-conforme avec toutes les sections réglementaires : DPE, aides MPR/CEE/Éco-PTZ, scénarios de travaux et déclaration réglementaire (Arrêté du 4 mai 2022).",
    badge:       "ANAH-conforme",
    badgeColor:  "#18753c",
    icon:        FileText,
    anah:        true,
    ag:          false,
  },
  {
    id:          "synthese_ag",
    label:       "Synthèse Assemblée Générale",
    description: "Document simplifié destiné aux copropriétaires : état DPE actuel vs cible, coûts, aides copropriété, quote-part indicative et proposition de résolution (Art. 25 loi 1965).",
    badge:       "Copropriété",
    badgeColor:  "#000091",
    icon:        Building2,
    anah:        false,
    ag:          true,
  },
  {
    id:          "comparatif_scenarios",
    label:       "Comparatif des scénarios",
    description: "Tableau comparatif de tous les scénarios de rénovation définis : coûts, économies d'énergie, retour sur investissement et classe DPE visée.",
    badge:       "Scénarios",
    badgeColor:  "#7C3AED",
    icon:        FileText,
    anah:        false,
    ag:          false,
  },
  {
    id:          "fiche_travaux",
    label:       "Fiche travaux détaillée",
    description: "Rapport d'audit complet avec focus sur les gestes de travaux, les artisans RGE recommandés et les montages financiers.",
    badge:       "Travaux",
    badgeColor:  "#D97706",
    icon:        FileText,
    anah:        true,
    ag:          false,
  },
];

const TYPE_MAP = Object.fromEntries(REPORT_TYPES.map(t => [t.id, t]));

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reports,   setReports]   = useState<GeneratedReport[]>([]);
  const [audits,    setAudits]    = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [loading,   setLoading]   = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  // Sélection pour la génération rapide
  const [selAuditId, setSelAuditId]   = useState("");
  const [selTypeId,  setSelTypeId]    = useState("audit_complet");

  useEffect(() => {
    Promise.all([reportsApi.list(), auditsApi.list(), buildingsApi.listBuildings()])
      .then(([r, a, b]) => {
        setReports(r.data);
        const completedAudits = a.data.filter((x: Audit) => x.status === "completed");
        setAudits(completedAudits);
        if (completedAudits.length > 0) setSelAuditId(completedAudits[0].id);
        const map: Record<string, Building> = {};
        for (const bld of b.data) map[bld.id] = bld;
        setBuildings(map);
      })
      .finally(() => setLoading(false));
  }, []);

  function getBuildingName(auditId?: string | null): string {
    const audit = audits.find((a) => a.id === auditId);
    if (!audit) return "inconnu";
    return buildings[audit.building_id]?.name ?? "inconnu";
  }

  async function handleDownload(reportId: string, auditId?: string | null) {
    setGenerating(reportId);
    try {
      const r = await reportsApi.downloadPdf(reportId);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a   = document.createElement("a");
      a.href    = url;
      const slug = getBuildingName(auditId).toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
      a.download = `rapport_${slug}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setGenerating(null);
    }
  }

  async function createAndDownload() {
    if (!selAuditId) return;
    setGenerating("new");
    try {
      const rep      = await reportsApi.create({ audit_id: selAuditId, report_type: selTypeId });
      const newReport: GeneratedReport = rep.data;
      setReports((prev) => [newReport, ...prev]);
      await handleDownload(newReport.id, selAuditId);
    } finally {
      setGenerating(null);
    }
  }

  const selType = TYPE_MAP[selTypeId] ?? REPORT_TYPES[0];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        {/* ── En-tête ────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Rapports PDF</h1>
          <p className="text-gray-500 mt-1">
            Générez des rapports conformes aux exigences ANAH, copropriété et réglementaires.
          </p>
        </div>

        {/* ── Bandeau conformité ─────────────────────────────────────── */}
        <div className="flex items-start gap-3 p-4 rounded-md mb-6" style={{ backgroundColor: "#e8f5ee", border: "1px solid #c5e8d3" }}>
          <CheckCircle size={16} style={{ color: "#18753c", flexShrink: 0 }} className="mt-0.5" />
          <div className="text-xs text-gray-700 space-y-0.5">
            <p className="font-semibold text-gray-900">Rapports conformes aux exigences réglementaires</p>
            <p>
              Les rapports <strong>ANAH-conformes</strong> incluent toutes les sections obligatoires de l'Arrêté du 4 mai 2022
              (identification, DPE, scénarios de travaux, aides MPR/CEE/Éco-PTZ, clause de responsabilité).
              La <strong>Synthèse AG</strong> est formatée pour les assemblées générales de copropriété (loi du 10 juillet 1965, art. 25).
            </p>
            <p className="mt-1 text-gray-500">
              <strong>Important :</strong> Ces documents sont indicatifs. Un DPE officiel ne peut être établi
              que par un diagnostiqueur certifié COFRAC — <a href="https://france-renov.gouv.fr/diagnostiqueurs" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#18753c" }}>France Rénov' →</a>
            </p>
          </div>
        </div>

        {/* ── Générateur rapide ──────────────────────────────────────── */}
        {loading ? (
          <div className="card p-6 mb-6 text-center text-gray-400 text-sm">Chargement des audits…</div>
        ) : audits.length > 0 ? (
          <div className="card p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Générer un rapport</h2>

            {/* Sélection du type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {REPORT_TYPES.map(rt => {
                const Icon = rt.icon;
                const sel  = selTypeId === rt.id;
                return (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setSelTypeId(rt.id)}
                    className="text-left p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor:     sel ? rt.badgeColor : "#e0e0e0",
                      backgroundColor: sel ? rt.badgeColor + "10" : "#fff",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={14} style={{ color: sel ? rt.badgeColor : "#999" }} />
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: rt.badgeColor }}
                      >
                        {rt.badge}
                      </span>
                      {rt.anah && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: "#e8f5ee", color: "#18753c" }}>
                          ANAH
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: sel ? rt.badgeColor : "#374151" }}>
                      {rt.label}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Description du type sélectionné */}
            <div className="flex items-start gap-2 p-3 rounded text-xs mb-4" style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <Info size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{selType.description}</p>
            </div>

            {/* Sélection de l'audit + bouton */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Audit source</label>
                <select
                  value={selAuditId}
                  onChange={e => setSelAuditId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {audits.map(a => (
                    <option key={a.id} value={a.id}>
                      {buildings[a.building_id]?.name ?? `Audit ${a.id.slice(0, 8)}`}
                      {a.computed_energy_label ? ` — Classe ${a.computed_energy_label}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={createAndDownload}
                disabled={!selAuditId || generating !== null}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold text-white disabled:opacity-40 whitespace-nowrap"
                style={{ backgroundColor: selType.badgeColor }}
              >
                <Download size={14} />
                {generating === "new" ? "Génération…" : `Générer le PDF`}
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-6 mb-6 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-800">Aucun audit terminé</p>
              <p className="text-gray-500 mt-0.5">Complétez un audit pour pouvoir générer un rapport PDF.</p>
            </div>
          </div>
        )}

        {/* ── Historique des rapports ────────────────────────────────── */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Rapports générés</h2>
            {reports.length > 0 && (
              <span className="text-xs text-gray-400">{reports.length} rapport{reports.length > 1 ? "s" : ""}</span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement…</div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun rapport généré</p>
              <p className="text-sm text-gray-400 mt-1">Utilisez le formulaire ci-dessus pour créer votre premier rapport.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reports.map((r) => {
                const typeDef   = TYPE_MAP[r.report_type];
                const Icon      = typeDef?.icon ?? FileText;
                const badgeColor = typeDef?.badgeColor ?? "#6b7280";
                const audit     = audits.find((a) => a.id === r.audit_id);
                return (
                  <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: badgeColor + "15" }}
                      >
                        <Icon size={17} style={{ color: badgeColor }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">
                            {typeDef?.label ?? r.report_type}
                          </p>
                          {typeDef?.anah && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: "#e8f5ee", color: "#18753c" }}>
                              ANAH
                            </span>
                          )}
                          {typeDef?.ag && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ backgroundColor: "#e8eeff", color: "#000091" }}>
                              AG
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {audit
                            ? (buildings[audit.building_id]?.name ?? `Audit ${audit.id.slice(0, 8)}`)
                            : "—"}{" "}
                          · {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === "ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {r.status === "ready" ? "Prêt" : r.status}
                      </span>
                      <button
                        className="btn-secondary text-xs py-1.5"
                        onClick={() => handleDownload(r.id, r.audit_id ?? undefined)}
                        disabled={generating === r.id}
                      >
                        <Download size={13} />
                        {generating === r.id ? "…" : "Télécharger"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
