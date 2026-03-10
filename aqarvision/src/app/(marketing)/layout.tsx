import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Building2 className="h-6 w-6 text-bleu-nuit" />
            <span className="font-display text-lg font-bold text-bleu-nuit">AqarVision</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              Fonctionnalités
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              Tarifs
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" variant="or" asChild>
              <Link href="/signup">Créer mon agence</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-bleu-nuit text-white">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-or" />
                <span className="font-display text-lg font-bold">AqarVision</span>
              </div>
              <p className="mt-3 text-sm text-white/60">
                La plateforme immobilière premium pour les agences algériennes.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/features" className="transition-colors hover:text-white cursor-pointer">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="transition-colors hover:text-white cursor-pointer">Tarifs</Link></li>
                <li><Link href="/demo" className="transition-colors hover:text-white cursor-pointer">Démo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/contact" className="transition-colors hover:text-white cursor-pointer">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="#" className="transition-colors hover:text-white cursor-pointer">Conditions d'utilisation</Link></li>
                <li><Link href="#" className="transition-colors hover:text-white cursor-pointer">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/40">
            AqarVision {new Date().getFullYear()}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
