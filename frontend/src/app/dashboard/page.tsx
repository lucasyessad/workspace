"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/ui/StatCard";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { auditsApi, buildingsApi } from "@/lib/api";
import { Audit, Building } from "@/types";
import { formatNumber, AUDIT_STATUS_LABELS } from "@/lib/utils";
import { Building2, ClipboardList, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([auditsApi.list(), buildingsApi.listBuildings()])
      .then(([a, b]) => {
        setAudits(a.data);
        setBuildings(b.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedAudits = audits.filter((a) => a.status === "completed");
  const totalSavings = completedAudits.reduce(
    (sum, a) => sum + (a.result_snapshot?.estimated_annual_cost_eur ?? 0),
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
          <StatCard
            title="Bâtiments"
            value={buildings.length}
            icon={Building2}
            color="blue"
          />
          <StatCard
            title="Audits réalisés"
            value={completedAudits.length}
            icon={ClipboardList}
            color="green"
          />
          <StatCard
            title="Audits en cours"
            value={audits.filter((a) => a.status === "draft").length}
            icon={TrendingUp}
            color="orange"
          />
          <StatCard
            title="Coût énergétique total"
            value={formatNumber(totalSavings)}
            unit="€/an"
            icon={Zap}
            color="red"
          />
        </div>

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
