"use client";
import { useState } from "react";
import { buildingsApi } from "@/lib/api";
import { Envelope } from "@/types";
import { Plus, X } from "lucide-react";

interface Props {
  buildingId: string;
  onAdded: (envelope: Envelope) => void;
}

const ELEMENT_TYPES = ["mur", "toiture", "plancher_bas", "menuiserie"];
const ORIENTATIONS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO", "horizontal", "mixte"];
const CONDITIONS = ["bon", "moyen", "mauvais"];

export default function AddEnvelopeForm({ buildingId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    element_type: "mur",
    orientation: "",
    surface_m2: "",
    u_value: "",
    insulation_type: "",
    insulation_thickness_mm: "",
    condition_state: "moyen",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleAdd() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        surface_m2: form.surface_m2 ? parseFloat(form.surface_m2) : undefined,
        u_value: form.u_value ? parseFloat(form.u_value) : undefined,
        insulation_thickness_mm: form.insulation_thickness_mm ? parseFloat(form.insulation_thickness_mm) : undefined,
      };
      const res = await buildingsApi.createEnvelope(buildingId, payload);
      onAdded(res.data);
      setOpen(false);
      setForm({ element_type: "mur", orientation: "", surface_m2: "", u_value: "", insulation_type: "", insulation_thickness_mm: "", condition_state: "moyen" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary text-sm py-1.5 w-full justify-center border-dashed">
        <Plus size={14} />
        Ajouter un élément d&apos;enveloppe
      </button>
    );
  }

  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-800">Nouvel élément d&apos;enveloppe</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Type *</label>
          <select className="input text-sm" value={form.element_type} onChange={(e) => set("element_type", e.target.value)}>
            {ELEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Orientation</label>
          <select className="input text-sm" value={form.orientation} onChange={(e) => set("orientation", e.target.value)}>
            <option value="">—</option>
            {ORIENTATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label text-xs">Surface (m²)</label>
          <input className="input text-sm" type="number" value={form.surface_m2} onChange={(e) => set("surface_m2", e.target.value)} placeholder="1800" />
        </div>
        <div>
          <label className="label text-xs">Valeur U (W/m².K)</label>
          <input className="input text-sm" type="number" step="0.01" value={form.u_value} onChange={(e) => set("u_value", e.target.value)} placeholder="1.5" />
        </div>
        <div>
          <label className="label text-xs">Type isolation</label>
          <input className="input text-sm" value={form.insulation_type} onChange={(e) => set("insulation_type", e.target.value)} placeholder="laine de verre" />
        </div>
        <div>
          <label className="label text-xs">Épaisseur isolation (mm)</label>
          <input className="input text-sm" type="number" value={form.insulation_thickness_mm} onChange={(e) => set("insulation_thickness_mm", e.target.value)} placeholder="80" />
        </div>
        <div className="col-span-2">
          <label className="label text-xs">État</label>
          <div className="flex gap-2">
            {CONDITIONS.map((c) => (
              <button key={c} type="button"
                onClick={() => set("condition_state", c)}
                className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                  form.condition_state === c
                    ? c === "bon" ? "bg-green-500 text-white border-green-500"
                      : c === "moyen" ? "bg-amber-500 text-white border-amber-500"
                      : "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button className="btn-primary text-sm py-1.5 w-full justify-center bg-green-600 hover:bg-green-700" onClick={handleAdd} disabled={loading}>
        {loading ? "Ajout..." : "Ajouter"}
      </button>
    </div>
  );
}
