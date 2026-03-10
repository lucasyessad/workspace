'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { WILAYA_OPTIONS } from '@/lib/constants/wilayas';

export function HeroSearchBar() {
  const router = useRouter();
  const [transaction, setTransaction] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [query, setQuery] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (transaction) params.set('transaction', transaction);
    if (wilaya) params.set('wilaya', wilaya);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl bg-white p-2 shadow-float">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Appartement, villa, terrain..."
            className="h-12 w-full rounded-xl border-0 bg-transparent pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-or/20"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          value={transaction}
          onChange={(e) => setTransaction(e.target.value)}
          className="h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm text-foreground"
        >
          <option value="">Achat ou location</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={wilaya}
          onChange={(e) => setWilaya(e.target.value)}
          className="h-12 rounded-xl border-0 bg-muted/50 px-4 text-sm text-foreground"
        >
          <option value="">Toute wilaya</option>
          {WILAYA_OPTIONS.map((w) => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
        <Button onClick={handleSearch} variant="or" className="h-12 px-8 rounded-xl">
          Rechercher
        </Button>
      </div>
    </div>
  );
}
