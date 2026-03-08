import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Route de déconnexion */
export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
}
