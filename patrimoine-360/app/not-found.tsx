import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif font-bold text-gradient-gold mb-4">404</div>
        <h1 className="text-heading-xl font-serif text-[var(--color-text-primary)] mb-2">
          Page introuvable
        </h1>
        <p className="text-body-sm text-[var(--color-text-tertiary)] mb-8">
          La page que tu cherches n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Tableau de bord
          </Link>
          <Link href="/landing" className="btn-ghost text-sm">
            <ArrowLeft size={14} /> Page d&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
