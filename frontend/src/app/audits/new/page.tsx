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
            <option value="pppt">PPPT</option>
          </select>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          Après création, le calcul énergétique sera lancé automatiquement à partir des données du bâtiment.
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
