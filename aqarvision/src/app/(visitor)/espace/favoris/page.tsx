import { getUserFavorites } from '@/lib/queries/favorites';
import { PropertyCard } from '@/components/real-estate/property-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'Mes favoris' };

export default async function FavoritesPage() {
  const favorites = await getUserFavorites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading-3 font-bold text-bleu-nuit">Mes favoris</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {favorites.length} bien{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="Aucun favori"
          description="Parcourez les annonces et ajoutez des biens à vos favoris pour les retrouver ici."
          action={
            <Button variant="or" asChild>
              <Link href="/recherche">Rechercher des biens</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <PropertyCard
              key={fav.id}
              property={fav.property}
              href={`/agence/${fav.property.agency.slug}/annonces/${fav.property.slug}`}
              showAgency
              isFavorited
            />
          ))}
        </div>
      )}
    </div>
  );
}
