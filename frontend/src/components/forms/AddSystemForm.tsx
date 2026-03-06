"use client";
import { useState } from "react";
import { buildingsApi } from "@/lib/api";
import { System } from "@/types";
import { Plus, X } from "lucide-react";

interface Props {
  buildingId: string;
  onAdded: (system: System) => void;
}

const SYSTEM_TYPES = ["chauffage", "ecs", "ventilation", "refroidissement"];
const ENERGY_SOURCES = ["gaz", "fioul", "electricite", "bois", "pac", "reseau_chaleur"];

export default function AddSystemForm({ buildingId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    system_type: "chauffage",
    energy_source: "gaz",
    brand: "",
    model: "",
    installation_year: "",
    nominal_power_kw: "",
    efficiency_nominal: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleAdd() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        installation_year: form.installation_year ? parseInt(form.installation_year) : undefined,
        nominal_power_kw: form.nominal_power_kw ? parseFloat(form.nominal_power_kw) : undefined,
        efficiency_nominal: form.efficiency_nominal ? parseFloat(form.efficiency_nominal) : undefined,
      };
      const res = await buildingsApi.createSystem(buildingId, payload);
      onAdded(res.data);
      setOpen(false);
      setForm({ system_type: "chauffage", energy_source: "gaz", brand: "", model: "", installation_year: "", nominal_power_kw: "", efficiency_nominal: "" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm py-1.5 w-full justify-center border-dashed">
        <Plus size={14} />
        Ajouter un système
      </button>
    );
  }

  return (
    <div className="border border-brand-200 rounded-lg p-4 bg-brand-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-800">Nouveau système</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Type *</label>
          <select className="input text-sm" value={form.system_type} onChange={(e) => set("system_type", e.target.value)}>
            {SYSTEM_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Source d&apos;énergie *</label>
          <select className="input text-sm" value={form.energy_source} onChange={(e) => set("energy_source", e.target.value)}>
            {ENERGY_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Marque</label>
          <input className="input text-sm" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Viessmann" />
        </div>
        <div>
          <label className="label text-xs">Année installation</label>
          <input className="input text-sm" type="number" value={form.installation_year} onChange={(e) => set("installation_year", e.target.value)} placeholder="2010" />
        </div>
        <div>
          <label className="label text-xs">Puissance nominale (kW)</label>
          <input className="input text-sm" type="number" step="0.1" value={form.nominal_power_kw} onChange={(e) => set("nominal_power_kw", e.target.value)} placeholder="120" />
        </div>
        <div>
          <label className="label text-xs">Rendement (0–1)</label>
          <input className="input text-sm" type="number" step="0.01" min="0" max="5" value={form.efficiency_nominal} onChange={(e) => set("efficiency_nominal", e.target.value)} placeholder="0.87" />
        </div>
      </div>
      <button className="btn-primary text-sm py-1.5 w-full justify-center" onClick={handleAdd} disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </div>
  );
}
