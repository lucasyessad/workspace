'use client';

import { useEffect } from 'react';
import { addToRecentlyViewed } from '@/components/search/recently-viewed';

interface RecentlyViewedTrackerProps {
  id: string;
  title: string;
  slug: string;
  agencySlug: string;
  price: number;
  wilaya: string;
}

export function RecentlyViewedTracker(props: RecentlyViewedTrackerProps) {
  useEffect(() => {
    addToRecentlyViewed(props);
  }, [props.id]);

  return null;
}
