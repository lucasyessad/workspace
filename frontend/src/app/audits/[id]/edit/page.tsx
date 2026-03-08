"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useToastContext } from "@/components/ui/ToastProvider";
import { auditsApi, buildingsApi } from "@/lib/api";
import { Audit, Building } from "@/types";
import { ChevronLeft, Save, RotateCcw, Lock } from "lucide-react";
import Link from "next/link";

const AUDIT_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "simplifie", label: "Simplifié" },
  { value: "complet", label: "Complet" },
];

const ENERGY_LABELS = ["A", "B", "C", "D", "E", "F", "G"];

export default function AuditEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const toast = useToastContext();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const [auditType, setAuditType] = useState("standard");
  const [status, setStatus] = useState("draft");
  const [baselineKwh, setBaselineKwh] = useState("");
  const [baselineCostEur, setBaselineCostEur] = useState("");
  const [baselineCo2Kg, setBaselineCo2Kg] = useState("");
  const [energyLabel, setEnergyLabel] = useState("");
  const [ghgLabel, setGhgLabel] = useState("");

  useEffect(() => {
    auditsApi.get(id).then((r) => {
      const a: Audit = r.data;
      setAudit(a);
      setAuditType(a.audit_type);
      setStatus(a.status);
      setBaselineKwh(a.baseline_energy_consumption_kwh?.toString() ?? "");
      setBaselineCostEur(a.baseline_energy_cost_eur?.toString() ?? "");
      setBaselineCo2Kg(a.baseline_co2_kg?.toString() ?? "");
      setEnergyLabel(a.computed_energy_label ?? "");
      setGhgLabel(a.computed_ghg_label ?? "");
      buildingsApi.getBuilding(a.building_id).then((b) => setBuilding(b.data));
    });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await auditsApi.update(id, {
        status,
        baseline_energy_consumption_kwh: baselineKwh ? parseFloat(baselineKwh) : undefined,
        baseline_energy_cost_eur: baselineCostEur ? parseFloat(baselineCostEur) : undefined,
        baseline_co2_kg: baselineCo2Kg ? parseFloat(baselineCo2Kg) : undefined,
        computed_energy_label: energyLabel || undefined,
        computed_ghg_label: ghgLabel || undefined,
      });
      toast.success("Audit mis à jour");
      router.push(`/audits/${id}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetAndRecalculate() {
    if (!confirm("Réinitialiser les résultats et relancer le calcul énergétique ?")) return;
    setRecalculating(true);
    try {
      await auditsApi.update(id, { status: "draft", result_snapshot: null });
      await auditsApi.calculate(id);
      toast.success("Recalcul terminé");
      router.push(`/audits/${id}`);
    } catch {
      toast.error("Erreur lors du recalcul");
    } finally {
      setRecalculating(false);
    }
  }

  if (!audit) {
    return <AppLayout><div className="p-8 text-gray-400">Chargement...</div></AppLayout>;
  }

  const isLocked = audit.status === "validated";

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <Link
          href={`/audits/${id}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronLeft size={16} />
          Retour à l&apos;audit
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;audit</h1>
          <p className="text-gray-500 mt-1">{building?.name ?? "…"}</p>
        </div>

        {isLocked && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl">
            <Lock size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Audit verrouillé</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Cet audit a été validé et ne peut plus être modifié. Les données sont figées pour garantir leur intégrité.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Métadonnées */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Type d&apos;audit</label>
                <select
                  className="input"
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value)}
                  disabled
                >
                  {AUDIT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Le type d&apos;audit ne peut pas être modifié après création.</p>
              </div>

              <div>
                <label className="label">Statut</label>
                <select
                  className="input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isLocked}
                >
                  <option value="draft">Brouillon</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="validated">Validé — verrouillé</option>
                </select>
                {!isLocked && (
                  <p className="text-xs text-amber-600 mt-1">
                    Attention : passer en &quot;Validé&quot; verrouillera définitivement cet audit.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Valeurs de référence */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-1">Consommations de référence</h2>
            <p className="text-sm text-gray-500 mb-4">
              Saisissez des valeurs mesurées (factures, compteurs) pour affiner l&apos;audit.
              Laissez vide pour utiliser les valeurs calculées automatiquement.
            </p>
            <div className="space-y-4">
              <div>
                <label className="label">Consommation de référence (kWh/an)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input"
                  placeholder="Ex : 680000"
                  value={baselineKwh}
                  onChange={(e) => setBaselineKwh(e.target.value)}
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="label">Coût énergétique de référence (€/an)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input"
                  placeholder="Ex : 89400"
                  value={baselineCostEur}
                  onChange={(e) => setBaselineCostEur(e.target.value)}
                  disabled={isLocked}
                />
              </div>
              <div>
                <label className="label">Émissions CO₂ de référence (kg/an)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input"
                  placeholder="Ex : 307328"
                  value={baselineCo2Kg}
                  onChange={(e) => setBaselineCo2Kg(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>

          {/* Classes énergétiques */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-1">Classes énergétiques calculées</h2>
            <p className="text-sm text-gray-500 mb-4">
              Modifiez manuellement la classe DPE / GES si le calcul automatique ne correspond pas aux données terrain.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Classe DPE (énergie)</label>
                <select
                  className="input"
                  value={energyLabel}
                  onChange={(e) => setEnergyLabel(e.target.value)}
                  disabled={isLocked}
                >
                  <option value="">— Calculé auto —</option>
                  {ENERGY_LABELS.map((l) => (
                    <option key={l} value={l}>Classe {l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Classe GES (CO₂)</label>
                <select
                  className="input"
                  value={ghgLabel}
                  onChange={(e) => setGhgLabel(e.target.value)}
                  disabled={isLocked}
                >
                  <option value="">— Calculé auto —</option>
                  {ENERGY_LABELS.map((l) => (
                    <option key={l} value={l}>Classe {l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetAndRecalculate}
              disabled={recalculating || isLocked}
            >
              <RotateCcw size={15} />
              {recalculating ? "Recalcul..." : "Réinitialiser & recalculer"}
            </button>

            <div className="flex gap-3">
              <Link href={`/audits/${id}`} className="btn-secondary">
                {isLocked ? "Retour" : "Annuler"}
              </Link>
              {!isLocked && (
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={15} />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
