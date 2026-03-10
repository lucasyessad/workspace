import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { getPublicProperties } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/real-estate/property-card';
import { TrustBadgeGroup } from '@/components/algeria/trust-badges';
import { LuxuryHero } from '@/components/agency/luxury-hero';
import { LuxuryPropertiesSection } from '@/components/agency/luxury-properties-section';
import { LuxuryAboutSection } from '@/components/agency/luxury-about-section';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) return {};
  return {
    title: agency.name,
    description: agency.slogan ?? `Agence immobiliere a ${agency.wilaya ?? 'Algerie'}`,
  };
}

export default async function AgencyHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  const featured = await getPublicProperties(agency.id, {}, 1, 6);
  const isEnterprise = agency.active_plan === 'enterprise';

  // Enterprise luxury homepage
  if (isEnterprise) {
    return (
      <div>
        <LuxuryHero agency={agency} />
        <LuxuryPropertiesSection
          agency={agency}
          properties={featured.data}
          total={featured.total}
        />
        <LuxuryAboutSection agency={agency} />
      </div>
    );
  }

  // Standard homepage for Starter/Pro
  return (
    <div>
      {/* Hero */}
      <section
        className="relative py-20 text-white"
        style={{ backgroundColor: agency.primary_color }}
      >
        <div className="container text-center">
          {agency.logo_url && (
            <img src={agency.logo_url} alt={agency.name} className="mx-auto h-16 w-16 rounded-lg object-cover" />
          )}
          <h1 className="mt-4 font-display text-heading-1">{agency.name}</h1>
          {agency.slogan && <p className="mt-2 text-body-lg text-white/80">{agency.slogan}</p>}
          <div className="mt-4 flex justify-center">
            <TrustBadgeGroup isVerified={agency.is_verified} licenseNumber={agency.license_number} />
          </div>
          <Button size="lg" className="mt-8 bg-white text-bleu-nuit hover:bg-white/90" asChild>
            <Link href={`/agence/${agency.slug}/annonces`}>
              Voir toutes les annonces
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured properties */}
      {featured.data.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-heading-2 font-bold text-bleu-nuit">Nos biens</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  href={`/agence/${agency.slug}/annonces/${property.slug}`}
                />
              ))}
            </div>
            {featured.total > 6 && (
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link href={`/agence/${agency.slug}/annonces`}>
                    Voir les {featured.total} annonces
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About snippet */}
      {agency.description && (
        <section className="border-t py-16">
          <div className="container max-w-2xl text-center">
            <h2 className="text-heading-3 font-bold">A propos</h2>
            <p className="mt-4 text-body text-muted-foreground">{agency.description}</p>
          </div>
        </section>
      )}
    </div>
  );
}
