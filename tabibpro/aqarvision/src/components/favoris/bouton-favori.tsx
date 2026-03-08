"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { estFavori, toggleFavori, type BienFavori } from "@/lib/favoris";

interface BoutonFavoriProps {
  bien: BienFavori;
  className?: string;
  taille?: "sm" | "md";
}

/** Bouton coeur pour ajouter/retirer un bien des favoris */
export function BoutonFavori({
  bien,
  className,
  taille = "md",
}: BoutonFavoriProps) {
  const [favori, setFavori] = useState(false);

  useEffect(() => {
    setFavori(estFavori(bien.id));

    // Écouter les changements de favoris
    const handler = () => setFavori(estFavori(bien.id));
    window.addEventListener("favoris-change", handler);
    return () => window.removeEventListener("favoris-change", handler);
  }, [bien.id]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nouveau = toggleFavori(bien);
    setFavori(nouveau);
  }

  const tailles = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all",
        favori
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white",
        className
      )}
      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn(tailles[taille], favori && "fill-current")}
      />
    </button>
  );
}
