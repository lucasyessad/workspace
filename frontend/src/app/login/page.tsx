"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { storeAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      storeAuth(res.data.access_token, res.data.user);
      router.push("/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>

      {/* ── Left panel — brand ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#162a1e" }}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 10% 80%, #18753c 0%, transparent 50%), radial-gradient(circle at 90% 10%, #3fb877 0%, transparent 40%)",
          }}
        />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-9 h-9 rounded flex items-center justify-center text-lg"
              style={{ backgroundColor: `var(--brand-500)` }}>
              🌡️
            </div>
            <span className="font-bold text-xl text-white">ThermoPilot <span style={{ color: "#6dc897" }}>AI</span></span>
          </Link>
        </div>

        {/* Quote / tagline */}
        <div className="relative space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#6dc897" }}>
            <Leaf size={14} /> Certifié ADEME · Méthode 3CL-DPE 2021
          </div>
          <blockquote>
            <p className="text-2xl font-semibold text-white leading-snug">
              "La plateforme de référence pour l'audit énergétique professionnel en France."
            </p>
          </blockquote>
          <p className="text-sm" style={{ color: "#a8c9b5" }}>
            Rejoignez plus de 980 professionnels qui pilotent leur portefeuille immobilier avec ThermoPilot AI.
          </p>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { v: "3 200+", l: "Projets" },
              { v: "14 800+", l: "Bâtiments" },
              { v: "62 GWh", l: "Économisés" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-xl font-bold text-white">{s.v}</p>
                <p className="text-xs" style={{ color: "#6dc897" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16" style={{ backgroundColor: "#f4f4f4" }}>
        <div className="w-full max-w-md mx-auto">

          {/* Back to home */}
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-10 transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: `var(--brand-500)` }}>
              🌡️
            </div>
            <span className="font-bold text-lg text-gray-900">ThermoPilot <span style={{ color: `var(--brand-500)` }}>AI</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion à votre espace</h1>
          <p className="text-sm text-gray-500 mb-8">
            Accédez à vos projets, audits et rapports énergétiques.
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400"
                style={{ "--tw-ring-color": `var(--brand-500)` } as React.CSSProperties}
                placeholder="vous@organisme.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <a href="#" className="text-xs font-medium" style={{ color: `var(--brand-500)` }}>
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400"
                style={{ "--tw-ring-color": `var(--brand-500)` } as React.CSSProperties}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3.5 py-2.5">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded font-semibold text-sm text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: `var(--brand-500)` }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-600)`; }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-500)`; }}
            >
              {loading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register */}
          <div className="bg-white border border-gray-200 rounded p-5 text-center">
            <p className="text-sm text-gray-600 mb-3">Pas encore de compte professionnel ?</p>
            <Link href="/register"
              className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded text-sm font-semibold border-2 transition-colors"
              style={{ borderColor: `var(--brand-500)`, color: `var(--brand-500)` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = `var(--brand-50)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              Créer un compte gratuit
            </Link>
          </div>

          <p className="text-xs text-center text-gray-400 mt-6">
            En vous connectant, vous acceptez nos{" "}
            <a href="#" className="underline">CGU</a> et notre{" "}
            <a href="#" className="underline">politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
