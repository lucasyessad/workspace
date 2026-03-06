"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { auditsApi, buildingsApi, scenariosApi, reportsApi } from "@/lib/api";
import { Audit, Building, SimulationResult } from "@/types";
import { formatNumber, MEASURE_LABELS } from "@/lib/utils";
import { ChevronLeft, Play, TrendingUp, FileText, Download } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AuditDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    auditsApi.get(id).then((r) => {
      setAudit(r.data);
      buildingsApi.getBuilding(r.data.building_id).then((b) => setBuilding(b.data));
    });
  }, [id]);

  async function runCalculation() {
    setCalculating(true);
    try {
      const r = await auditsApi.calculate(id);
      setAudit(r.data);
    } finally {
      setCalculating(false);
    }
  }

  async function runSimulation() {
    setSimulating(true);
    try {
      const r = await scenariosApi.simulate(id);
      setSimulations(r.data.simulations);
    } finally {
      setSimulating(false);
    }
  }

  async function downloadPdf() {
    setGenerating(true);
    try {
      const rep = await reportsApi.create({ audit_id: id, report_type: "audit_complet" });
      const pdf = await reportsApi.downloadPdf(rep.data.id);
      const url = window.URL.createObjectURL(new Blob([pdf.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_${id}.pdf`;
      a.click();
    } finally {
      setGenerating(false);
    }
  }

  if (!audit) return <AppLayout><div className="p-8 text-gray-400">Chargement...</div></AppLayout>;

  const snap = audit.result_snapshot;
  const chartData = snap ? [
    { name: "Chauffage", kwh: snap.heating_kwh, fill: "#3b82f6" },
    { name: "ECS", kwh: snap.ecs_kwh, fill: "#10b981" },
    { name: "Ventilation", kwh: snap.ventilation_kwh, fill: "#f59e0b" },
  ] : [];

  return (
    <AppLayout>
      <div className="p-8">
        <Link href="/audits" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Retour aux audits
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Audit — {building?.name ?? "…"}
            </h1>
            <p className="text-gray-500 mt-1 capitalize">
              Type : {audit.audit_type} · Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex gap-2">
            {!snap && (
              <button className="btn-primary" onClick={runCalculation} disabled={calculating}>
                <Play size={16} />
                {calculating ? "Calcul en cours..." : "Lancer le calcul"}
              </button>
            )}
            {snap && (
              <>
                <button className="btn-secondary" onClick={runSimulation} disabled={simulating}>
                  <TrendingUp size={16} />
                  {simulating ? "Simulation..." : "Simuler les travaux"}
                </button>
                <button className="btn-secondary" onClick={downloadPdf} disabled={generating}>
                  <Download size={16} />
                  {generating ? "Génération..." : "Télécharger PDF"}
                </button>
              </>
            )}
          </div>
        </div>

        {!snap ? (
          <div className="card p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Lancez le calcul pour obtenir les résultats énergétiques</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5 text-center">
                <p className="text-xs text-gray-500 mb-2">Classe DPE</p>
                <EnergyLabel label={snap.energy_label} size="lg" />
              </div>
              <div className="card p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Énergie primaire</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(snap.primary_energy_per_m2)}</p>
                <p className="text-xs text-gray-400">kWhpe/m²/an</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Émissions CO₂</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(snap.co2_per_m2, 1)}</p>
                <p className="text-xs text-gray-400">kgCO₂/m²/an</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Coût estimé</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(snap.estimated_annual_cost_eur)}</p>
                <p className="text-xs text-gray-400">€/an</p>
              </div>
            </div>

            {/* Chart */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Répartition des consommations</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" unit=" kWh" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${formatNumber(v)} kWh`, ""]} />
                  <Bar dataKey="kwh" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Simulations */}
            {simulations.length > 0 && (
              <div className="card">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Simulations de travaux</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Classées par économies d&apos;énergie décroissantes</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {simulations.map((sim) => (
                    <div key={sim.measure_type} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {MEASURE_LABELS[sim.measure_type] ?? sim.measure_type}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Économie : {formatNumber(sim.energy_savings_kwh)} kWh/an
                          ({formatNumber(sim.energy_savings_percent, 1)}%)
                          · CO₂ : -{formatNumber(sim.co2_savings_kg)} kg
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(sim.estimated_cost_eur)} €</p>
                        <p className="text-xs text-gray-400">{sim.simple_payback_years} ans de retour</p>
                      </div>
                      <EnergyLabel label={sim.new_energy_label} size="sm" />
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100">
                  <Link
                    href={`/scenarios/new?audit_id=${id}`}
                    className="btn-primary"
                  >
                    <TrendingUp size={16} />
                    Créer un scénario de rénovation
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
