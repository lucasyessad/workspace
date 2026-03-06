"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/ui/StatCard";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { auditsApi, buildingsApi, scenariosApi } from "@/lib/api";
import { Audit, Building, RenovationScenario } from "@/types";
import { formatNumber, AUDIT_STATUS_LABELS } from "@/lib/utils";
import { Building2, ClipboardList, TrendingUp, Zap, Leaf } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LABEL_COLORS: Record<string, string> = {
  A: "#00a84f",
  B: "#52b748",
  C: "#c8d200",
  D: "#f7e400",
  E: "#f0a500",
  F: "#e8500a",
  G: "#cc0000",
};

export default function DashboardPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [scenarios, setScenarios] = useState<RenovationScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([auditsApi.list(), buildingsApi.listBuildings(), scenariosApi.list()])
      .then(([a, b, s]) => {
        setAudits(a.data);
        setBuildings(b.data);
        setScenarios(s.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedAudits = audits.filter((a) => a.status === "completed");
  const totalEnergyCost = completedAudits.reduce(
    (sum, a) => sum + (a.result_snapshot?.estimated_annual_cost_eur ?? 0),
    0
  );
  const totalCo2 = completedAudits.reduce(
    (sum, a) => sum + (a.result_snapshot?.co2_per_m2 ?? 0),
    0
  );

  // Label distribution for pie chart
  const labelCounts: Record<string, number> = {};
  completedAudits.forEach((a) => {
    const l = a.computed_energy_label ?? "?";
    labelCounts[l] = (labelCounts[l] ?? 0) + 1;
  });
  const labelData = Object.entries(labelCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Consumption breakdown (average across completed audits)
  const avgHeating =
    completedAudits.reduce((s, a) => s + (a.result_snapshot?.heating_kwh ?? 0), 0) /
    (completedAudits.length || 1);
  const avgEcs =
    completedAudits.reduce((s, a) => s + (a.result_snapshot?.ecs_kwh ?? 0), 0) /
    (completedAudits.length || 1);
  const avgVent =
    completedAudits.reduce((s, a) => s + (a.result_snapshot?.ventilation_kwh ?? 0), 0) /
    (completedAudits.length || 1);
  const breakdownData = [
    { name: "Chauffage", kwh: Math.round(avgHeating), fill: "#3b82f6" },
    { name: "ECS", kwh: Math.round(avgEcs), fill: "#f59e0b" },
    { name: "Ventilation", kwh: Math.round(avgVent), fill: "#10b981" },
  ];

  // Scenarios savings potential
  const totalSavingsKwh = scenarios.reduce(
    (s, sc) => s + (sc.estimated_energy_savings_kwh ?? 0),
    0
  );

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d&apos;ensemble de vos analyses énergétiques</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Bâtiments" value={buildings.length} icon={Building2} color="blue" />
          <StatCard
            title="Audits réalisés"
            value={completedAudits.length}
            icon={ClipboardList}
            color="green"
          />
          <StatCard
            title="Coût énergétique estimé"
            value={formatNumber(totalEnergyCost)}
            unit="€/an"
            icon={Zap}
            color="orange"
          />
          <StatCard
            title="CO₂ moyen"
            value={
              completedAudits.length
                ? formatNumber(totalCo2 / completedAudits.length, 1)
                : "—"
            }
            unit="kgCO₂/m²"
            icon={Leaf}
            color="red"
          />
        </div>

        {/* Charts row */}
        {completedAudits.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Label distribution */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4">
                Répartition des classes DPE
              </h2>
              {labelData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucun audit complété</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={labelData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ label, count }) => `${label} (${count})`}
                    >
                      {labelData.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={LABEL_COLORS[entry.label] ?? "#888"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} audit(s)`, "Nombre"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Consumption breakdown */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-1">
                Répartition moyenne des consommations
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Moyenne sur {completedAudits.length} audit(s) — kWh/an
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={breakdownData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`${formatNumber(v)} kWh`, ""]} />
                  <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                    {breakdownData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Scenarios summary */}
        {scenarios.length > 0 && (
          <div className="card p-5 mb-8 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-green-800">
                  Potentiel d&apos;économies identifié
                </h2>
                <p className="text-sm text-green-600 mt-0.5">
                  {scenarios.length} scénario(s) de rénovation créé(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-700">
                  {formatNumber(totalSavingsKwh)} kWh/an
                </p>
                <p className="text-sm text-green-600">économies potentielles</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent audits */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Audits récents</h2>
            <Link href="/audits" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Voir tout →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : audits.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun audit pour l&apos;instant</p>
              <Link href="/audits/new" className="btn-primary mt-4 inline-flex">
                Créer un audit
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {audits.slice(0, 8).map((audit) => {
                const statusInfo = AUDIT_STATUS_LABELS[audit.status] ?? {
                  label: audit.status,
                  color: "bg-gray-100 text-gray-700",
                };
                const building = buildings.find((b) => b.id === audit.building_id);
                return (
                  <div
                    key={audit.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <EnergyLabel label={audit.computed_energy_label} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {building?.name ?? "Bâtiment inconnu"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(audit.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {audit.result_snapshot && (
                        <span className="text-sm text-gray-500">
                          {formatNumber(audit.result_snapshot.primary_energy_per_m2, 0)} kWhpe/m²
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <Link
                        href={`/audits/${audit.id}`}
                        className="text-sm text-brand-600 hover:text-brand-700"
                      >
                        Voir →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/buildings/new"
            className="card p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <Building2 size={24} className="text-brand-500 mb-2" />
            <p className="font-semibold text-gray-900">Nouveau bâtiment</p>
            <p className="text-sm text-gray-500 mt-1">Ajouter un bâtiment à analyser</p>
          </Link>
          <Link
            href="/audits/new"
            className="card p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
          >
            <ClipboardList size={24} className="text-green-500 mb-2" />
            <p className="font-semibold text-gray-900">Lancer un audit</p>
            <p className="text-sm text-gray-500 mt-1">Calculer la performance énergétique</p>
          </Link>
          <Link
            href="/reports"
            className="card p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
          >
            <TrendingUp size={24} className="text-orange-500 mb-2" />
            <p className="font-semibold text-gray-900">Générer un rapport</p>
            <p className="text-sm text-gray-500 mt-1">Exporter un PDF pour l&apos;assemblée</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
