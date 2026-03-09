import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST : Sauvegarder une recherche dans l'historique */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { query, filters, results_count } = await request.json();

    if (!query && !filters) {
      return NextResponse.json(
        { error: "query ou filters requis" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("search_history").insert({
      visitor_id: user.id,
      query: query || null,
      filters: filters || null,
      results_count: results_count ?? 0,
    });

    if (error) {
      console.error("Erreur sauvegarde historique:", error);
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/** DELETE : Effacer tout l'historique de recherche de l'utilisateur */
export async function DELETE() {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("search_history")
      .delete()
      .eq("visitor_id", user.id);

    if (error) {
      console.error("Erreur suppression historique:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
