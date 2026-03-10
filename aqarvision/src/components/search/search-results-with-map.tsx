'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { Map } from 'lucide-react';
import { PropertyCard } from '@/components/real-estate/property-card';
import type { PropertyWithAgency } from '@/types';

const SearchMap = lazy(() =>
  import('@/components/map/search-map').then((m) => ({ default: m.SearchMap }))
);

interface SearchResultsWithMapProps {
  properties: PropertyWithAgency[];
  favoriteIds: string[];
}

export function SearchResultsWithMap({ properties, favoriteIds: favoriteIdsList }: SearchResultsWithMapProps) {
  const favoriteIds = new Set(favoriteIdsList);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  const handlePropertyHover = useCallback((id: string | null) => {
    setActivePropertyId(id);
  }, []);

  return (
    <div>
      {/* Toggle map button (mobile) */}
      <div className="mb-4 flex justify-end lg:hidden">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <Map className="h-4 w-4" />
          {showMap ? 'Masquer la carte' : 'Afficher la carte'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Property list */}
        <div className={showMap ? 'w-full lg:w-1/2 xl:w-3/5' : 'w-full'}>
          <div className="grid gap-6 sm:grid-cols-2">
            {properties.map((property) => (
              <div
                key={property.id}
                onMouseEnter={() => handlePropertyHover(property.id)}
                onMouseLeave={() => handlePropertyHover(null)}
                className={`rounded-lg transition-shadow ${
                  activePropertyId === property.id ? 'ring-2 ring-or/50' : ''
                }`}
              >
                <PropertyCard
                  property={property}
                  href={`/agence/${property.agency.slug}/annonces/${property.slug}`}
                  showAgency
                  isFavorited={favoriteIds.has(property.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="hidden lg:block lg:w-1/2 xl:w-2/5">
            <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border shadow-soft">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                    Chargement de la carte...
                  </div>
                }
              >
                <SearchMap
                  properties={properties}
                  activePropertyId={activePropertyId}
                  onPropertyHover={handlePropertyHover}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* Mobile map (full width, below list) */}
      {showMap && (
        <div className="mt-6 lg:hidden">
          <div className="h-[400px] overflow-hidden rounded-xl border shadow-soft">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                  Chargement de la carte...
                </div>
              }
            >
              <SearchMap
                properties={properties}
                activePropertyId={activePropertyId}
                onPropertyHover={handlePropertyHover}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
