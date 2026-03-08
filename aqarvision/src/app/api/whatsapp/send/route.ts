import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const WA_API_URL = "https://graph.facebook.com/v18.0";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** POST : Envoyer un message WhatsApp via l'API Business */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!WA_PHONE_ID || !WA_TOKEN) {
      return NextResponse.json(
        { error: "WhatsApp Business API non configurée" },
        { status: 503 }
      );
    }

    const { to, message, listingId } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: "Numéro et message requis" },
        { status: 400 }
      );
    }

    // Envoyer via l'API WhatsApp Business
    const response = await fetch(
      `${WA_API_URL}/${WA_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\+/g, ""),
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Erreur WhatsApp API:", result);
      return NextResponse.json(
        { error: "Erreur d'envoi WhatsApp" },
        { status: 502 }
      );
    }

    // Logger le message sortant
    await serviceClient.from("whatsapp_messages").insert({
      agent_id: user.id,
      listing_id: listingId || null,
      prospect_phone: to,
      message_text: message,
      direction: "outgoing",
      whatsapp_message_id: result.messages?.[0]?.id,
      status: "sent",
    });

    return NextResponse.json({ succes: true, messageId: result.messages?.[0]?.id });
  } catch (error) {
    console.error("Erreur envoi WhatsApp:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
