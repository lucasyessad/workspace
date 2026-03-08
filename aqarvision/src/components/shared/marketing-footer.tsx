import Link from "next/link";
import { Building2 } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
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
            <h4 className="text-sm font-semibold text-foreground mb-4">Produit</h4>
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
            </ul>
          </div>

          {/* Agences */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Agences</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/auth/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Créer mon agence
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Légal</h4>
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

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
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
