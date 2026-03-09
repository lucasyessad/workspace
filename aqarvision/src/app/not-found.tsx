import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center px-4">
      <div className="max-w-md text-center animate-fade-in-up">
        {/* Large 404 display */}
        <p className="font-vitrine text-[8rem] leading-none font-extrabold text-foreground/5 select-none mb-2">
          404
        </p>

        {/* Message */}
        <h1 className="font-vitrine text-heading-1 font-bold text-foreground mb-3">
          Page introuvable
        </h1>
        <p className="text-body text-muted-foreground mb-10 max-w-sm mx-auto">
          La page que vous recherchez n&apos;existe pas, a été déplacée ou
          n&apos;est plus disponible.
        </p>

        {/* CTA */}
        <Link href="/">
          <Button size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
