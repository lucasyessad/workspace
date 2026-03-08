"use client";
import { useState } from "react";
import { buildingsApi } from "@/lib/api";
import { Plus, X } from "lucide-react";

interface EnergyBillRow {
  id: string;
  billing_period_start: string;
  billing_period_end: string;
  energy_type: string;
  consumption_kwh?: number;
  cost_eur_ttc?: number;
}

interface Props {
  buildingId: string;
  onAdded: (bill: EnergyBillRow) => void;
}

const ENERGY_TYPES = ["gaz", "fioul", "electricite", "bois", "reseau_chaleur"];

export default function AddBillForm({ buildingId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    billing_period_start: "",
    billing_period_end: "",
    energy_type: "gaz",
    consumption_kwh: "",
    cost_eur_ttc: "",
    supplier_name: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleAdd() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        consumption_kwh: form.consumption_kwh ? parseFloat(form.consumption_kwh) : undefined,
        cost_eur_ttc: form.cost_eur_ttc ? parseFloat(form.cost_eur_ttc) : undefined,
      };
      const res = await buildingsApi.createBill(buildingId, payload);
      onAdded(res.data);
      setOpen(false);
      setForm({ billing_period_start: "", billing_period_end: "", energy_type: "gaz", consumption_kwh: "", cost_eur_ttc: "", supplier_name: "" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm py-1.5 w-full justify-center border-dashed">
        <Plus size={14} />
        Ajouter une facture
      </button>
    );
  }

  return (
    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-orange-800">Nouvelle facture énergétique</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Début de période *</label>
          <input className="input text-sm" type="date" value={form.billing_period_start}
            onChange={(e) => set("billing_period_start", e.target.value)} required />
        </div>
        <div>
          <label className="label text-xs">Fin de période *</label>
          <input className="input text-sm" type="date" value={form.billing_period_end}
            onChange={(e) => set("billing_period_end", e.target.value)} required />
        </div>
        <div>
          <label className="label text-xs">Type d&apos;énergie *</label>
          <select className="input text-sm" value={form.energy_type} onChange={(e) => set("energy_type", e.target.value)}>
            {ENERGY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Fournisseur</label>
          <input className="input text-sm" value={form.supplier_name} onChange={(e) => set("supplier_name", e.target.value)} placeholder="Engie, TotalEnergies…" />
        </div>
        <div>
          <label className="label text-xs">Consommation (kWh)</label>
          <input className="input text-sm" type="number" value={form.consumption_kwh}
            onChange={(e) => set("consumption_kwh", e.target.value)} placeholder="450000" />
        </div>
        <div>
          <label className="label text-xs">Coût TTC (€)</label>
          <input className="input text-sm" type="number" value={form.cost_eur_ttc}
            onChange={(e) => set("cost_eur_ttc", e.target.value)} placeholder="38700" />
        </div>
      </div>
      <button className="btn-primary text-sm py-1.5 w-full justify-center bg-orange-600 hover:bg-orange-700"
        onClick={handleAdd} disabled={loading || !form.billing_period_start || !form.billing_period_end}>
        {loading ? "Ajout..." : "Ajouter la facture"}
      </button>
    </div>
  );
}
