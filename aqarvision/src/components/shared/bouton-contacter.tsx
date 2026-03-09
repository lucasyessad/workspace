"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface BoutonContacterProps {
  agentId: string;
  listingId?: string;
  agentName: string;
  className?: string;
}

/** Bouton pour contacter une agence et démarrer une conversation */
export function BoutonContacter({
  agentId,
  listingId,
  agentName,
  className,
}: BoutonContacterProps) {
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function handleClick() {
    // Vérifier l'authentification côté client
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/visiteur/login");
      return;
    }

    setChargement(true);

    try {
      const res = await fetch("/api/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          listing_id: listingId || null,
          message: `Bonjour, je suis intéressé(e) par votre annonce. Pourriez-vous me donner plus d'informations ?`,
        }),
      });

      if (!res.ok) {
        console.error("Erreur création conversation");
        setChargement(false);
        return;
      }

      const data = await res.json();
      router.push(`/espace/messages/${data.conversation_id}`);
    } catch {
      console.error("Erreur lors de la création de la conversation");
      setChargement(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={chargement}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200",
        "bg-[#0c1b2a] text-white hover:bg-[#0c1b2a]/90",
        "border border-[#b8963e]/30 hover:border-[#b8963e]/60",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {chargement ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      <span>Contacter {agentName}</span>
    </button>
  );
}
