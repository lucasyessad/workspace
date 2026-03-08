"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { scenariosApi, auditsApi, buildingsApi } from "@/lib/api";
import { Audit, Building } from "@/types";
import { MEASURES, getMeasuresByCategory, SCENARIO_TYPE_LABELS, formatNumber } from "@/lib/utils";
import { ChevronLeft, Plus, Trash2, Euro, Zap, Leaf, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface MeasureForm {
  measure_type: string;
  description: string;
  estimated_total_cost_eur: string;
  maprimerenov_amount_eur: string;
  cee_amount_eur: string;
  eco_ptz_amount_eur: string;
  expected_energy_gain_kwh: string;
  expected_co2_gain_kg: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Isolation": "🧱",
  "Menuiseries": "🪟",
  "Chauffage": "🔥",
  "Eau chaude sanitaire": "💧",
  "Ventilation": "💨",
  "Régulation": "🌡️",
  "Énergies renouvelables": "☀️",
  "DOM-TOM": "🏝️",
  "Audit & accompagnement": "📋",
};

function emptyMeasure(): MeasureForm {
  return {
    measure_type: "ite",
    description: "",
    estimated_total_cost_eur: "",
    maprimerenov_amount_eur: "",
    cee_amount_eur: "",
    eco_ptz_amount_eur: "",
    expected_energy_gain_kwh: "",
    expected_co2_gain_kg: "",
  };
}

function MeasureCard({
  m,
  i,
  onUpdate,
  onRemove,
}: {
  m: MeasureForm;
  i: number;
  onUpdate: (k: keyof MeasureForm, v: string) => void;
  onRemove: () => void;
}) {
  const meta = MEASURES[m.measure_type];
  const byCategory = getMeasuresByCategory();

  const cost = parseFloat(m.estimated_total_cost_eur) || 0;
  const mpr = parseFloat(m.maprimerenov_amount_eur) || 0;
  const cee = parseFloat(m.cee_amount_eur) || 0;
  const ptz = parseFloat(m.eco_ptz_amount_eur) || 0;
  const totalAids = mpr + cee;
  const netCost = Math.max(0, cost - totalAids);
  const restFinance = Math.max(0, netCost - ptz);

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="label text-xs">Type de travaux</label>
          <select
            className="input"
            value={m.measure_type}
            onChange={(e) => onUpdate("measure_type", e.target.value)}
          >
            {Object.entries(byCategory).map(([cat, keys]) => (
              <optgroup key={cat} label={`${CATEGORY_ICONS[cat] ?? "•"} ${cat}`}>
                {keys.map((k) => (
                  <option key={k} value={k}>
                    {MEASURES[k].label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-6 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Eligibility badges */}
      {meta && (
        <div className="flex flex-wrap gap-2">
          {meta.maprimerenov && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
              <CheckCircle2 size={11} /> MaPrimeRénov&apos;
            </span>
          )}
          {meta.cee && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-100">
              <CheckCircle2 size={11} /> CEE
            </span>
          )}
          {meta.eco_ptz && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium border border-orange-100">
              <CheckCircle2 size={11} /> Éco-PTZ
            </span>
          )}
          {!meta.maprimerenov && !meta.cee && !meta.eco_ptz && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs border border-gray-100">
              <Info size={11} /> Hors dispositifs nationaux
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <label className="label text-xs">Description (optionnel)</label>
        <input
          className="input text-sm"
          value={m.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Détails techniques, marque, surface..."
        />
      </div>

      {/* Costs */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Euro size={12} /> Coûts & aides
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs">Coût total HT (€)</label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              value={m.estimated_total_cost_eur}
              onChange={(e) => onUpdate("estimated_total_cost_eur", e.target.value)}
              placeholder="ex. 15 000"
            />
          </div>
          <div>
            <label className="label text-xs flex items-center gap-1">
              MaPrimeRénov&apos; (€)
              {!meta?.maprimerenov && <span className="text-gray-300 text-[10px]">N/A</span>}
            </label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              disabled={!meta?.maprimerenov}
              value={m.maprimerenov_amount_eur}
              onChange={(e) => onUpdate("maprimerenov_amount_eur", e.target.value)}
              placeholder={meta?.maprimerenov ? "ex. 5 000" : "—"}
            />
          </div>
          <div>
            <label className="label text-xs flex items-center gap-1">
              CEE estimés (€)
              {!meta?.cee && <span className="text-gray-300 text-[10px]">N/A</span>}
            </label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              disabled={!meta?.cee}
              value={m.cee_amount_eur}
              onChange={(e) => onUpdate("cee_amount_eur", e.target.value)}
              placeholder={meta?.cee ? "ex. 2 000" : "—"}
            />
          </div>
          <div>
            <label className="label text-xs flex items-center gap-1">
              Éco-PTZ (€)
              {!meta?.eco_ptz && <span className="text-gray-300 text-[10px]">N/A</span>}
            </label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              disabled={!meta?.eco_ptz}
              value={m.eco_ptz_amount_eur}
              onChange={(e) => onUpdate("eco_ptz_amount_eur", e.target.value)}
              placeholder={meta?.eco_ptz ? "ex. 30 000" : "—"}
            />
          </div>
        </div>

        {/* Net cost summary */}
        {cost > 0 && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Coût total</span>
              <span>{formatNumber(cost)} €</span>
            </div>
            {totalAids > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>— Aides (MaPrimeRénov&apos; + CEE)</span>
                <span>- {formatNumber(totalAids)} €</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1">
              <span>Reste à charge</span>
              <span>{formatNumber(netCost)} €</span>
            </div>
            {ptz > 0 && (
              <div className="flex justify-between text-orange-600 text-[11px]">
                <span>dont finançable Éco-PTZ</span>
                <span>{formatNumber(Math.min(ptz, netCost))} €</span>
              </div>
            )}
            {ptz > 0 && restFinance < netCost && (
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Apport personnel estimé</span>
                <span>{formatNumber(restFinance)} €</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Energy / CO2 */}
      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Zap size={12} /> Gains énergétiques
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs flex items-center gap-1">
              <Zap size={11} className="text-yellow-500" /> Économies (kWh/an)
            </label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              value={m.expected_energy_gain_kwh}
              onChange={(e) => onUpdate("expected_energy_gain_kwh", e.target.value)}
              placeholder="ex. 20 000"
            />
          </div>
          <div>
            <label className="label text-xs flex items-center gap-1">
              <Leaf size={11} className="text-green-500" /> CO₂ évité (kg/an)
            </label>
            <input
              className="input text-sm"
              type="number"
              min="0"
              value={m.expected_co2_gain_kg}
              onChange={(e) => onUpdate("expected_co2_gain_kg", e.target.value)}
              placeholder="ex. 5 000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NewScenarioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillAuditId = searchParams.get("audit_id") ?? "";

  const [audits, setAudits] = useState<Audit[]>([]);
  const [buildings, setBuildings] = useState<Record<string, Building>>({});
  const [form, setForm] = useState({
    audit_id: prefillAuditId,
    name: "",
    scenario_type: "standard",
    target_energy_label: "",
    notes: "",
  });
  const [measures, setMeasures] = useState<MeasureForm[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([auditsApi.list(), buildingsApi.listBuildings()]).then(([a, b]) => {
      const completed = a.data.filter((au: Audit) => au.status === "completed" || au.status === "validated");
      setAudits(completed);
      const map: Record<string, Building> = {};
      for (const bld of b.data) map[bld.id] = bld;
      setBuildings(map);
      if (!form.audit_id && completed.length > 0)
        setForm((f) => ({ ...f, audit_id: completed[0].id }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMeasure() {
    setMeasures((m) => [...m, emptyMeasure()]);
  }

  function updateMeasure(i: number, k: keyof MeasureForm, v: string) {
    setMeasures((m) => m.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)));
  }

  function removeMeasure(i: number) {
    setMeasures((m) => m.filter((_, idx) => idx !== i));
  }

  // Totals
  const totalCost = measures.reduce((s, m) => s + (parseFloat(m.estimated_total_cost_eur) || 0), 0);
  const totalMPR  = measures.reduce((s, m) => s + (parseFloat(m.maprimerenov_amount_eur) || 0), 0);
  const totalCEE  = measures.reduce((s, m) => s + (parseFloat(m.cee_amount_eur) || 0), 0);
  const totalPTZ  = measures.reduce((s, m) => s + (parseFloat(m.eco_ptz_amount_eur) || 0), 0);
  const totalAids = totalMPR + totalCEE;
  const totalNet  = Math.max(0, totalCost - totalAids);
  const totalKwh  = measures.reduce((s, m) => s + (parseFloat(m.expected_energy_gain_kwh) || 0), 0);
  const totalCo2  = measures.reduce((s, m) => s + (parseFloat(m.expected_co2_gain_kg) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        measures: measures.map((m) => ({
          measure_type: m.measure_type,
          description: m.description || undefined,
          estimated_total_cost_eur: parseFloat(m.estimated_total_cost_eur) || undefined,
          expected_energy_gain_kwh: parseFloat(m.expected_energy_gain_kwh) || undefined,
          expected_co2_gain_kg: parseFloat(m.expected_co2_gain_kg) || undefined,
        })),
      };
      await scenariosApi.create(payload);
      router.push("/scenarios");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/scenarios" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} />
        Retour aux plans de rénovation
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau plan de rénovation</h1>
      <p className="text-gray-500 text-sm mb-8">
        Définissez les travaux, simulez les aides (MaPrimeRénov&apos;, CEE, Éco-PTZ) et estimez le retour sur investissement.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Informations générales</h2>

          <div>
            <label className="label">Audit de référence *</label>
            <select className="input" required value={form.audit_id}
              onChange={(e) => setForm((f) => ({ ...f, audit_id: e.target.value }))}>
              <option value="">Sélectionner un audit calculé</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {buildings[a.building_id]?.name ?? `Audit ${a.id.slice(0, 8)}`}
                  {" — "}
                  {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Nom du plan *</label>
            <input className="input" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex. Rénovation globale BBC — Résidence Les Pins" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type de rénovation</label>
              <select className="input" value={form.scenario_type}
                onChange={(e) => setForm((f) => ({ ...f, scenario_type: e.target.value }))}>
                {Object.entries(SCENARIO_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {form.scenario_type === "bbc_renovation" && (
                <p className="text-xs text-blue-600 mt-1">
                  Éligible MaPrimeRénov&apos; parcours accompagné — gain ≥ 2 classes DPE requis.
                </p>
              )}
              {form.scenario_type === "renovation_globale" && (
                <p className="text-xs text-blue-600 mt-1">
                  Cible classe A ou B — cumul maximal des aides MaPrimeRénov&apos; + CEE.
                </p>
              )}
            </div>
            <div>
              <label className="label">Classe DPE visée</label>
              <select className="input" value={form.target_energy_label}
                onChange={(e) => setForm((f) => ({ ...f, target_energy_label: e.target.value }))}>
                <option value="">— Non définie</option>
                {["A", "B", "C", "D"].map((l) => (
                  <option key={l} value={l}>
                    {l}{l === "A" || l === "B" ? " — Très performant" : l === "C" ? " — Bon niveau" : " — Acceptable"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Contexte / notes</label>
            <textarea className="input h-20 resize-none" value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Contraintes techniques, copropriété, calendrier des travaux, financements locaux..." />
          </div>
        </div>

        {/* Mesures de travaux */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800">Mesures de travaux</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Les badges indiquent l&apos;éligibilité aux aides nationales
              </p>
            </div>
            <button type="button" onClick={addMeasure} className="btn-secondary text-xs py-1.5">
              <Plus size={14} />
              Ajouter un geste
            </button>
          </div>

          {measures.length === 0 && (
            <div className="card p-8 text-center text-gray-400">
              <Plus size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Ajoutez des gestes de travaux pour simuler les aides et le retour sur investissement</p>
            </div>
          )}

          {measures.map((m, i) => (
            <MeasureCard
              key={i}
              m={m}
              i={i}
              onUpdate={(k, v) => updateMeasure(i, k, v)}
              onRemove={() => removeMeasure(i)}
            />
          ))}
        </div>

        {/* Récapitulatif financier */}
        {measures.length > 0 && totalCost > 0 && (
          <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3">Récapitulatif financier du plan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Coût total travaux ({measures.length} geste{measures.length > 1 ? "s" : ""})</span>
                <span className="font-semibold">{formatNumber(totalCost)} €</span>
              </div>
              {totalMPR > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>MaPrimeRénov&apos;</span>
                  <span>- {formatNumber(totalMPR)} €</span>
                </div>
              )}
              {totalCEE > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>CEE (primes énergie)</span>
                  <span>- {formatNumber(totalCEE)} €</span>
                </div>
              )}
              {totalAids > 0 && (
                <div className="flex justify-between font-semibold text-green-700 border-t border-blue-100 pt-2">
                  <span>Total aides mobilisées</span>
                  <span>- {formatNumber(totalAids)} € ({Math.round((totalAids / totalCost) * 100)}%)</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-blue-200 pt-2 text-base">
                <span>Reste à charge</span>
                <span>{formatNumber(totalNet)} €</span>
              </div>
              {totalPTZ > 0 && (
                <div className="flex justify-between text-orange-600 text-xs">
                  <span>Finançable Éco-PTZ (0%)</span>
                  <span>jusqu&apos;à {formatNumber(Math.min(totalPTZ, totalNet))} €</span>
                </div>
              )}
            </div>
            {(totalKwh > 0 || totalCo2 > 0) && (
              <div className="mt-4 pt-3 border-t border-blue-100 grid grid-cols-2 gap-3">
                {totalKwh > 0 && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-600">{formatNumber(totalKwh)}</p>
                    <p className="text-xs text-gray-500">kWh économisés/an</p>
                  </div>
                )}
                {totalCo2 > 0 && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{formatNumber(totalCo2)}</p>
                    <p className="text-xs text-gray-500">kg CO₂ évités/an</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/scenarios" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading || !form.audit_id || !form.name}>
            {loading ? "Création..." : "Créer le plan de rénovation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewScenarioPage() {
  return (
    <AppLayout>
      <Suspense>
        <NewScenarioForm />
      </Suspense>
    </AppLayout>
  );
}
