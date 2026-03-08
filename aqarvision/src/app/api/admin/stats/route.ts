import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** GET : Statistiques globales de la plateforme (admin) */
export async function GET() {
  try {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const { data: admin } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Récupérer les stats en parallèle
    const [
      { count: totalAgences },
      { count: totalAnnonces },
      { count: totalContacts },
      { data: subscriptions },
      { count: pendingVerifications },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("plan_type, status")
        .in("status", ["active", "trialing"]),
      supabase
        .from("document_verifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    // Compter les abonnements par plan
    const parPlan = (subscriptions || []).reduce(
      (acc: Record<string, number>, sub) => {
        acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      totalAgences: totalAgences || 0,
      totalAnnonces: totalAnnonces || 0,
      totalContacts: totalContacts || 0,
      pendingVerifications: pendingVerifications || 0,
      abonnementsParPlan: parPlan,
    });
  } catch (error) {
    console.error("Erreur stats admin:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
