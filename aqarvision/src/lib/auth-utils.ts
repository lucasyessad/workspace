import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/** Déterminer le rôle de l'utilisateur connecté */
export async function getUserRole(): Promise<{
  user: any;
  role: UserRole | null;
  profile: any;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null, profile: null };

  // Vérifier si c'est un visiteur
  const metaRole = user.user_metadata?.role;
  if (metaRole === "visitor") {
    const { data: visitorProfile } = await supabase
      .from("visitor_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return { user, role: "visitor", profile: visitorProfile };
  }

  // Sinon c'est un agent
  const { data: agentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, role: "agent", profile: agentProfile };
}
