import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { AppState } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey;
}

// Auth
export async function signInWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non configuré");
  return client.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non configuré");
  return client.auth.signUp({ email, password });
}

export async function signOut() {
  const client = getSupabase();
  if (!client) return;
  return client.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

// Sync
export async function syncToCloud(state: AppState): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const user = await getCurrentUser();
  if (!user) return false;

  const { error } = await client
    .from("user_data")
    .upsert({
      user_id: user.id,
      app_state: state,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  return !error;
}

export async function loadFromCloud(): Promise<AppState | null> {
  const client = getSupabase();
  if (!client) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await client
    .from("user_data")
    .select("app_state")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data.app_state as AppState;
}

/*
SQL to create the table in Supabase:

CREATE TABLE user_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  app_state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON user_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
