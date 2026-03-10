'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aqar_recently_viewed';
const MAX_ITEMS = 20;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  slug: string;
  agencySlug: string;
  price: number;
  wilaya: string;
  viewedAt: number;
}

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

    // Remove duplicate
    const filtered = items.filter((i) => i.id !== item.id);

    // Add at beginning
    filtered.unshift({ ...item, viewedAt: Date.now() });

    // Keep max
    const trimmed = filtered.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  return items;
}
