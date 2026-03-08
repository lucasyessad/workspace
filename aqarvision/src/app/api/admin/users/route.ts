import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Middleware admin */
async function verifierAdmin(userId: string) {
  const { data } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data;
}

/** GET : Liste des utilisateurs (admin) */
export async function GET(request: NextRequest) {
  try {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = await verifierAdmin(user.id);
    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("profiles")
      .select(
        "*, subscriptions(plan_type, status, trial_end)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      // Sanitize search input to prevent filter injection
      const sanitizedSearch = search.replace(/[%_\\]/g, "\\$&").replace(/[,()]/g, "");
      query = query.or(
        `nom_agence.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`
      );
    }

    const { data: users, count, error } = await query;

    if (error) {
      console.error("Erreur liste users:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Erreur admin users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : Modifier un utilisateur (ban, changer plan, etc.) */
export async function PATCH(request: NextRequest) {
  try {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = await verifierAdmin(user.id);
    if (!admin || admin.role === "moderator") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { userId, action, value } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId et action requis" },
        { status: 400 }
      );
    }

    switch (action) {
      case "change_plan": {
        const { error } = await supabase
          .from("subscriptions")
          .update({ plan_type: value, status: "active", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
        if (error) throw error;
        break;
      }
      case "suspend": {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
        if (error) throw error;
        break;
      }
      case "reactivate": {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("user_id", userId);
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur admin PATCH user:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
