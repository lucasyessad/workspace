import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** GET : Liste des vérifications de documents (admin) */
export async function GET(request: NextRequest) {
  try {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("document_verifications")
      .select(
        "*, profiles:agent_id(nom_agence, email), listings:listing_id(titre)",
        { count: "exact" }
      )
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      verifications: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Erreur admin verifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : Approuver ou rejeter une vérification */
export async function PATCH(request: NextRequest) {
  try {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { verificationId, action, notes } = await request.json();

    if (!verificationId || !["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "verificationId et action (verify/reject) requis" },
        { status: 400 }
      );
    }

    const newStatus = action === "verify" ? "verified" : "rejected";

    const { error } = await supabase
      .from("document_verifications")
      .update({
        status: newStatus,
        notes: notes || null,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", verificationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Récupérer les infos pour l'email de notification
    const { data: verification } = await supabase
      .from("document_verifications")
      .select("*, profiles:agent_id(email, nom_agence), listings:listing_id(titre)")
      .eq("id", verificationId)
      .single();

    if (verification?.profiles) {
      // Envoyer une notification email à l'agent
      const profile = verification.profiles as any;
      const listing = verification.listings as any;
      try {
        const { envoyerEmail } = await import("@/lib/email");
        await envoyerEmail(profile.email, "verification_document", {
          nomAgence: profile.nom_agence,
          titreAnnonce: listing?.titre || "Annonce",
          statut: newStatus,
          notes: notes || undefined,
        });
      } catch (emailError) {
        console.error("Erreur envoi email notification:", emailError);
      }
    }

    // Si vérifié, mettre à jour le badge de l'agence
    if (newStatus === "verified" && verification) {
      await supabase
        .from("profiles")
        .update({ est_verifie: true })
        .eq("id", (verification as any).agent_id);
    }

    return NextResponse.json({ succes: true, status: newStatus });
  } catch (error) {
    console.error("Erreur admin verification PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
