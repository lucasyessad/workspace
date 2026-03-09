"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface BoutonFavoriProps {
  listingId: string;
  className?: string;
}

/** Bouton coeur pour ajouter/retirer une annonce des favoris (via API) */
export function BoutonFavori({ listingId, className }: BoutonFavoriProps) {
  const [favori, setFavori] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [animation, setAnimation] = useState(false);
  const router = useRouter();

  const verifierFavori = useCallback(async () => {
    try {
      const res = await fetch(`/api/favoris?listing_id=${listingId}`);
      if (res.status === 401) {
        setChargement(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setFavori(data.favorited);
      }
    } catch {
      // Silently fail
    } finally {
      setChargement(false);
    }
  }, [listingId]);

  useEffect(() => {
    verifierFavori();
  }, [verifierFavori]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Vérifier l'authentification côté client
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/visiteur/login");
      return;
    }

    // Toggle optimiste
    const nouveauFavori = !favori;
    setFavori(nouveauFavori);
    setAnimation(true);
    setTimeout(() => setAnimation(false), 300);

    try {
      const res = await fetch("/api/favoris", {
        method: nouveauFavori ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId }),
      });

      if (!res.ok) {
        // Annuler le toggle optimiste en cas d'erreur
        setFavori(!nouveauFavori);
      }
    } catch {
      setFavori(!nouveauFavori);
    }
  }

  if (chargement) {
    return (
      <button
        className={cn(
          "p-2 rounded-full bg-white/80 text-gray-300",
          className
        )}
        disabled
        aria-label="Chargement"
      >
        <Heart className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-full transition-all duration-200",
        favori
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-white",
        animation && "scale-125",
        className
      )}
      aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-transform duration-200",
          favori && "fill-current"
        )}
      />
    </button>
  );
}
