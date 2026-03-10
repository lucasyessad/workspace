import { Suspense } from 'react';
import { searchProperties } from '@/lib/queries/search';
import { getUserFavoriteIds } from '@/lib/queries/favorites';
import { PropertyCard } from '@/components/real-estate/property-card';
import { SearchFiltersBar } from '@/components/search/search-filters-bar';
import { SaveSearchButton } from '@/components/search/save-search-button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import type { SearchFilters, TransactionType, PropertyType } from '@/types';

export const metadata = {
  title: 'Rechercher un bien immobilier',
  description: 'Trouvez votre bien immobilier en Algérie. Appartements, villas, terrains à vendre ou à louer.',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    transaction?: string;
    type?: string;
    wilaya?: string;
    commune?: string;
    price_min?: string;
    price_max?: string;
    surface_min?: string;
    rooms?: string;
    sort?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters: SearchFilters = {
    query: searchParams.q,
    transactionType: searchParams.transaction as TransactionType | undefined,
    propertyType: searchParams.type as PropertyType | undefined,
    wilaya: searchParams.wilaya,
    commune: searchParams.commune,
    priceMin: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    priceMax: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    surfaceMin: searchParams.surface_min ? Number(searchParams.surface_min) : undefined,
    rooms: searchParams.rooms ? Number(searchParams.rooms) : undefined,
    sortBy: (searchParams.sort as SearchFilters['sortBy']) ?? 'newest',
  };

  const page = searchParams.page ? Number(searchParams.page) : 1;

  const [results, favoriteIds] = await Promise.all([
    searchProperties(filters, page),
    getUserFavoriteIds().catch(() => new Set<string>()),
  ]);

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Hero search bar */}
      <section className="border-b bg-white py-6">
        <div className="container">
          <SearchFiltersBar filters={filters} />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.total} bien{results.total !== 1 ? 's' : ''} trouvé{results.total !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && <SaveSearchButton filters={filters} />}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container">
          {results.data.length === 0 ? (
            <EmptyState
              icon={<Search className="h-12 w-12" />}
              title="Aucun bien trouvé"
              description="Essayez de modifier vos critères de recherche pour trouver plus de résultats."
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.data.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    href={`/agence/${property.agency.slug}/annonces/${property.slug}`}
                    showAgency
                    isFavorited={favoriteIds.has(property.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {results.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/recherche?${new URLSearchParams({
                        ...searchParams,
                        page: String(p),
                      })}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-md text-sm transition-colors cursor-pointer ${
                        p === page
                          ? 'bg-bleu-nuit text-white'
                          : 'bg-white text-bleu-nuit hover:bg-muted'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
