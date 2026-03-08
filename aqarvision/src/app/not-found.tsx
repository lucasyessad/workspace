import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <p className="text-display font-extrabold text-foreground mb-2">404</p>
        <h1 className="text-heading-4 font-semibold text-foreground mb-2">
          Page introuvable
        </h1>
        <p className="text-body-sm text-muted-foreground mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline">
              Espace Agent
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
