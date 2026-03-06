"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mlApi } from "@/lib/api";
import { BrainCircuit, Zap } from "lucide-react";

interface MLResult {
  predicted_primary_energy_per_m2: number;
  model_mae_kwh_m2: number;
  top_influencing_factors: { feature: string; importance: number }[];
  calculator_primary_energy_per_m2?: number;
  delta_kwh_m2?: number;
  delta_percent?: number;
  note?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  heated_area_m2: "Surface chauffée",
  construction_year: "Année de construction",
  dju: "Degrés-jours unifiés (ville)",
  u_wall: "Isolation murs (U-value)",
  u_roof: "Isolation toiture (U-value)",
  u_floor: "Isolation plancher (U-value)",
  u_window: "Isolation menuiseries (U-value)",
  heating_efficiency: "Rendement chaudière",
  energy_source_code: "Source d'énergie",
  floors_above_ground: "Nombre d'étages",
};

export default function MLPage() {
  const [form, setForm] = useState({
    heated_area_m2: 1000,
    construction_year: 1975,
    city: "paris",
    floors_above_ground: 5,
    u_wall: "",
    u_roof: "",
    u_floor: "",
    u_window: "",
    heating_efficiency: 0.85,
    energy_source: "gaz",
  });
  const [result, setResult] = useState<MLResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        heated_area_m2: parseFloat(String(form.heated_area_m2)),
        construction_year: parseInt(String(form.construction_year)),
        city: form.city,
        floors_above_ground: parseInt(String(form.floors_above_ground)),
        heating_efficiency: parseFloat(String(form.heating_efficiency)),
        energy_source: form.energy_source,
      };
      if (form.u_wall) payload.u_wall = parseFloat(form.u_wall);
      if (form.u_roof) payload.u_roof = parseFloat(form.u_roof);
      if (form.u_floor) payload.u_floor = parseFloat(form.u_floor);
      if (form.u_window) payload.u_window = parseFloat(form.u_window);

      const r = await mlApi.predict(payload);
      setResult(r.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Erreur de prédiction";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const label = result
    ? result.predicted_primary_energy_per_m2 < 70 ? "A"
      : result.predicted_primary_energy_per_m2 < 110 ? "B"
      : result.predicted_primary_energy_per_m2 < 180 ? "C"
      : result.predicted_primary_energy_per_m2 < 250 ? "D"
      : result.predicted_primary_energy_per_m2 < 330 ? "E"
      : result.predicted_primary_energy_per_m2 < 420 ? "F"
      : "G"
    : null;

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">IA Prédictive</h1>
          <p className="text-gray-500 mt-1">
            Modèle Gradient Boosting entraîné sur 5 000 configurations de bâtiments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <p className="font-semibold text-gray-800 mb-2">Caractéristiques du bâtiment</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Surface chauffée (m²)</label>
                <input
                  type="number"
                  name="heated_area_m2"
                  className="input"
                  value={form.heated_area_m2}
                  onChange={handleChange}
                  min={50}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Année de construction</label>
                <input
                  type="number"
                  name="construction_year"
                  className="input"
                  value={form.construction_year}
                  onChange={handleChange}
                  min={1800}
                  max={2025}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ville</label>
                <select name="city" className="input" value={form.city} onChange={handleChange}>
                  {["paris", "lyon", "marseille", "bordeaux", "lille", "strasbourg", "toulouse", "nantes"].map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Étages</label>
                <input
                  type="number"
                  name="floors_above_ground"
                  className="input"
                  value={form.floors_above_ground}
                  onChange={handleChange}
                  min={1}
                  required
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">
                U-values (W/m²K) — laisser vide pour valeurs par défaut selon l&apos;année
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "u_wall", label: "Murs" },
                  { name: "u_roof", label: "Toiture" },
                  { name: "u_floor", label: "Plancher" },
                  { name: "u_window", label: "Menuiseries" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      type="number"
                      name={name}
                      className="input"
                      step="0.1"
                      min="0.1"
                      max="6"
                      placeholder="auto"
                      value={(form as Record<string, unknown>)[name] as string}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Source d&apos;énergie</label>
                <select name="energy_source" className="input" value={form.energy_source} onChange={handleChange}>
                  {["gaz", "fioul", "electricite", "pac", "bois", "reseau_chaleur"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rendement chauffage</label>
                <input
                  type="number"
                  name="heating_efficiency"
                  className="input"
                  step="0.05"
                  min="0.5"
                  max="1.5"
                  value={form.heating_efficiency}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              <BrainCircuit size={16} />
              {loading ? "Prédiction en cours..." : "Lancer la prédiction ML"}
            </button>
          </form>

          {/* Result */}
          <div>
            {error && (
              <div className="card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Main result */}
                <div className="card p-6">
                  <p className="text-sm text-gray-500 mb-1">Énergie primaire prédite</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold text-brand-700">
                      {result.predicted_primary_energy_per_m2}
                    </span>
                    <span className="text-gray-500 mb-1">kWhpe/m²/an</span>
                    {label && (
                      <span className="ml-auto text-2xl font-bold px-3 py-1 rounded-lg bg-gray-100">
                        {label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Précision du modèle : ±{result.model_mae_kwh_m2} kWhpe/m²/an (MAE)
                  </p>
                </div>

                {/* Comparison with calculator */}
                {result.calculator_primary_energy_per_m2 !== undefined && (
                  <div className="card p-5">
                    <p className="font-semibold text-gray-800 mb-3 text-sm">
                      Comparaison avec le calcul 3CL
                    </p>
                    <div className="flex gap-4">
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-400">Calcul 3CL</p>
                        <p className="text-xl font-bold text-gray-700">
                          {result.calculator_primary_energy_per_m2}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-brand-50 rounded-lg">
                        <p className="text-xs text-gray-400">Modèle ML</p>
                        <p className="text-xl font-bold text-brand-700">
                          {result.predicted_primary_energy_per_m2}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-400">Delta</p>
                        <p className={`text-xl font-bold ${(result.delta_kwh_m2 ?? 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                          {(result.delta_kwh_m2 ?? 0) > 0 ? "+" : ""}
                          {result.delta_kwh_m2}
                        </p>
                      </div>
                    </div>
                    {result.note && (
                      <p className="text-xs text-gray-400 mt-3">{result.note}</p>
                    )}
                  </div>
                )}

                {/* Feature importance */}
                <div className="card p-5">
                  <p className="font-semibold text-gray-800 mb-3 text-sm">
                    Facteurs les plus influents
                  </p>
                  <div className="space-y-2">
                    {result.top_influencing_factors.map(({ feature, importance }) => (
                      <div key={feature}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {FEATURE_LABELS[feature] ?? feature}
                          </span>
                          <span className="font-medium text-gray-700">{importance}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-400 rounded-full"
                            style={{ width: `${Math.min(100, importance * 2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="card p-12 text-center text-gray-400">
                <BrainCircuit size={48} className="mx-auto mb-3 text-gray-200" />
                <p>Renseignez les caractéristiques et lancez la prédiction</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
