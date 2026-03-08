"use client";

import { useEffect, useRef } from "react";

interface TrackerVueProps {
  listingId: string;
  agentId: string;
}

/** Composant invisible qui enregistre une vue d'annonce
 * Utilise IntersectionObserver pour ne compter que les vues réelles
 */
export function TrackerVue({ listingId, agentId }: TrackerVueProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Envoyer la vue avec un léger délai (éviter les bots)
    const timer = setTimeout(() => {
      fetch("/api/analytics/vue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, agent_id: agentId }),
      }).catch(() => {
        // Ignorer silencieusement les erreurs analytics
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [listingId, agentId]);

  return null;
}
