import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    }

    // Récupérer les infos de l'agent pour la notification
    const { data: agent } = await supabase
      .from("profiles")
      .select("nom_agence, telephone_whatsapp")
      .eq("id", body.agent_id)
      .single();

    // Récupérer le titre de l'annonce
    const { data: listing } = await supabase
      .from("listings")
      .select("titre")
      .eq("id", body.listing_id)
      .single();

    // Envoyer une notification email si configuré
    if (process.env.SMTP_HOST && agent) {
      await envoyerEmailNotification({
        destinataire: agent.nom_agence,
        annonce: listing?.titre || "Annonce",
        typeContact: body.type_contact,
        nomProspect: body.nom_prospect,
      });
    }

    // Incrémenter le compteur de contacts pour les analytics
    await supabase.rpc("incrementer_contacts", {
      p_listing_id: body.listing_id,
      p_agent_id: body.agent_id,
    });

    return NextResponse.json({ succes: true });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de l'enregistrement du contact" },
      { status: 500 }
    );
  }
}

/** Envoyer un email de notification (modèle) */
async function envoyerEmailNotification(params: {
  destinataire: string;
  annonce: string;
  typeContact: string;
  nomProspect?: string;
}) {
  // Implémentation SMTP à compléter selon le provider choisi
  // Compatible avec : Resend, SendGrid, Mailgun, SMTP standard
  console.log(
    `[Notification Email] Nouveau ${params.typeContact} pour "${params.annonce}" ` +
    `de ${params.nomProspect || "Anonyme"} → ${params.destinataire}`
  );
}
