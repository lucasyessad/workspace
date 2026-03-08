import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Route API : Enregistrer une vue d'annonce pour les analytics */
export async function POST(request: NextRequest) {
  try {
    const { listing_id, agent_id } = await request.json();

    if (!listing_id || !agent_id) {
      return NextResponse.json(
        { erreur: "listing_id et agent_id sont requis" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Enregistrer la vue
    await supabase.from("analytics_vues").insert({
      listing_id,
      agent_id,
      source: request.headers.get("referer") || "direct",
      user_agent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json({ succes: true });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
