"use client";
import { useState } from "react";
import { buildingsApi } from "@/lib/api";
import { System } from "@/types";
import { Plus, X, Zap } from "lucide-react";

interface Props {
  buildingId: string;
  onAdded: (system: System) => void;
}

const SYSTEM_TYPE_LABELS: Record<string, string> = {
  chauffage: "Chauffage",
  ecs: "Eau chaude sanitaire (ECS)",
  ventilation: "Ventilation",
  refroidissement: "Refroidissement / Climatisation",
};

const ENERGY_SOURCE_LABELS: Record<string, string> = {
  gaz: "Gaz naturel",
  fioul: "Fioul domestique",
  electricite: "Électricité",
  bois: "Bois / Biomasse",
  pac: "Pompe à chaleur (PAC)",
  reseau_chaleur: "Réseau de chaleur urbain",
  solaire: "Solaire thermique",
  propane: "Propane / GPL",
};

const DISTRIBUTION_LABELS: Record<string, string> = {
  radiateurs: "Radiateurs haute température",
  plancher_chauffant: "Plancher chauffant basse température",
  fan_coil: "Ventilo-convecteurs (fan-coil)",
  air_pulse: "Air pulsé / soufflage",
  direct: "Émission directe",
};

const VMC_TYPE_LABELS: Record<string, string> = {
  sf_autoregable: "Simple flux autoréglable",
  sf_hygro_a: "Simple flux hygroréglable type A",
  sf_hygro_b: "Simple flux hygroréglable type B",
  df_standard: "Double flux standard (rendement 70–80%)",
  df_haute_perf: "Double flux haute performance (>85%)",
  nat: "Ventilation naturelle",
};

