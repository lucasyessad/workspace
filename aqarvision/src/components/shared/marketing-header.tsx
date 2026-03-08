import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-bleu-nuit rounded-lg flex items-center justify-center">
            <Building2 className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Aqar<span className="text-or">Vision</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/#fonctionnalites"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Tarifs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
