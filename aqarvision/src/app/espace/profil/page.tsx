"use client";

import { useEffect, useState } from "react";
import { User, Save, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WILAYAS } from "@/lib/wilayas";

interface VisitorProfile {
  nom: string;
  telephone: string;
  wilaya_id: number | null;
}

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [wilayaId, setWilayaId] = useState<string>("");

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("visitor_profiles")
        .select("nom, telephone, wilaya_id")
        .eq("id", user.id)
        .single();

      if (data) {
        setNom(data.nom || "");
        setTelephone(data.telephone || "");
        setWilayaId(data.wilaya_id ? data.wilaya_id.toString() : "");
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFeedback({ type: "error", message: "Vous n'etes pas connecte." });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("visitor_profiles")
      .upsert({
        id: user.id,
        nom,
        telephone,
        wilaya_id: wilayaId ? parseInt(wilayaId, 10) : null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setFeedback({
        type: "error",
        message: "Une erreur est survenue. Veuillez reessayer.",
      });
    } else {
      setFeedback({
        type: "success",
        message: "Profil mis a jour avec succes.",
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {nom || "Visiteur"}
            </p>
            <p className="text-xs text-gray-500">Espace visiteur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
            </label>
            <input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c1b2a]/20 focus:border-[#0c1b2a]"
            />
          </div>

          {/* Telephone */}
          <div>
            <label
              htmlFor="telephone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Telephone
            </label>
            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="0555 00 00 00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0c1b2a]/20 focus:border-[#0c1b2a]"
            />
          </div>

          {/* Wilaya */}
          <div>
            <label
              htmlFor="wilaya"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wilaya{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <select
              id="wilaya"
              value={wilayaId}
              onChange={(e) => setWilayaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0c1b2a]/20 focus:border-[#0c1b2a] bg-white"
            >
              <option value="">-- Selectionnez une wilaya --</option>
              {WILAYAS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.nom_fr}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1b2a] text-white text-sm font-medium rounded-lg hover:bg-[#0c1b2a]/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
