'use client';

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveSearch } from '@/lib/actions/saved-searches';
import type { SearchFilters } from '@/types';

interface SaveSearchButtonProps {
  filters: SearchFilters;
}

export function SaveSearchButton({ filters }: SaveSearchButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    const result = await saveSearch({ name, filters, frequency });
    setLoading(false);
    if (result.success) {
      setSaved(true);
      setShowForm(false);
    }
  }

  if (saved) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-success">
        <Bell className="h-4 w-4" />
        Alerte sauvegardée
      </span>
    );
  }

  if (showForm) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la recherche"
          className="h-8 w-40 text-sm"
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as typeof frequency)}
          className="h-8 rounded-md border bg-white px-2 text-xs"
        >
          <option value="instant">Instantanée</option>
          <option value="daily">Quotidienne</option>
          <option value="weekly">Hebdomadaire</option>
        </select>
        <Button size="sm" variant="or" onClick={handleSave} disabled={loading} className="h-8">
          Sauvegarder
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-8">
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowForm(true)}
      className="text-bleu-nuit"
    >
      <Bell className="mr-1.5 h-4 w-4" />
      Sauvegarder cette recherche
    </Button>
  );
}
