// ============================================================
// TabibPro Mobile — Store Offline
// File d'attente des actions hors ligne
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import type { SyncItem } from '@tabibpro/shared';

const mmkv = new MMKV({ id: 'tabibpro-offline' });

const mmkvStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string) => mmkv.delete(key),
};

interface OfflineState {
  isOnline: boolean;
  pendingQueue: SyncItem[];
  lastSyncAt: string | null;
  isSyncing: boolean;
  setOnline: (v: boolean) => void;
  enqueue: (item: Omit<SyncItem, 'id' | 'synced'>) => void;
  dequeue: (id: string) => void;
  clearQueue: () => void;
  setLastSync: (date: string) => void;
  setSyncing: (v: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingQueue: [],
      lastSyncAt: null,
      isSyncing: false,

      setOnline: (isOnline) => set({ isOnline }),

      enqueue: (item) => {
        const newItem: SyncItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          synced: false,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ pendingQueue: [...s.pendingQueue, newItem] }));
      },

      dequeue: (id) =>
        set((s) => ({ pendingQueue: s.pendingQueue.filter((i) => i.id !== id) })),

      clearQueue: () => set({ pendingQueue: [] }),

      setLastSync: (lastSyncAt) => set({ lastSyncAt }),

      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: 'tabibpro-offline',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
