import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { envoyerEmail } from "@/lib/email";

/** Structure de la notification de contact */
interface ContactNotification {
  listing_id: string;
  agent_id: string;
  type_contact: "whatsapp" | "appel" | "formulaire";
  nom_prospect?: string;
  telephone_prospect?: string;
  message?: string;
}

/** Route API : Enregistrer un contact prospect et notifier l'agent */
export async function POST(request: NextRequest) {
  try {
    const body: ContactNotification = await request.json();
    const supabase = createClient();

    // Enregistrer le contact dans la base de données
    const { error: dbError } = await supabase.from("contacts").insert({
      listing_id: body.listing_id,
      agent_id: body.agent_id,
      type_contact: body.type_contact,
      nom_prospect: body.nom_prospect || null,
      telephone_prospect: body.telephone_prospect || null,
      message: body.message || null,
    });

    if (dbError) {
      console.error("Erreur enregistrement contact:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du contact" },
        { status: 500 }
      );
    }

    // Récupérer les infos de l'agent pour la notification
    const { data: agent } = await supabase
      .from("profiles")
      .select("nom_agence, telephone_whatsapp, email")
      .eq("id", body.agent_id)
      .single();

    // Récupérer le titre de l'annonce
    const { data: listing } = await supabase
      .from("listings")
      .select("titre")
      .eq("id", body.listing_id)
      .single();

    // Envoyer une notification email via Resend si l'agent a un email
    if (agent?.email) {
      try {
        await envoyerEmail(agent.email, "nouveau_contact", {
          nomAgence: agent.nom_agence || "Votre agence",
          titreAnnonce: listing?.titre || "Annonce",
          typeContact: body.type_contact,
          nomProspect: body.nom_prospect || "Anonyme",
          telProspect: body.telephone_prospect,
        });
      } catch (emailError) {
        console.error("Erreur envoi email notification:", emailError);
        // Ne pas bloquer la réponse si l'email échoue
      }
    }

    // Incrémenter le compteur de contacts pour les analytics
    const { error: rpcError } = await supabase.rpc("incrementer_contacts", {
      p_listing_id: body.listing_id,
      p_agent_id: body.agent_id,
    });

    if (rpcError) {
      console.error("Erreur incrémentation contacts:", rpcError);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du contact" },
      { status: 500 }
    );
  }
}
