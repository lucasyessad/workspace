"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { reportsApi, auditsApi } from "@/lib/api";
import { GeneratedReport, Audit } from "@/types";
import { FileText, Download, Plus } from "lucide-react";
import Link from "next/link";

const REPORT_TYPE_LABELS: Record<string, string> = {
  audit_complet: "Rapport d'audit complet",
  synthese_ag: "Synthèse pour l'AG",
  comparatif_scenarios: "Comparatif des scénarios",
  fiche_travaux: "Fiche travaux",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([reportsApi.list(), auditsApi.list()])
      .then(([r, a]) => {
        setReports(r.data);
        setAudits(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(reportId: string) {
    setGenerating(reportId);
    try {
      const r = await reportsApi.downloadPdf(reportId);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_${reportId.slice(0, 8)}.pdf`;
      a.click();
    } finally {
      setGenerating(null);
    }
  }

  async function createAndDownload(auditId: string, reportType: string) {
    setGenerating("new");
    try {
      const rep = await reportsApi.create({ audit_id: auditId, report_type: reportType });
      const newReport = rep.data;
      setReports((r) => [newReport, ...r]);
      await handleDownload(newReport.id);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500 mt-1">Générez et téléchargez vos rapports PDF</p>
        </div>

        {/* Quick generate */}
        {audits.filter((a) => a.status === "completed").length > 0 && (
          <div className="card p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">Générer un rapport rapide</h2>
            <div className="flex flex-wrap gap-3">
              {audits.filter((a) => a.status === "completed").slice(0, 3).map((audit) => (
                <div key={audit.id} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">Audit {audit.id.slice(0, 8)}</p>
                    <p className="text-gray-400 text-xs">Classe {audit.computed_energy_label ?? "?"}</p>
                  </div>
                  <button
                    className="btn-primary text-xs py-1.5"
                    onClick={() => createAndDownload(audit.id, "audit_complet")}
                    disabled={generating === "new"}
                  >
                    <Download size={13} />
                    PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports list */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Rapports générés</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun rapport généré</p>
              <p className="text-sm text-gray-400 mt-1">
                Lancez un audit et cliquez sur &quot;Télécharger PDF&quot;
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reports.map((r) => {
                const audit = audits.find((a) => a.id === r.audit_id);
                return (
                  <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText size={18} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {REPORT_TYPE_LABELS[r.report_type] ?? r.report_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {audit ? `Audit ${audit.id.slice(0, 8)}` : "—"} ·{" "}
                          {new Date(r.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === "ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {r.status === "ready" ? "Prêt" : r.status}
                      </span>
                      <button
                        className="btn-secondary text-xs py-1.5"
                        onClick={() => handleDownload(r.id)}
                        disabled={generating === r.id}
                      >
                        <Download size={14} />
                        {generating === r.id ? "..." : "Télécharger"}
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
