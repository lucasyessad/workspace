"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { buildingsApi } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    project_code: "",
    project_status: "active",
    client_reference: "",
    description: "",
    calculation_method: "3CL_DPE_2021",
    climate_zone: "H2b",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== "")
      );
      const res = await buildingsApi.createProject(payload);
      router.push(`/projects/${res.data.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft size={16} /> Retour aux projets
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nouveau projet</h1>
        <p className="text-gray-500 text-sm mb-8">
          Un projet regroupe vos bâtiments, audits, plans de rénovation et rapports associés.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identification */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Identification</h2>
            <div>
              <label className="label">Nom du projet *</label>
              <input className="input" required value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Rénovation globale Résidence Les Pins" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Code projet</label>
                <input className="input" value={form.project_code}
                  onChange={(e) => set("project_code", e.target.value)}
                  placeholder="PROJ-2026-001" />
              </div>
              <div>
                <label className="label">Statut</label>
                <select className="input" value={form.project_status}
                  onChange={(e) => set("project_status", e.target.value)}>
                  <option value="active">Actif</option>
                  <option value="on_hold">En pause</option>
                  <option value="completed">Clôturé</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Référence client / maître d&apos;ouvrage</label>
              <input className="input" value={form.client_reference}
                onChange={(e) => set("client_reference", e.target.value)}
                placeholder="Syndic Dupont & Associés — Mandat n°1234" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input h-20 resize-none" value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Contexte du projet, objectifs, bâtiments concernés..." />
            </div>
          </div>

          {/* Paramètres de calcul */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Paramètres de calcul réglementaire</h2>
            <p className="text-xs text-gray-400">
              Ces paramètres s&apos;appliquent par défaut aux nouveaux audits de ce projet.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Méthode de calcul</label>
                <select className="input" value={form.calculation_method}
                  onChange={(e) => set("calculation_method", e.target.value)}>
                  <option value="3CL_DPE_2021">3CL-DPE 2021 — Résidentiel existant</option>
                  <option value="ThCE_Ex">Th-CE-Ex — Tertiaire existant</option>
                  <option value="RE2020">RE2020 — Neuf post-2022</option>
                  <option value="RT2012">RT2012 — Référence pré-2022</option>
                </select>
              </div>
              <div>
                <label className="label">Zone climatique</label>
                <select className="input" value={form.climate_zone}
                  onChange={(e) => set("climate_zone", e.target.value)}>
                  <optgroup label="Zone H1 — Grand Nord / Est">
                    <option value="H1a">H1a — Strasbourg, Metz</option>
                    <option value="H1b">H1b — Paris, Lyon</option>
                    <option value="H1c">H1c — Brest, Nantes</option>
                  </optgroup>
                  <optgroup label="Zone H2 — Centre">
                    <option value="H2a">H2a — La Rochelle, Poitiers</option>
                    <option value="H2b">H2b — Bordeaux, Toulouse</option>
                    <option value="H2c">H2c — Grenoble, Valence</option>
                    <option value="H2d">H2d — Perpignan, Montpellier</option>
                  </optgroup>
                  <optgroup label="Zone H3 — Méditerranée">
                    <option value="H3">H3 — Marseille, Nice</option>
                  </optgroup>
                  <optgroup label="DOM-TOM">
                    <option value="DOM_971">Guadeloupe (971)</option>
                    <option value="DOM_972">Martinique (972)</option>
                    <option value="DOM_973">Guyane (973)</option>
                    <option value="DOM_974">La Réunion (974)</option>
                    <option value="DOM_976">Mayotte (976)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Contact référent</h2>
            <div>
              <label className="label">Nom du responsable</label>
              <input className="input" value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                placeholder="Jean Martin" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="j.martin@syndic.fr" />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="06 12 34 56 78" />
              </div>
            </div>
            <div>
              <label className="label">Notes internes</label>
              <textarea className="input h-16 resize-none" value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Contraintes, calendrier, accès bâtiments..." />
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/projects" className="btn-secondary">Annuler</Link>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading || !form.name}>
              {loading ? "Création..." : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
