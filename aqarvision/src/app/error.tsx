"use client";

import { useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
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
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="text-heading-3 font-bold text-foreground mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-body-sm text-muted-foreground mb-8">
          Veuillez réessayer ou revenir plus tard.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}
