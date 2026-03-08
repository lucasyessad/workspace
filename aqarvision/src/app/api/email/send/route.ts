import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { envoyerEmail, templates } from "@/lib/email";

/** POST : Envoyer un email (utilisateur authentifié) */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { template, to, params } = await request.json();

    if (!template || !to) {
      return NextResponse.json(
        { error: "Template et destinataire requis" },
        { status: 400 }
      );
    }

    // Vérifier que le template existe
    if (!(template in templates)) {
      return NextResponse.json(
        { error: "Template inconnu" },
        { status: 400 }
      );
    }

    const result = await envoyerEmail(
      to,
      template as keyof typeof templates,
      params
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
