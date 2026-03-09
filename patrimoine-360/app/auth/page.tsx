"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, LogIn, UserPlus, Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-warning-500/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-warning-500" />
          </div>
          <h1 className="text-heading font-serif text-[var(--color-text-primary)] mb-2">Authentification non disponible</h1>
          <p className="text-body-sm text-[var(--color-text-tertiary)] mb-6">
            Configurez les variables Supabase (NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY) pour activer l&apos;authentification.
          </p>
          <Link href="/" className="btn-ghost text-sm">
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          router.push("/profil");
        }
      } else {
        const result = await signUp(email, password, nom);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold-glow">
              <Sparkles size={20} className="text-navy-950" />
            </div>
            <span className="text-heading font-serif text-[var(--color-text-primary)]">
              Patrimoine <span className="text-gradient-gold">360°</span>
            </span>
          </Link>
          <h1 className="text-heading-xl font-serif text-[var(--color-text-primary)]">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-body-sm text-[var(--color-text-tertiary)] mt-1">
            {mode === "login"
              ? "Accédez à votre profil et vos données"
              : "Remplissez votre profil une seule fois pour tous les modules"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-body-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                <User size={14} className="inline mr-1.5" />
                Nom
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="input-premium w-full"
                placeholder="Votre nom"
              />
            </div>
          )}

          <div>
            <label className="block text-body-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <Mail size={14} className="inline mr-1.5" />
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium w-full"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              <Lock size={14} className="inline mr-1.5" />
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-danger-500 bg-danger-500/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-success-500 bg-success-500/10 rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : mode === "login" ? (
              <><LogIn size={16} /> Se connecter</>
            ) : (
              <><UserPlus size={16} /> Créer le compte</>
            )}
          </button>
        </form>

        <p className="text-center text-body-sm text-[var(--color-text-tertiary)] mt-4">
          {mode === "login" ? (
            <>
              Pas encore de compte ?{" "}
              <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }} className="text-gold-500 hover:text-gold-400 font-medium transition">
                S&apos;inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="text-gold-500 hover:text-gold-400 font-medium transition">
                Se connecter
              </button>
            </>
          )}
        </p>

        <div className="text-center mt-4">
          <Link href="/" className="text-body-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition">
            <ArrowLeft size={14} className="inline mr-1" /> Retour au tableau de bord
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
