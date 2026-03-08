// ============================================================
// TabibPro Mobile — Store Authentification
// Zustand + SecureStore (tokens chiffrés sur l'appareil)
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { UserRole } from '@tabibpro/shared';

interface Session {
  userId: string;
  role: UserRole;
  nom: string;
  prenom: string;
  email: string;
  token: string;
  refreshToken: string;
  // Spécifique professionnel
  numeroCnom?: string;
  specialite?: string;
  emailPro?: string;
}

interface AuthState {
  session: Session | null;
  hydrated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
  setHydrated: (v: boolean) => void;
}

// Storage SecureStore pour Expo (tokens chiffrés)
const secureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'tabibpro-auth',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
