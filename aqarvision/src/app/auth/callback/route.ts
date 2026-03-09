import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Route de callback pour la confirmation d'email Supabase */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Rediriger selon le rôle
      const { data: { user } } = await supabase.auth.getUser();
      const isVisitor = user?.user_metadata?.role === "visitor";
      return NextResponse.redirect(`${origin}${isVisitor ? "/espace" : "/dashboard"}`);
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(`${origin}/auth/login`);
}
