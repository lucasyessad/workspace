// ============================================================
// TabibPro — Badge de Connectivité
// Indicateur : 🟢 En ligne | 🟡 Synchronisation | 🔴 Hors ligne
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectivityStatus = 'online_synced' | 'online_syncing' | 'offline';

interface SyncState {
  status: ConnectivityStatus;
  pendingCount: number;
}

export function ConnectivityBadge() {
  const t = useTranslations('Offline');
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'online_synced',
    pendingCount: 0,
  });

  useEffect(() => {
    const updateStatus = () => {
      if (!navigator.onLine) {
        setSyncState((prev) => ({ ...prev, status: 'offline' }));
      } else {
        setSyncState((prev) => ({
          ...prev,
          status: prev.pendingCount > 0 ? 'online_syncing' : 'online_synced',
        }));
      }
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [syncState.pendingCount]);

  const statusConfig = {
    online_synced: {
      icon: Wifi,
      label: t('synced'),
      className: 'text-emerald-600 bg-emerald-50',
      dotClass: 'bg-emerald-500',
      animate: false,
    },
    online_syncing: {
      icon: RefreshCw,
      label: t('syncing'),
      className: 'text-amber-600 bg-amber-50',
      dotClass: 'bg-amber-500',
      animate: true,
    },
    offline: {
      icon: WifiOff,
      label: t('mode'),
      className: 'text-red-600 bg-red-50',
      dotClass: 'bg-red-500',
      animate: false,
    },
  };

  const config = statusConfig[syncState.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
        config.className
      )}
      title={
        syncState.status === 'online_syncing' && syncState.pendingCount > 0
          ? t('pending', { count: syncState.pendingCount })
          : config.label
      }
    >
      <span
        className={cn('inline-block h-2 w-2 rounded-full', config.dotClass, {
          'animate-pulse': syncState.status === 'offline',
        })}
      />
      <Icon
        className={cn('h-3 w-3', { 'animate-spin': config.animate })}
        aria-hidden="true"
      />
      <span className="hidden sm:inline">{config.label}</span>
      {syncState.status === 'online_syncing' && syncState.pendingCount > 0 && (
        <span className="ml-0.5">({syncState.pendingCount})</span>
      )}
    </div>
  );
}
