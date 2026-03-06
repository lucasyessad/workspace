"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import { buildingsApi, auditsApi } from "@/lib/api";
import { Building, System, Envelope, Audit } from "@/types";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

export default function BuildingDetailPage() {
  const { id } = useParams() as { id: string };
  const [building, setBuilding] = useState<Building | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    buildingsApi.getBuilding(id).then((r) => setBuilding(r.data));
    buildingsApi.listSystems(id).then((r) => setSystems(r.data));
    buildingsApi.listEnvelopes(id).then((r) => setEnvelopes(r.data));
    auditsApi.list().then((r) => {
      setAudits(r.data.filter((a: Audit) => a.building_id === id));
    });
  }, [id]);

  if (!building) return <AppLayout><div className="p-8 text-gray-400">Chargement...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-8">
        <Link href="/buildings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Retour aux bâtiments
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
              <EnergyLabel label={building.current_energy_label} />
            </div>
            <p className="text-gray-500">
              {building.address_line_1}{building.city ? ` — ${building.postal_code} ${building.city}` : ""}
            </p>
          </div>
          <Link href={`/audits/new?building_id=${id}`} className="btn-primary">
            <Plus size={16} />
            Lancer un audit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fiche technique */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Fiche technique</h2>
              <dl className="space-y-3 text-sm">
                {[
                  ["Année de construction", building.construction_year],
                  ["Surface chauffée", building.heated_area_m2 ? `${building.heated_area_m2} m²` : null],
                  ["Étages", building.floors_above_ground],
                  ["Type", building.building_type],
                  ["Régime", building.ownership_type],
                ].map(([k, v]) => v && (
                  <div key={String(k)} className="flex justify-between">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="font-medium text-gray-900">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Systems */}
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Systèmes techniques</h2>
              {systems.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun système renseigné</p>
              ) : (
                <ul className="space-y-2">
                  {systems.map((s) => (
                    <li key={s.id} className="text-sm">
                      <span className="font-medium capitalize">{s.system_type}</span>
                      <span className="text-gray-500"> — {s.energy_source ?? "—"}</span>
                      {s.nominal_power_kw && (
                        <span className="text-gray-400"> · {s.nominal_power_kw} kW</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Envelopes + Audits */}
          <div className="lg:col-span-2 space-y-4">
            {/* Envelopes */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Enveloppe thermique</h2>
              </div>
              {envelopes.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun élément d&apos;enveloppe renseigné</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-500 font-medium">Élément</th>
                      <th className="px-4 py-2 text-right text-gray-500 font-medium">Surface</th>
                      <th className="px-4 py-2 text-right text-gray-500 font-medium">U (W/m².K)</th>
                      <th className="px-4 py-2 text-center text-gray-500 font-medium">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {envelopes.map((e) => (
                      <tr key={e.id}>
                        <td className="px-4 py-2 capitalize font-medium">{e.element_type}</td>
                        <td className="px-4 py-2 text-right">{e.surface_m2 ? `${e.surface_m2} m²` : "—"}</td>
                        <td className="px-4 py-2 text-right">{e.u_value ?? "—"}</td>
                        <td className="px-4 py-2 text-center text-xs text-gray-500 capitalize">{e.condition_state ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Audits */}
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Audits</h2>
                <Link href={`/audits/new?building_id=${id}`} className="btn-secondary text-xs py-1.5">
                  <Plus size={14} />
                  Nouvel audit
                </Link>
              </div>
              {audits.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">Aucun audit</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {audits.map((a) => (
                    <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <EnergyLabel label={a.computed_energy_label} size="sm" />
                        <div>
                          <p className="text-sm font-medium">Audit {a.audit_type}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(a.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.result_snapshot && (
                          <span className="text-sm text-gray-500">
                            {formatNumber(a.result_snapshot.primary_energy_per_m2)} kWhpe/m²
                          </span>
                        )}
                        <Link href={`/audits/${a.id}`} className="text-sm text-brand-600">Voir →</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
