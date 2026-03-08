"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { auditsApi, buildingsApi } from "@/lib/api";
import { Building, BuildingProject } from "@/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function NewAuditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillBuildingId = searchParams.get("building_id") ?? "";

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [projects, setProjects] = useState<BuildingProject[]>([]);
  const [form, setForm] = useState({
    building_id: prefillBuildingId,
    project_id: "",
    audit_type: "standard",
    calculation_method: "3CL_DPE_2021",
    climate_zone: "H2b",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    buildingsApi.listBuildings().then((r) => {
      setBuildings(r.data);
      if (!form.building_id && r.data.length > 0) {
        setForm((f) => ({ ...f, building_id: r.data[0].id }));
      }
    });
    buildingsApi.listProjects().then((r) => {
      setProjects(r.data);
      if (r.data.length > 0) setForm((f) => ({ ...f, project_id: r.data[0].id }));
    });
  }, [form.building_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auditsApi.create(form);
      router.push(`/audits/${res.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-xl">
      <Link href="/audits" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} />
        Retour aux audits
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouvel audit énergétique</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Bâtiment *</label>
          <select className="input" required value={form.building_id}
            onChange={(e) => setForm((f) => ({ ...f, building_id: e.target.value }))}>
            <option value="">Sélectionner un bâtiment</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Projet *</label>
          <select className="input" required value={form.project_id}
            onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}>
            <option value="">Sélectionner un projet</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Type d&apos;audit</label>
          <select className="input" value={form.audit_type}
            onChange={(e) => setForm((f) => ({ ...f, audit_type: e.target.value }))}>
            <option value="standard">Standard</option>
            <option value="reglementaire">Réglementaire (DPE collectif)</option>
            <option value="pppt">PPPT — Plan Pluriannuel de Travaux</option>
            <option value="simplifie">Simplifié (pré-diagnostic)</option>
          </select>
        </div>

        <div>
          <label className="label">Méthode de calcul réglementaire</label>
          <select className="input" value={form.calculation_method}
            onChange={(e) => setForm((f) => ({ ...f, calculation_method: e.target.value }))}>
            <option value="3CL_DPE_2021">3CL-DPE 2021 — Logements résidentiels existants</option>
            <option value="ThCE_Ex">Th-CE-Ex — Tertiaire existant</option>
            <option value="RE2020">RE2020 — Constructions neuves (post-2022)</option>
            <option value="RT2012">RT2012 / RTex — Référence pré-2022</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {form.calculation_method === "3CL_DPE_2021" && "Méthode conventionnelle obligatoire pour le DPE et l'audit réglementaire résidentiel."}
            {form.calculation_method === "ThCE_Ex" && "Méthode réglementaire pour les bâtiments tertiaires existants (bureaux, commerces, ERP)."}
            {form.calculation_method === "RE2020" && "Réglementation environnementale 2020 — bâtiments neufs, intègre le bilan carbone ACV."}
            {form.calculation_method === "RT2012" && "Référence thermique 2012 — utilisée pour les rénovations de bâtiments construits avant 2022."}
          </p>
        </div>

        <div>
          <label className="label">Zone climatique</label>
          <select className="input" value={form.climate_zone}
            onChange={(e) => setForm((f) => ({ ...f, climate_zone: e.target.value }))}>
            <optgroup label="Zone H1 — Grand Nord / Est (froid)">
              <option value="H1a">H1a — Strasbourg, Metz, Reims</option>
              <option value="H1b">H1b — Paris, Lyon, Clermont-Ferrand</option>
              <option value="H1c">H1c — Brest, Rennes, Nantes</option>
            </optgroup>
            <optgroup label="Zone H2 — Centre (tempéré)">
              <option value="H2a">H2a — La Rochelle, Poitiers</option>
              <option value="H2b">H2b — Bordeaux, Toulouse</option>
              <option value="H2c">H2c — Grenoble, Valence</option>
              <option value="H2d">H2d — Perpignan, Montpellier</option>
            </optgroup>
            <optgroup label="Zone H3 — Sud / Méditerranée (chaud)">
              <option value="H3">H3 — Marseille, Nice, Toulon</option>
            </optgroup>
            <optgroup label="Départements et régions d'outre-mer">
              <option value="DOM_971">Guadeloupe (971)</option>
              <option value="DOM_972">Martinique (972)</option>
              <option value="DOM_973">Guyane (973)</option>
              <option value="DOM_974">La Réunion (974)</option>
              <option value="DOM_976">Mayotte (976)</option>
            </optgroup>
          </select>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          Après création, renseignez les systèmes et l&apos;enveloppe du bâtiment, puis lancez le calcul énergétique.
        </div>

        <button type="submit" className="btn-primary w-full justify-center" disabled={loading || !form.building_id}>
          {loading ? "Création..." : "Créer et calculer"}
        </button>
      </form>
    </div>
  );
}

export default function NewAuditPage() {
  return (
    <AppLayout>
      <Suspense>
        <NewAuditForm />
      </Suspense>
    </AppLayout>
  );
}
