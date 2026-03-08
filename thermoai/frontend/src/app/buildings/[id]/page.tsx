"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import EnergyLabel from "@/components/ui/EnergyLabel";
import AddSystemForm from "@/components/forms/AddSystemForm";
import AddEnvelopeForm from "@/components/forms/AddEnvelopeForm";
import AddBillForm from "@/components/forms/AddBillForm";
import { useToastContext } from "@/components/ui/ToastProvider";
import { buildingsApi, auditsApi } from "@/lib/api";
import { Building, System, Envelope, Audit } from "@/types";
import { ChevronLeft, Plus, MapPin, Calendar, Thermometer, Layers, FileText, Receipt } from "lucide-react";
import Link from "next/link";
import { formatNumber, cn } from "@/lib/utils";

type Tab = "systems" | "envelope" | "bills" | "audits";

interface EnergyBillRow {
  id: string;
  billing_period_start: string;
  billing_period_end: string;
  energy_type: string;
  consumption_kwh?: number;
  cost_eur_ttc?: number;
}

export default function BuildingDetailPage() {
  const { id } = useParams() as { id: string };
  const toast = useToastContext();
  const [building, setBuilding] = useState<Building | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [bills, setBills] = useState<EnergyBillRow[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [tab, setTab] = useState<Tab>("systems");

  useEffect(() => {
    buildingsApi.getBuilding(id).then((r) => setBuilding(r.data));
    buildingsApi.listSystems(id).then((r) => setSystems(r.data));
    buildingsApi.listEnvelopes(id).then((r) => setEnvelopes(r.data));
    buildingsApi.listBills(id).then((r) => setBills(r.data));
    auditsApi.list().then((r) => {
      setAudits(r.data.filter((a: Audit) => a.building_id === id));
    });
  }, [id]);

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "systems", label: "Systèmes", icon: Thermometer, count: systems.length },
    { key: "envelope", label: "Enveloppe", icon: Layers, count: envelopes.length },
    { key: "bills", label: "Factures", icon: Receipt, count: bills.length },
    { key: "audits", label: "Audits", icon: FileText, count: audits.length },
  ];

  if (!building) {
    return (
      <AppLayout>
        <div className="p-8 text-gray-400">Chargement...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8">
        <Link href="/buildings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Retour aux bâtiments
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{building.name}</h1>
              <EnergyLabel label={building.current_energy_label} />
              {building.current_ghg_label && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                  GES {building.current_ghg_label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {building.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {building.postal_code} {building.city}
                </span>
              )}
              {building.construction_year && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Construit en {building.construction_year}
                </span>
              )}
              {building.heated_area_m2 && <span>{building.heated_area_m2} m² chauffés</span>}
            </div>
          </div>
          <Link href={`/audits/new?building_id=${id}`} className="btn-primary">
            <Plus size={16} />
            Lancer un audit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar info */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Fiche technique
              </h2>
              <dl className="space-y-3 text-sm">
                {[
                  ["Type", building.building_type],
                  ["Régime", building.ownership_type],
                  ["Étages", building.floors_above_ground],
                  ["Surface", building.heated_area_m2 ? `${building.heated_area_m2} m²` : null],
                  ["Construction", building.construction_year],
                ]
                  .filter(([, v]) => v != null)
                  .map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <dt className="text-gray-500 capitalize">{k}</dt>
                      <dd className="font-medium text-gray-900 capitalize">{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>

          {/* Main content with tabs */}
          <div className="lg:col-span-3">
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-gray-200 mb-4">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                      tab === t.key
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <Icon size={15} />
                    {t.label}
                    {t.count !== undefined && t.count > 0 && (
                      <span
                        className={cn(
                          "text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                          tab === t.key
                            ? "bg-brand-100 text-brand-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Systèmes ─────────────────────────────────────────── */}
            {tab === "systems" && (
              <div className="space-y-3">
                {systems.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Aucun système renseigné</p>
                )}
                {systems.map((s) => (
                  <div key={s.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{s.system_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s.energy_source ?? "—"}
                        {s.brand ? ` · ${s.brand}` : ""}
                        {s.installation_year ? ` · ${s.installation_year}` : ""}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {s.nominal_power_kw && <p>{s.nominal_power_kw} kW</p>}
                      {s.efficiency_nominal && (
                        <p className="text-xs">
                          {(Number(s.efficiency_nominal) * 100).toFixed(0)}% rendement
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <AddSystemForm
                  buildingId={id}
                  onAdded={(sys) => {
                    setSystems((s) => [...s, sys]);
                    toast.success("Système ajouté avec succès");
                  }}
                />
              </div>
            )}

            {/* ── Enveloppe ────────────────────────────────────────── */}
            {tab === "envelope" && (
              <div className="space-y-3">
                {envelopes.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Aucun élément d&apos;enveloppe renseigné
                  </p>
                )}
                {envelopes.map((e) => (
                  <div key={e.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{e.element_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {e.orientation ? `Orientation : ${e.orientation} · ` : ""}
                        {e.insulation_type ?? "Sans isolation renseignée"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-right">
                      {e.surface_m2 && <span className="text-gray-600">{e.surface_m2} m²</span>}
                      {e.u_value && (
                        <span
                          className={cn(
                            "font-mono font-semibold",
                            Number(e.u_value) > 2
                              ? "text-red-500"
                              : Number(e.u_value) > 0.8
                              ? "text-amber-500"
                              : "text-green-600"
                          )}
                        >
                          U = {e.u_value}
                        </span>
                      )}
                      {e.condition_state && (
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            e.condition_state === "bon"
                              ? "bg-green-100 text-green-700"
                              : e.condition_state === "moyen"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {e.condition_state}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <AddEnvelopeForm
                  buildingId={id}
                  onAdded={(env) => {
                    setEnvelopes((e) => [...e, env]);
                    toast.success("Élément d'enveloppe ajouté");
                  }}
                />
              </div>
            )}

            {/* ── Factures ─────────────────────────────────────────── */}
            {tab === "bills" && (
              <div className="space-y-3">
                {bills.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune facture renseignée</p>
                )}
                {bills.map((b) => (
                  <div key={b.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{b.energy_type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {b.billing_period_start} → {b.billing_period_end}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-right">
                      {b.consumption_kwh && (
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatNumber(b.consumption_kwh)} kWh
                          </p>
                          <p className="text-xs text-gray-400">consommation</p>
                        </div>
                      )}
                      {b.cost_eur_ttc && (
                        <div>
                          <p className="font-semibold text-gray-900">{formatNumber(b.cost_eur_ttc)} €</p>
                          <p className="text-xs text-gray-400">coût TTC</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <AddBillForm
                  buildingId={id}
                  onAdded={(bill) => {
                    setBills((b) => [...b, bill]);
                    toast.success("Facture ajoutée");
                  }}
                />
              </div>
            )}

            {/* ── Audits ───────────────────────────────────────────── */}
            {tab === "audits" && (
              <div className="space-y-3">
                {audits.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-3">Aucun audit pour ce bâtiment</p>
                    <Link href={`/audits/new?building_id=${id}`} className="btn-primary">
                      <Plus size={15} />
                      Créer le premier audit
                    </Link>
                  </div>
                )}
                {audits.map((a) => (
                  <div key={a.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EnergyLabel label={a.computed_energy_label} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          Audit {a.audit_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(a.created_at).toLocaleDateString("fr-FR")} · v{a.version_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {a.result_snapshot && (
                        <span className="text-sm text-gray-500">
                          {formatNumber(a.result_snapshot.primary_energy_per_m2)} kWhpe/m²
                        </span>
                      )}
                      <Link href={`/audits/${a.id}`} className="btn-secondary text-xs py-1.5">
                        Voir →
                      </Link>
                    </div>
                  </div>
                ))}
                {audits.length > 0 && (
                  <Link
                    href={`/audits/new?building_id=${id}`}
                    className="btn-secondary text-sm py-1.5 w-full justify-center border-dashed"
                  >
                    <Plus size={14} />
                    Nouvel audit
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
