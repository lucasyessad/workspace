"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { scenariosApi } from "@/lib/api";
import { RenovationScenario } from "@/types";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<RenovationScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scenariosApi.list().then((r) => setScenarios(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scénarios de rénovation</h1>
            <p className="text-gray-500 mt-1">{scenarios.length} scénario(s)</p>
          </div>
          <Link href="/scenarios/new" className="btn-primary">
            <Plus size={16} />
            Nouveau scénario
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : scenarios.length === 0 ? (
          <div className="card p-16 text-center">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun scénario</h3>
            <p className="text-gray-500 mb-6">Créez un scénario depuis la page d&apos;un audit</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((s) => (
              <div key={s.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">{s.scenario_type}</p>
                  </div>
                  <EnergyLabel label={s.target_energy_label} size="sm" />
                </div>
                <dl className="space-y-2 text-sm">
                  {s.estimated_total_cost_eur && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Coût total</dt>
                      <dd className="font-semibold">{formatNumber(s.estimated_total_cost_eur)} €</dd>
                    </div>
                  )}
                  {s.estimated_energy_savings_kwh && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Économies</dt>
                      <dd className="font-semibold text-green-600">
                        {formatNumber(s.estimated_energy_savings_kwh)} kWh/an
                      </dd>
                    </div>
                  )}
                  {s.simple_payback_years && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Retour sur invest.</dt>
                      <dd className="font-semibold">{s.simple_payback_years} ans</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link href={`/audits/${s.audit_id}`} className="text-sm text-brand-600 hover:text-brand-700">
                    Voir l&apos;audit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
