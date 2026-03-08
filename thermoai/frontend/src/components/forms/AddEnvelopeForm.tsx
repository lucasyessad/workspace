"use client";
import { useState } from "react";
import { buildingsApi } from "@/lib/api";
import { Envelope } from "@/types";
import { Plus, X, Layers } from "lucide-react";

interface Props {
  buildingId: string;
  onAdded: (envelope: Envelope) => void;
}

const ELEMENT_TYPE_LABELS: Record<string, string> = {
  mur: "Mur / Façade",
  toiture: "Toiture / Combles",
  plancher_bas: "Plancher bas / Dalle",
  menuiserie: "Menuiseries (fenêtres, portes-fenêtres)",
  porte: "Porte d'entrée",
  pont_thermique: "Pont thermique (linéaire ψ)",
};

const ORIENTATIONS: Record<string, string> = {
  N: "Nord", NE: "Nord-Est", E: "Est", SE: "Sud-Est",
  S: "Sud", SO: "Sud-Ouest", O: "Ouest", NO: "Nord-Ouest",
  horizontal: "Horizontal (toiture plate)", mixte: "Mixte / Non orienté",
};

const CONDITIONS: { value: string; label: string; color: string }[] = [
  { value: "bon", label: "Bon", color: "bg-green-500 text-white border-green-500" },
  { value: "moyen", label: "Moyen", color: "bg-amber-500 text-white border-amber-500" },
  { value: "mauvais", label: "Mauvais", color: "bg-red-500 text-white border-red-500" },
];

