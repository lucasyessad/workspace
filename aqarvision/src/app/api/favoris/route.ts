import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET : Vérifier si une annonce est en favori */
export async function GET(request: NextRequest) {
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

    const listingId = request.nextUrl.searchParams.get("listing_id");

    if (!listingId) {
      return NextResponse.json(
        { error: "listing_id requis" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("visitor_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (error) {
      console.error("Erreur vérification favori:", error);
      return NextResponse.json(
        { error: "Erreur lors de la vérification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorited: !!data });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/** POST : Ajouter une annonce aux favoris */
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

    const { listing_id } = await request.json();

    if (!listing_id) {
      return NextResponse.json(
        { error: "listing_id requis" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("favorites").insert({
      visitor_id: user.id,
      listing_id,
    });

    if (error) {
      console.error("Erreur ajout favori:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'ajout" },
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

/** DELETE : Retirer une annonce des favoris */
export async function DELETE(request: NextRequest) {
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

    const { listing_id } = await request.json();

    if (!listing_id) {
      return NextResponse.json(
        { error: "listing_id requis" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("visitor_id", user.id)
      .eq("listing_id", listing_id);

    if (error) {
      console.error("Erreur suppression favori:", error);
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
