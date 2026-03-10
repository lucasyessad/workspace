'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WilayaSelector } from '@/components/algeria/wilaya-selector';
import { TRANSACTION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/constants';
import type { SearchFilters } from '@/types';

interface SearchFiltersBarProps {
  filters: SearchFilters;
}

export function SearchFiltersBar({ filters }: SearchFiltersBarProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [query, setQuery] = useState(filters.query ?? '');
  const [transactionType, setTransactionType] = useState(filters.transactionType ?? '');
  const [propertyType, setPropertyType] = useState(filters.propertyType ?? '');
  const [wilaya, setWilaya] = useState(filters.wilaya ?? '');
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() ?? '');
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() ?? '');
  const [surfaceMin, setSurfaceMin] = useState(filters.surfaceMin?.toString() ?? '');
  const [surfaceMax, setSurfaceMax] = useState(filters.surfaceMax?.toString() ?? '');
  const [rooms, setRooms] = useState(filters.rooms?.toString() ?? '');
  const [bedrooms, setBedrooms] = useState(filters.bedrooms?.toString() ?? '');
  const [sortBy, setSortBy] = useState(filters.sortBy ?? 'newest');

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (transactionType) params.set('transaction', transactionType);
    if (propertyType) params.set('type', propertyType);
    if (wilaya) params.set('wilaya', wilaya);
    if (priceMin) params.set('price_min', priceMin);
    if (priceMax) params.set('price_max', priceMax);
    if (surfaceMin) params.set('surface_min', surfaceMin);
    if (surfaceMax) params.set('surface_max', surfaceMax);
    if (rooms) params.set('rooms', rooms);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    router.push(`/recherche?${params.toString()}`);
  }

  function handleClear() {
    setQuery('');
    setTransactionType('');
    setPropertyType('');
    setWilaya('');
    setPriceMin('');
    setPriceMax('');
    setSurfaceMin('');
    setSurfaceMax('');
    setRooms('');
    setBedrooms('');
    setSortBy('newest');
    router.push('/recherche');
  }

  return (
    <div className="space-y-4">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un bien..."
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="h-10 rounded-md border bg-white px-3 text-sm"
        >
          <option value="">Toute transaction</option>
          {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <WilayaSelector value={wilaya} onChange={setWilaya} placeholder="Toute wilaya" />
        <Button onClick={handleSearch} variant="or">
          Rechercher
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Filtres avancés"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced filters drawer */}
      {showAdvanced && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filtres avancés</h3>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="mr-1 h-3 w-3" /> Tout effacer
            </Button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Type de bien</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="h-9 w-full rounded-md border bg-white px-2 text-sm"
              >
                <option value="">Tous</option>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Prix min (DA)</label>
              <Input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="Ex: 5000000"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Prix max (DA)</label>
              <Input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="Ex: 50000000"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Surface min (m²)</label>
              <Input
                type="number"
                value={surfaceMin}
                onChange={(e) => setSurfaceMin(e.target.value)}
                placeholder="Ex: 80"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Surface max (m²)</label>
              <Input
                type="number"
                value={surfaceMax}
                onChange={(e) => setSurfaceMax(e.target.value)}
                placeholder="Ex: 200"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Pièces min</label>
              <Input
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value)}
                placeholder="Ex: 3"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Chambres min</label>
              <Input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="Ex: 2"
                className="h-9"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchFilters['sortBy'])}
                className="h-9 w-full rounded-md border bg-white px-2 text-sm"
              >
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="surface_desc">Surface décroissante</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch} variant="or" size="sm">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