// Presets: [label, u_value, insulation_type, thickness_mm?]
const MATERIAL_PRESETS: Record<string, [string, number, string, number?][]> = {
  mur: [
    ["Béton plein non isolé", 2.50, "aucune"],
    ["Parpaing non isolé", 1.80, "aucune"],
    ["Brique creuse non isolée", 1.20, "aucune"],
    ["Mur avec ITI 6cm laine minérale", 0.50, "ITI laine minérale", 60],
    ["Mur avec ITI 10cm laine minérale", 0.35, "ITI laine minérale", 100],
    ["Mur avec ITE 10cm laine de roche", 0.32, "ITE laine de roche", 100],
    ["Mur avec ITE 14cm laine de roche", 0.25, "ITE laine de roche", 140],
    ["Mur avec ITE 16cm polystyrène", 0.22, "ITE PSE", 160],
    ["Ossature bois isolée 14cm", 0.30, "laine de bois", 140],
    ["Mur RE2020 (U ≤ 0.20)", 0.18, "ITE haute performance", 180],
  ],
  toiture: [
    ["Toiture non isolée", 2.00, "aucune"],
    ["Combles perdus 10cm laine de verre", 0.38, "laine de verre", 100],
    ["Combles perdus 20cm laine de verre", 0.20, "laine de verre", 200],
    ["Combles perdus 30cm laine de verre", 0.14, "laine de verre", 300],
    ["Toiture-terrasse sarking 12cm polyuréthane", 0.28, "sarking polyuréthane", 120],
    ["Toiture-terrasse sarking 20cm polyuréthane", 0.18, "sarking polyuréthane", 200],
    ["Rampants isolés sous chevrons 14cm", 0.30, "laine de roche", 140],
    ["Toiture RE2020 (U ≤ 0.13)", 0.12, "haute performance", 260],
  ],
  plancher_bas: [
    ["Dalle béton non isolée (sur terre-plein)", 2.00, "aucune"],
    ["Vide sanitaire non isolé", 1.00, "aucune"],
    ["Dalle avec 6cm PSE", 0.55, "polystyrène expansé", 60],
    ["Dalle avec 10cm PSE", 0.35, "polystyrène expansé", 100],
    ["Dalle avec 14cm PSE", 0.26, "polystyrène expansé", 140],
    ["Plancher bois isolé 16cm laine minérale", 0.24, "laine minérale", 160],
    ["Plancher RE2020 (U ≤ 0.22)", 0.20, "haute performance", 180],
  ],
  menuiserie: [
    ["Simple vitrage (ancien)", 5.80, "simple vitrage"],
    ["Double vitrage ordinaire PVC", 3.00, "double vitrage"],
    ["Double vitrage peu émissif PVC + argon", 1.40, "DV PEV argon"],
    ["Double vitrage peu émissif ALU rupture thermique", 1.60, "DV PEV ALU RT"],
    ["Triple vitrage PVC", 0.80, "triple vitrage"],
    ["Triple vitrage haute performance", 0.60, "triple vitrage HP"],
    ["Fenêtre de toit double vitrage", 1.60, "DV Velux"],
    ["Menuiserie RE2020 (Uw ≤ 1.0)", 0.90, "certifié RE2020"],
  ],
  porte: [
    ["Porte ancienne non isolée", 3.50, "aucune"],
    ["Porte isolée standard", 1.50, "isolée"],
    ["Porte isolée haute performance", 0.80, "haute performance"],
  ],
  pont_thermique: [
    ["Jonction mur/plancher non traité", 0.80, "linéaire ψ"],
    ["Jonction mur/plancher traité ITE", 0.10, "linéaire ψ traité"],
    ["Jonction menuiserie/mur", 0.20, "linéaire ψ"],
  ],
};

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
    linear_length_m: "",
    psi_value: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const presets = MATERIAL_PRESETS[form.element_type] ?? [];
  const isPontThermique = form.element_type === "pont_thermique";

  function applyPreset(idx: number) {
    const preset = presets[idx];
    if (!preset) return;
    setForm((f) => ({
      ...f,
      u_value: preset[1].toString(),
      insulation_type: preset[2],
      insulation_thickness_mm: preset[3]?.toString() ?? "",
    }));
  }

  async function handleAdd() {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        element_type: form.element_type,
        orientation: form.orientation || undefined,
        surface_m2: form.surface_m2 ? parseFloat(form.surface_m2) : undefined,
        u_value: form.u_value ? parseFloat(form.u_value) : undefined,
        insulation_type: form.insulation_type || undefined,
        insulation_thickness_mm: form.insulation_thickness_mm ? parseFloat(form.insulation_thickness_mm) : undefined,
        condition_state: form.condition_state,
        linear_length_m: form.linear_length_m ? parseFloat(form.linear_length_m) : undefined,
        psi_value: form.psi_value ? parseFloat(form.psi_value) : undefined,
      };
      const res = await buildingsApi.createEnvelope(buildingId, payload);
      onAdded(res.data);
      setOpen(false);
      setForm({
        element_type: "mur", orientation: "", surface_m2: "", u_value: "",
        insulation_type: "", insulation_thickness_mm: "", condition_state: "moyen",
        linear_length_m: "", psi_value: "",
      });
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

  const uVal = form.u_value ? parseFloat(form.u_value) : null;
  let uBadge = "";
  if (uVal !== null) {
    if (uVal <= 0.22) uBadge = "✓ Conforme RE2020";
    else if (uVal <= 0.40) uBadge = "✓ Niveau BBC Rénovation";
    else if (uVal > 2.00) uBadge = "⚠ Élément non isolé";
  }

  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
          <Layers size={14} />
          Nouvel élément d&apos;enveloppe
        </p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {/* Type + Orientation */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Type d&apos;élément *</label>
          <select
            className="input text-sm"
            value={form.element_type}
            onChange={(e) => {
              set("element_type", e.target.value);
              set("u_value", "");
              set("insulation_type", "");
              set("insulation_thickness_mm", "");
            }}
          >
            {Object.entries(ELEMENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {!isPontThermique && (
          <div>
            <label className="label text-xs">Orientation</label>
            <select className="input text-sm" value={form.orientation} onChange={(e) => set("orientation", e.target.value)}>
              <option value="">— Non renseignée —</option>
              {Object.entries(ORIENTATIONS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bibliothèque matériaux */}
      {presets.length > 0 && (
        <div>
          <label className="label text-xs">Bibliothèque matériaux — préremplissage automatique</label>
          <select
            className="input text-sm"
            defaultValue=""
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              if (!isNaN(idx)) applyPreset(idx);
            }}
          >
            <option value="">— Choisir un matériau type —</option>
            {presets.map((p, i) => (
              <option key={i} value={i}>{p[0]} — U = {p[1]} W/m².K</option>
            ))}
          </select>
        </div>
      )}

      {/* Surface ou linéaire */}
      {isPontThermique ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs">Longueur linéaire (m)</label>
            <input className="input text-sm" type="number" step="0.5" value={form.linear_length_m} onChange={(e) => set("linear_length_m", e.target.value)} placeholder="45" />
          </div>
          <div>
            <label className="label text-xs">Coefficient ψ (W/m.K)</label>
            <input className="input text-sm" type="number" step="0.01" value={form.psi_value} onChange={(e) => set("psi_value", e.target.value)} placeholder="0.80" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs">Surface (m²)</label>
            <input className="input text-sm" type="number" step="0.5" value={form.surface_m2} onChange={(e) => set("surface_m2", e.target.value)} placeholder="1800" />
          </div>
          <div>
            <label className="label text-xs">Valeur U (W/m².K)</label>
            <input className="input text-sm" type="number" step="0.01" min="0" value={form.u_value} onChange={(e) => set("u_value", e.target.value)} placeholder="1.5" />
          </div>
        </div>
      )}

      {/* Isolation */}
      {!isPontThermique && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label text-xs">Type d&apos;isolation</label>
            <input className="input text-sm" value={form.insulation_type} onChange={(e) => set("insulation_type", e.target.value)} placeholder="laine de verre, PSE…" />
          </div>
          <div>
            <label className="label text-xs">Épaisseur isolation (mm)</label>
            <input className="input text-sm" type="number" step="10" value={form.insulation_thickness_mm} onChange={(e) => set("insulation_thickness_mm", e.target.value)} placeholder="100" />
          </div>
        </div>
      )}

      {/* Badge conformité */}
      {uVal !== null && (
        <div className={`text-xs rounded px-3 py-1.5 ${uBadge.startsWith("✓") ? "text-green-700 bg-green-100" : uBadge.startsWith("⚠") ? "text-amber-700 bg-amber-50" : "text-gray-600 bg-gray-50"}`}>
          U = <strong>{uVal.toFixed(2)} W/m².K</strong>
          {uBadge && <span className="ml-2">{uBadge}</span>}
        </div>
      )}

      {/* État */}
      {!isPontThermique && (
        <div>
          <label className="label text-xs">État général</label>
          <div className="flex gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set("condition_state", c.value)}
                className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
                  form.condition_state === c.value ? c.color : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn-primary text-sm py-1.5 w-full justify-center bg-green-600 hover:bg-green-700"
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? "Ajout..." : "Ajouter l'élément"}
      </button>
    </div>
  );
}
