"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { storeAuth } from "@/lib/auth";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";

type Step = "org" | "user";

const ORG_TYPES = [
  { value: "syndic", label: "Syndic de copropriété" },
  { value: "bailleur", label: "Bailleur social / OPH" },
  { value: "bureau_etudes", label: "Bureau d'études thermiques" },
  { value: "collectivite", label: "Collectivité / Commune" },
  { value: "promoteur", label: "Promoteur immobilier" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("org");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [org, setOrg] = useState({
    name: "",
    organization_type: "syndic",
  });

  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    job_title: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === "org") {
      setStep("user");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (user.password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setError("");
    setLoading(true);
    try {
      // 1. Créer l'organisation
      const orgRes = await authApi.createOrg({
        name: org.name,
        slug: slugify(org.name),
        organization_type: org.organization_type,
      });
      const orgData = orgRes.data;

      // 2. Créer l'utilisateur
      const userRes = await authApi.register({
        email: user.email,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        job_title: user.job_title,
        organization_id: orgData.id,
      });

      storeAuth(userRes.data.access_token, userRes.data.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Une erreur est survenue. Vérifiez vos informations.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🌡️</span>
          </div>
          <h1 className="text-3xl font-bold text-white">ThermoPilot AI</h1>
          <p className="text-brand-200 mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {(["org", "user"] as Step[]).map((s, i) => {
            const done = step === "user" && s === "org";
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                  ${done ? "bg-green-400 text-white" : active ? "bg-white text-brand-700" : "bg-brand-700 text-brand-300"}`}>
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? "text-white" : "text-brand-300"}`}>
                  {s === "org" ? "Organisation" : "Compte"}
                </span>
                {i < 1 && <ChevronRight size={14} className="text-brand-400" />}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "org" && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Votre organisation</h2>
                <div>
                  <label className="label">Nom de l&apos;organisation *</label>
                  <input
                    className="input"
                    required
                    placeholder="Syndic Les Iris"
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                  />
                  {org.name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Identifiant : <span className="font-mono">{slugify(org.name)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Type d&apos;organisation *</label>
                  <select
                    className="input"
                    value={org.organization_type}
                    onChange={(e) => setOrg({ ...org, organization_type: e.target.value })}
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={!org.name}>
                  Continuer
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {step === "user" && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Votre compte</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Prénom</label>
                    <input className="input" placeholder="Alice" value={user.first_name}
                      onChange={(e) => setUser({ ...user, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Nom</label>
                    <input className="input" placeholder="Dupont" value={user.last_name}
                      onChange={(e) => setUser({ ...user, last_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Fonction</label>
                  <input className="input" placeholder="Gestionnaire de patrimoine"
                    value={user.job_title}
                    onChange={(e) => setUser({ ...user, job_title: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email professionnel *</label>
                  <input className="input" type="email" required placeholder="alice@syndic.fr"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Mot de passe *</label>
                  <input className="input" type="password" required placeholder="8 caractères minimum"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })} />
                </div>
                <div>
                  <label className="label">Confirmer le mot de passe *</label>
                  <input className="input" type="password" required placeholder="••••••••"
                    value={user.confirmPassword}
                    onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })} />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" className="btn-secondary flex-1 justify-center"
                    onClick={() => setStep("org")}>
                    Retour
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                    {loading ? "Création..." : "Créer mon compte"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
