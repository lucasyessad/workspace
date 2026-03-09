"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nom?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  logout: async () => {},
  updateProfile: async () => ({}),
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const client = getSupabase();
    if (!client) return;

    const { data } = await client
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setProfile({
        nom: data.nom,
        email: data.email,
        age: data.age,
        revenus_mensuels: data.revenus_mensuels,
        depenses_mensuelles: data.depenses_mensuelles,
        epargne_totale: data.epargne_totale,
        dettes_totales: data.dettes_totales,
        investissements: data.investissements,
        revenus_annuels: data.revenus_annuels,
        capacite_epargne: data.capacite_epargne,
        statut_fiscal: data.statut_fiscal,
        lieu_residence: data.lieu_residence,
      });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const client = getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const client = getSupabase();
    if (!client) return { error: "Supabase non configuré" };

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, nom?: string) => {
    const client = getSupabase();
    if (!client) return { error: "Supabase non configuré" };

    const { data, error } = await client.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      await client.from("user_profiles").upsert({
        user_id: data.user.id,
        email,
        nom: nom || "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return {};
  };

  const logout = async () => {
    const client = getSupabase();
    if (!client) return;
    await client.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const client = getSupabase();
    if (!client || !user) return { error: "Non connecté" };

    const { error } = await client
      .from("user_profiles")
      .upsert({
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) return { error: error.message };

    setProfile((prev) => ({ ...prev, ...data }));
    return {};
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
