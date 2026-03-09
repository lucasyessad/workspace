"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur AqarVision:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-blanc-casse flex items-center justify-center px-4">
      <div className="max-w-md text-center animate-fade-in-up">
        {/* Illustration area */}
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="h-9 w-9 text-red-500" />
        </div>

        {/* Error message hierarchy */}
        <h1 className="font-vitrine text-heading-2 font-bold text-foreground mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-body text-muted-foreground mb-10 max-w-sm mx-auto">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à
          la page d&apos;accueil.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="ghost" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-8 text-caption text-muted-foreground/60">
            Code : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
