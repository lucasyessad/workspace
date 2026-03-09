"use client";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-danger-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-danger-500" />
        </div>
        <h1 className="text-heading-xl font-serif text-[var(--color-text-primary)] mb-2">
          Erreur inattendue
        </h1>
        <p className="text-body-sm text-[var(--color-text-tertiary)] mb-2">
          {error.message || "Quelque chose s'est mal passé."}
        </p>
        <p className="text-caption text-[var(--color-text-muted)] mb-8">
          Si le problème persiste, essaie de rafraîchir la page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link href="/" className="btn-ghost text-sm">
            <Home size={14} /> Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
