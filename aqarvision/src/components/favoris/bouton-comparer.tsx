"use client";

import { useState, useEffect } from "react";
import { GitCompareArrows } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  estEnComparaison,
  ajouterComparaison,
  retirerComparaison,
  type BienFavori,
} from "@/lib/favoris";

interface BoutonComparerProps {
  bien: BienFavori;
  className?: string;
}

/** Bouton pour ajouter/retirer un bien de la comparaison */
export function BoutonComparer({ bien, className }: BoutonComparerProps) {
  const [enComparaison, setEnComparaison] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setEnComparaison(estEnComparaison(bien.id));

    const handler = () => setEnComparaison(estEnComparaison(bien.id));
    window.addEventListener("comparaison-change", handler);
    return () => window.removeEventListener("comparaison-change", handler);
  }, [bien.id]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (enComparaison) {
      retirerComparaison(bien.id);
      setEnComparaison(false);
      setMessage(null);
    } else {
      const resultat = ajouterComparaison(bien);
      if (resultat.succes) {
        setEnComparaison(true);
        setMessage(null);
      } else {
        setMessage(resultat.message);
        setTimeout(() => setMessage(null), 3000);
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          "p-2 rounded-full transition-all",
          enComparaison
            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "bg-white/80 text-gray-400 hover:text-blue-500 hover:bg-white",
          className
        )}
        aria-label={
          enComparaison
            ? "Retirer de la comparaison"
            : "Ajouter à la comparaison"
        }
      >
        <GitCompareArrows className="h-4 w-4" />
      </button>
      {message && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {message}
        </div>
      )}
    </div>
  );
}
