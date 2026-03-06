"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { scenariosApi, auditsApi } from "@/lib/api";
import { Audit } from "@/types";
import { MEASURE_LABELS } from "@/lib/utils";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const MEASURE_TYPES = Object.keys(MEASURE_LABELS);

interface MeasureForm {
  measure_type: string;
  description: string;
  estimated_total_cost_eur: string;
  expected_energy_gain_kwh: string;
  expected_co2_gain_kg: string;
}

function NewScenarioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillAuditId = searchParams.get("audit_id") ?? "";

  const [audits, setAudits] = useState<Audit[]>([]);
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
    auditsApi.list().then((r) => {
      const completed = r.data.filter((a: Audit) => a.status === "completed");
      setAudits(completed);
      if (!form.audit_id && completed.length > 0)
        setForm((f) => ({ ...f, audit_id: completed[0].id }));
    });
  }, [form.audit_id]);

  function addMeasure() {
    setMeasures((m) => [
      ...m,
      { measure_type: "ite", description: "", estimated_total_cost_eur: "", expected_energy_gain_kwh: "", expected_co2_gain_kg: "" },
    ]);
  }

  function updateMeasure(i: number, k: keyof MeasureForm, v: string) {
    setMeasures((m) => m.map((item, idx) => (idx === i ? { ...item, [k]: v } : item)));
  }

  function removeMeasure(i: number) {
    setMeasures((m) => m.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        measures: measures.map((m) => ({
          measure_type: m.measure_type,
          description: m.description || undefined,
          estimated_total_cost_eur: m.estimated_total_cost_eur ? parseFloat(m.estimated_total_cost_eur) : undefined,
          expected_energy_gain_kwh: m.expected_energy_gain_kwh ? parseFloat(m.expected_energy_gain_kwh) : undefined,
          expected_co2_gain_kg: m.expected_co2_gain_kg ? parseFloat(m.expected_co2_gain_kg) : undefined,
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
        Retour aux scénarios
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouveau scénario de rénovation</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Base */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Informations générales</h2>
          <div>
            <label className="label">Audit de référence *</label>
            <select className="input" required value={form.audit_id}
              onChange={(e) => setForm((f) => ({ ...f, audit_id: e.target.value }))}>
              <option value="">Sélectionner un audit calculé</option>
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  Audit {a.id.slice(0, 8)} — {new Date(a.created_at).toLocaleDateString("fr-FR")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Nom du scénario *</label>
            <input className="input" required value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Rénovation globale BBC" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.scenario_type}
                onChange={(e) => setForm((f) => ({ ...f, scenario_type: e.target.value }))}>
                <option value="minimal">Minimal</option>
                <option value="standard">Standard</option>
                <option value="performant">Performant</option>
                <option value="bbc_renovation">BBC Rénovation</option>
              </select>
            </div>
            <div>
              <label className="label">Classe visée</label>
              <select className="input" value={form.target_energy_label}
                onChange={(e) => setForm((f) => ({ ...f, target_energy_label: e.target.value }))}>
                <option value="">—</option>
                {["A","B","C","D"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input h-20 resize-none" value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Contexte, contraintes techniques..." />
          </div>
        </div>

        {/* Measures */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Mesures de travaux</h2>
            <button type="button" onClick={addMeasure} className="btn-secondary text-xs py-1.5">
              <Plus size={14} />
              Ajouter
            </button>
          </div>
          {measures.length === 0 && (
            <p className="text-sm text-gray-400">Aucune mesure ajoutée. Vous pouvez en ajouter ou laisser vide.</p>
          )}
          {measures.map((m, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <select className="input flex-1 mr-3" value={m.measure_type}
                  onChange={(e) => updateMeasure(i, "measure_type", e.target.value)}>
                  {MEASURE_TYPES.map((t) => (
                    <option key={t} value={t}>{MEASURE_LABELS[t]}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeMeasure(i)}
                  className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label text-xs">Coût total (€)</label>
                  <input className="input text-sm" type="number" value={m.estimated_total_cost_eur}
                    onChange={(e) => updateMeasure(i, "estimated_total_cost_eur", e.target.value)}
                    placeholder="50000" />
                </div>
                <div>
                  <label className="label text-xs">Économies (kWh/an)</label>
                  <input className="input text-sm" type="number" value={m.expected_energy_gain_kwh}
                    onChange={(e) => updateMeasure(i, "expected_energy_gain_kwh", e.target.value)}
                    placeholder="25000" />
                </div>
                <div>
                  <label className="label text-xs">CO₂ évité (kg)</label>
                  <input className="input text-sm" type="number" value={m.expected_co2_gain_kg}
                    onChange={(e) => updateMeasure(i, "expected_co2_gain_kg", e.target.value)}
                    placeholder="5000" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Création..." : "Créer le scénario"}
        </button>
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
