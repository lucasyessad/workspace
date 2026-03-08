import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Route API : Enregistrer un clic (WhatsApp, appel, favori) */
export async function POST(request: NextRequest) {
  try {
    const { listing_id, agent_id, type_clic } = await request.json();

    if (!listing_id || !agent_id || !type_clic) {
      return NextResponse.json(
        { erreur: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    await supabase.from("analytics_clics").insert({
      listing_id,
      agent_id,
      type_clic,
    });

    return NextResponse.json({ succes: true });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