// Presets: [label, efficiency]
const SYSTEM_PRESETS: Record<string, [string, number][]> = {
  "chauffage-gaz": [
    ["Chaudière atmosphérique (ancienne)", 0.75],
    ["Chaudière basse température", 0.85],
    ["Chaudière condensation", 0.95],
    ["Chaudière micro-cogénération", 0.90],
  ],
  "chauffage-fioul": [
    ["Chaudière fioul standard", 0.75],
    ["Chaudière fioul basse température", 0.84],
    ["Chaudière fioul condensation", 0.92],
  ],
  "chauffage-pac": [
    ["PAC air/air (SCOP 2.8)", 2.8],
    ["PAC air/eau standard (SCOP 3.2)", 3.2],
    ["PAC air/eau haute performance (SCOP 4.0)", 4.0],
    ["PAC géothermique (SCOP 4.5)", 4.5],
  ],
  "chauffage-electricite": [
    ["Convecteurs électriques", 1.0],
    ["Radiateurs à inertie", 1.0],
    ["Panneau rayonnant", 1.0],
  ],
  "chauffage-bois": [
    ["Insert / poêle à bûches", 0.70],
    ["Poêle à granulés", 0.85],
    ["Chaudière bois bûches", 0.75],
    ["Chaudière bois granulés", 0.90],
  ],
  "chauffage-reseau_chaleur": [
    ["Réseau de chaleur urbain", 0.90],
  ],
  "ecs-gaz": [
    ["Chauffe-eau instantané gaz", 0.82],
    ["Ballon gaz classique", 0.80],
    ["Chauffe-eau condensation gaz", 0.95],
  ],
  "ecs-electricite": [
    ["Ballon électrique standard", 0.90],
    ["Ballon électrique basse consommation", 0.95],
    ["Chauffe-eau thermodynamique (COP 2.5)", 2.5],
    ["Chauffe-eau thermodynamique HP (COP 3.0)", 3.0],
  ],
  "ecs-solaire": [
    ["CESI (solaire + appoint électrique)", 0.60],
    ["CESI (solaire + appoint gaz)", 0.65],
    ["SSC (système solaire combiné)", 0.55],
  ],
  "ecs-fioul": [
    ["Chauffe-eau fioul standard", 0.78],
  ],
  "ventilation-electricite": [
    ["VMC simple flux autoréglable", 0.60],
    ["VMC simple flux hygroréglable A", 0.65],
    ["VMC simple flux hygroréglable B", 0.70],
    ["VMC double flux standard", 0.80],
    ["VMC double flux haute performance", 0.88],
  ],
  "refroidissement-electricite": [
    ["Climatiseur split mural (EER 2.5)", 2.5],
    ["Climatiseur gainable (EER 3.0)", 3.0],
    ["Groupe froid VRV/DRV", 3.5],
    ["PAC réversible (SEER 4.0)", 4.0],
  ],
};

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
    distribution_type: "",
    vmc_type: "",
    has_thermostat_regulation: false,
    regulation_type: "manuel",
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const presetKey = `${form.system_type}-${form.energy_source}`;
  const presets = SYSTEM_PRESETS[presetKey] ?? [];

  async function handleAdd() {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        system_type: form.system_type,
        energy_source: form.energy_source,
        brand: form.brand || undefined,
        model: form.model || undefined,
        installation_year: form.installation_year ? parseInt(form.installation_year) : undefined,
        nominal_power_kw: form.nominal_power_kw ? parseFloat(form.nominal_power_kw) : undefined,
        efficiency_nominal: form.efficiency_nominal ? parseFloat(form.efficiency_nominal) : undefined,
        distribution_type: form.distribution_type || undefined,
        vmc_type: form.vmc_type || undefined,
        regulation_type: form.regulation_type,
      };
      const res = await buildingsApi.createSystem(buildingId, payload);
      onAdded(res.data);
      setOpen(false);
      setForm({
        system_type: "chauffage", energy_source: "gaz", brand: "", model: "",
        installation_year: "", nominal_power_kw: "", efficiency_nominal: "",
        distribution_type: "", vmc_type: "", has_thermostat_regulation: false, regulation_type: "manuel",
      });
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

  const showDistribution = form.system_type === "chauffage" || form.system_type === "refroidissement";
  const showVmc = form.system_type === "ventilation";
  const isPac = form.energy_source === "pac" || (form.system_type === "refroidissement");
  const efficiencyLabel = isPac ? "Coefficient (SCOP/SEER/COP)" : "Rendement saisonnier (0–1)";
  const efficiencyPlaceholder = isPac ? "3.2" : "0.87";

  return (
    <div className="border border-brand-200 rounded-lg p-4 bg-brand-50 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-800 flex items-center gap-1.5">
          <Zap size={14} />
          Nouveau système
        </p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>

      {/* Type + Source */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Type de système *</label>
          <select className="input text-sm" value={form.system_type} onChange={(e) => set("system_type", e.target.value)}>
            {Object.entries(SYSTEM_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Source d&apos;énergie *</label>
          <select className="input text-sm" value={form.energy_source} onChange={(e) => set("energy_source", e.target.value)}>
            {Object.entries(ENERGY_SOURCE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div>
          <label className="label text-xs">Équipement type (préremplissage rendement)</label>
          <select
            className="input text-sm"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) set("efficiency_nominal", e.target.value);
            }}
          >
            <option value="">— Choisir un équipement type —</option>
            {presets.map(([label, eff]) => (
              <option key={label} value={eff.toString()}>{label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Rendement / SCOP */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">{efficiencyLabel}</label>
          <input
            className="input text-sm"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={form.efficiency_nominal}
            onChange={(e) => set("efficiency_nominal", e.target.value)}
            placeholder={efficiencyPlaceholder}
          />
        </div>
        <div>
          <label className="label text-xs">Puissance nominale (kW)</label>
          <input
            className="input text-sm"
            type="number"
            step="0.1"
            value={form.nominal_power_kw}
            onChange={(e) => set("nominal_power_kw", e.target.value)}
            placeholder="120"
          />
        </div>
      </div>

      {/* Distribution (chauffage/clim) */}
      {showDistribution && (
        <div>
          <label className="label text-xs">Type de distribution</label>
          <select className="input text-sm" value={form.distribution_type} onChange={(e) => set("distribution_type", e.target.value)}>
            <option value="">— Non renseigné —</option>
            {Object.entries(DISTRIBUTION_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      )}

      {/* VMC type */}
      {showVmc && (
        <div>
          <label className="label text-xs">Type de VMC</label>
          <select className="input text-sm" value={form.vmc_type} onChange={(e) => set("vmc_type", e.target.value)}>
            <option value="">— Non renseigné —</option>
            {Object.entries(VMC_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      )}

      {/* Régulation */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Régulation</label>
          <select className="input text-sm" value={form.regulation_type} onChange={(e) => set("regulation_type", e.target.value)}>
            <option value="manuel">Manuelle (robinets)</option>
            <option value="thermostat_simple">Thermostat simple</option>
            <option value="thermostat_programmable">Thermostat programmable</option>
            <option value="regulation_meteo">Régulation météo (sonde extérieure)</option>
            <option value="gtb">GTB / GTC</option>
          </select>
        </div>
        <div>
          <label className="label text-xs">Année d&apos;installation</label>
          <input
            className="input text-sm"
            type="number"
            min="1950"
            max="2030"
            value={form.installation_year}
            onChange={(e) => set("installation_year", e.target.value)}
            placeholder="2010"
          />
        </div>
      </div>

      {/* Marque / Modèle */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label text-xs">Marque</label>
          <input className="input text-sm" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Viessmann, Daikin…" />
        </div>
        <div>
          <label className="label text-xs">Modèle</label>
          <input className="input text-sm" value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="Vitodens 200" />
        </div>
      </div>

      <button className="btn-primary text-sm py-1.5 w-full justify-center" onClick={handleAdd} disabled={loading}>
        {loading ? "Ajout..." : "Ajouter le système"}
      </button>
    </div>
  );
}
