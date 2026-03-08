import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "aqarvision_verify";

/** GET : Vérification du webhook WhatsApp (challenge) */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** POST : Réception des messages WhatsApp entrants */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const messages = value.messages || [];

        for (const message of messages) {
          const from = message.from; // numéro du prospect
          const text = message.text?.body || "";
          const contactName =
            value.contacts?.[0]?.profile?.name || "Inconnu";

          // Chercher l'agent associé via le numéro WhatsApp Business
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, nom_agence")
            .eq("telephone", value.metadata?.display_phone_number)
            .single();

          if (profile) {
            // Logger le message entrant
            await supabase.from("whatsapp_messages").insert({
              agent_id: profile.id,
              prospect_phone: from,
              prospect_name: contactName,
              message_text: text,
              direction: "incoming",
              whatsapp_message_id: message.id,
              status: "received",
            });

            // Enregistrer comme contact
            await supabase.from("contacts").insert({
              agent_id: profile.id,
              nom: contactName,
              telephone: from,
              type_contact: "whatsapp",
              source: "whatsapp_api",
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erreur webhook WhatsApp:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
