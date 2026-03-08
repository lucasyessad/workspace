"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { auditsApi, buildingsApi, exportsApi } from "@/lib/api";
import { Audit, Building } from "@/types";
import { formatNumber, AUDIT_STATUS_LABELS } from "@/lib/utils";
import { ClipboardList, Plus, FileDown } from "lucide-react";
import Link from "next/link";

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function handleExcelExport() {
    setExporting(true);
    try {
      const r = await exportsApi.downloadAuditsXlsx();
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `thermopilot_audits_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    Promise.all([auditsApi.list(), buildingsApi.listBuildings()])
      .then(([a, b]) => {
        setAudits(a.data);
        setBuildings(b.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audits énergétiques</h1>
            <p className="text-gray-500 mt-1">{audits.length} audit(s)</p>
          </div>
          <div className="flex gap-2">
            {audits.filter(a => a.status === "completed").length > 0 && (
              <button
                className="btn-secondary"
                onClick={handleExcelExport}
                disabled={exporting}
              >
                <FileDown size={16} />
                {exporting ? "Export..." : "Export Excel"}
              </button>
            )}
            <Link href="/audits/new" className="btn-primary">
              <Plus size={16} />
              Nouvel audit
            </Link>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : audits.length === 0 ? (
            <div className="p-16 text-center">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun audit</h3>
              <p className="text-gray-500 mb-6">Commencez par créer un bâtiment puis lancez un audit</p>
              <Link href="/audits/new" className="btn-primary">Créer un audit</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Bâtiment</th>
                  <th className="px-5 py-3 text-center text-gray-500 font-medium">Classe</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">Énergie primaire</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">CO₂</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">Coût/an</th>
                  <th className="px-5 py-3 text-center text-gray-500 font-medium">Statut</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {audits.map((audit) => {
                  const building = buildings.find((b) => b.id === audit.building_id);
                  const snap = audit.result_snapshot;
                  const st = AUDIT_STATUS_LABELS[audit.status] ?? { label: audit.status, color: "bg-gray-100" };
                  return (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{building?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-center">
                        <EnergyLabel label={audit.computed_energy_label} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {snap ? `${formatNumber(snap.primary_energy_per_m2)} kWhpe/m²` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {snap ? `${formatNumber(snap.co2_per_m2, 1)} kg/m²` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {snap ? `${formatNumber(snap.estimated_annual_cost_eur)} €` : "—"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400">
                        {new Date(audit.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/audits/${audit.id}`} className="text-brand-600 hover:text-brand-700">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
