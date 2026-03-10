import { notFound } from 'next/navigation';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { getPublicProperties } from '@/lib/queries';
import { PropertyCard } from '@/components/real-estate/property-card';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata = { title: 'Annonces' };

export default async function AgencyListingsPage({
  params,
}: {
  params: { slug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  const result = await getPublicProperties(agency.id);

  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-heading-2 font-bold text-bleu-nuit">Nos annonces</h1>
        <p className="mt-2 text-body text-muted-foreground">
          {result.total} bien{result.total !== 1 ? 's' : ''} disponible{result.total !== 1 ? 's' : ''}
        </p>

        {result.data.length === 0 ? (
          <EmptyState
            title="Aucune annonce disponible"
            description="Cette agence n'a pas encore publié d'annonces."
            className="mt-12"
          />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                href={`/agence/${agency.slug}/annonces/${property.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
