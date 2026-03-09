import Link from "next/link";
import { Building2 } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-or/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 glass-dark bg-bleu-nuit rounded-xl flex items-center justify-center">
                <Building2 className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">
                Aqar<span className="text-or">Vision</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plateforme SaaS pour les agences immobilières en Algérie.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 className="font-vitrine text-sm font-semibold text-foreground mb-4">Produit</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#fonctionnalites" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/fr/recherche" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Voir les annonces
                </Link>
              </li>
            </ul>
          </div>

          {/* Espace Pro */}
          <div>
            <h4 className="font-vitrine text-sm font-semibold text-foreground mb-4">Espace Pro</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Créer mon agence
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Connexion agence
                </Link>
              </li>
              <li>
                <Link href="/auth/visiteur/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Espace visiteur
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-vitrine text-sm font-semibold text-foreground mb-4">Légal</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-muted-foreground">
                  Mentions légales
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Confidentialité
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AqarVision. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Conçu pour les 58 wilayas d&apos;Algérie
          </p>
        </div>
      </div>
    </footer>
  );
}
