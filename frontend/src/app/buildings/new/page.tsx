"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { buildingsApi } from "@/lib/api";
import { BuildingProject } from "@/types";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewBuildingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<BuildingProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    project_id: "",
    name: "",
    address_line_1: "",
    postal_code: "",
    city: "",
    construction_year: "",
    building_type: "collectif",
    ownership_type: "copropriete",
    heated_area_m2: "",
    floors_above_ground: "",
    current_energy_label: "",
  });

  useEffect(() => {
    buildingsApi.listProjects().then((r) => {
      setProjects(r.data);
      if (r.data.length > 0) setForm((f) => ({ ...f, project_id: r.data[0].id }));
    });
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Create project if none
      let projectId = form.project_id;
      if (!projectId) {
        const proj = await buildingsApi.createProject({
          name: form.name + " — Projet",
          project_status: "active",
        });
        projectId = proj.data.id;
      }
      const payload = {
        ...form,
        project_id: projectId,
        construction_year: form.construction_year ? parseInt(form.construction_year) : undefined,
        heated_area_m2: form.heated_area_m2 ? parseFloat(form.heated_area_m2) : undefined,
        floors_above_ground: form.floors_above_ground ? parseInt(form.floors_above_ground) : undefined,
      };
      const res = await buildingsApi.createBuilding(payload);
      router.push(`/buildings/${res.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <Link href="/buildings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} />
          Retour aux bâtiments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Nouveau bâtiment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Projet */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Projet</h2>
            {projects.length > 0 ? (
              <div>
                <label className="label">Projet associé</label>
                <select
                  className="input"
                  value={form.project_id}
                  onChange={(e) => set("project_id", e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Un projet sera créé automatiquement.</p>
            )}
          </div>

          {/* Identification */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Identification</h2>
            <div>
              <label className="label">Nom du bâtiment *</label>
              <input className="input" required value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Résidence Les Iris" />
            </div>
            <div>
              <label className="label">Adresse</label>
              <input className="input" value={form.address_line_1}
                onChange={(e) => set("address_line_1", e.target.value)}
                placeholder="12 rue de la Paix" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Code postal</label>
                <input className="input" value={form.postal_code}
                  onChange={(e) => set("postal_code", e.target.value)} placeholder="75001" />
              </div>
              <div>
                <label className="label">Ville</label>
                <input className="input" value={form.city}
                  onChange={(e) => set("city", e.target.value)} placeholder="Paris" />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Caractéristiques techniques</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Année de construction</label>
                <input className="input" type="number" value={form.construction_year}
                  onChange={(e) => set("construction_year", e.target.value)} placeholder="1975" />
              </div>
              <div>
                <label className="label">Surface chauffée (m²)</label>
                <input className="input" type="number" value={form.heated_area_m2}
                  onChange={(e) => set("heated_area_m2", e.target.value)} placeholder="2500" />
              </div>
              <div>
                <label className="label">Nombre d&apos;étages</label>
                <input className="input" type="number" value={form.floors_above_ground}
                  onChange={(e) => set("floors_above_ground", e.target.value)} placeholder="8" />
              </div>
              <div>
                <label className="label">Classe DPE actuelle</label>
                <select className="input" value={form.current_energy_label}
                  onChange={(e) => set("current_energy_label", e.target.value)}>
                  <option value="">Inconnue</option>
                  {["A","B","C","D","E","F","G"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type de bâtiment</label>
                <select className="input" value={form.building_type}
                  onChange={(e) => set("building_type", e.target.value)}>
                  <option value="collectif">Collectif</option>
                  <option value="individuel">Individuel</option>
                  <option value="tertiaire">Tertiaire</option>
                </select>
              </div>
              <div>
                <label className="label">Régime de propriété</label>
                <select className="input" value={form.ownership_type}
                  onChange={(e) => set("ownership_type", e.target.value)}>
                  <option value="copropriete">Copropriété</option>
                  <option value="bailleur">Bailleur social</option>
                  <option value="collectivite">Collectivité</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer le bâtiment"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
