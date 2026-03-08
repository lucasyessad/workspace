import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_CLIC_TYPES = ["whatsapp", "appel", "favori", "partage", "email"];

/** Route API : Enregistrer un clic (WhatsApp, appel, favori) */
export async function POST(request: NextRequest) {
  try {
    const { listing_id, agent_id, type_clic } = await request.json();

    if (!listing_id || !agent_id || !type_clic) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Valider les UUIDs
    if (!UUID_REGEX.test(listing_id) || !UUID_REGEX.test(agent_id)) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 400 }
      );
    }

    // Valider le type de clic
    if (!VALID_CLIC_TYPES.includes(type_clic)) {
      return NextResponse.json(
        { error: "Type de clic invalide" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase.from("analytics_clics").insert({
      listing_id,
      agent_id,
      type_clic,
    });

    if (error) {
      console.error("Erreur enregistrement clic:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
