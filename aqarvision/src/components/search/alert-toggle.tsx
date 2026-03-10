'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleSearchAlert, deleteSavedSearch } from '@/lib/actions/saved-searches';

interface AlertToggleProps {
  searchId: string;
  isActive: boolean;
}

export function AlertToggle({ searchId, isActive }: AlertToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await toggleSearchAlert(searchId);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    await deleteSavedSearch(searchId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={loading}
        title={isActive ? 'Mettre en pause' : 'Activer'}
      >
        {isActive ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={loading}
        className="text-destructive hover:text-destructive"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
