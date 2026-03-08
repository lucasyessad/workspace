"use client";

/** Enregistrer un clic WhatsApp/Appel pour les analytics */
export function trackerClic(
  listingId: string,
  agentId: string,
  typeClic: "whatsapp" | "appel" | "favori"
) {
  fetch("/api/analytics/clic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listing_id: listingId,
      agent_id: agentId,
      type_clic: typeClic,
    }),
  }).catch(() => {
    // Ignorer silencieusement
  });
}
