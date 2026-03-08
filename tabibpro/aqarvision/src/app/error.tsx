"use client";

import { useEffect } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Page d'erreur 500 personnalisée */
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
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-bleu-nuit mb-4">Oups !</h1>
        <h2 className="text-xl font-semibold text-bleu-nuit mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-8">
          Nous sommes désolés. Veuillez réessayer ou revenir plus tard.
        </p>
        <Button variant="or" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
