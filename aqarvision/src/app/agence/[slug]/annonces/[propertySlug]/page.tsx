import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Maximize, BedDouble, Bath, Home, Share2, Phone, MessageSquare, Calendar } from 'lucide-react';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { getPublicPropertyBySlug } from '@/lib/queries';
import { getSimilarProperties } from '@/lib/queries/search';
import { isPropertyFavorited } from '@/lib/queries/favorites';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyCard } from '@/components/real-estate/property-card';
import { PropertyGallery } from '@/components/real-estate/property-gallery';
import { LeadContactPanel } from '@/components/real-estate/lead-contact-panel';
import { FavoriteButton } from '@/components/real-estate/favorite-button';
import { VerifiedListingBadge, TrustBadgeGroup } from '@/components/algeria/trust-badges';
import { ShareButton } from '@/components/real-estate/share-button';
import { StickyContactCTA } from '@/components/real-estate/sticky-contact-cta';
import { formatPrice, formatSurface, formatRelativeDate } from '@/lib/formatters';
import { TRANSACTION_TYPE_LABELS, PROPERTY_TYPE_LABELS, AMENITY_LABELS } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; propertySlug: string };
}): Promise<Metadata> {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) return {};
  const property = await getPublicPropertyBySlug(agency.id, params.propertySlug);
  if (!property) return {};
  return {
    title: `${property.title} - ${agency.name}`,
    description: property.description?.slice(0, 160) ?? undefined,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 160) ?? undefined,
      type: 'article',
      images: property.images[0]?.public_url ? [property.images[0].public_url] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { slug: string; propertySlug: string };
}) {
  const agency = await resolvePublicAgency(params.slug);
  if (!agency) notFound();

  const property = await getPublicPropertyBySlug(agency.id, params.propertySlug);
  if (!property) notFound();

  const [similarProperties, favorited] = await Promise.all([
    getSimilarProperties(property, 4),
    isPropertyFavorited(property.id).catch(() => false),
  ]);

  return (
    <>
      <section className="py-8">
        <div className="container">
          {/* Gallery */}
          <PropertyGallery images={property.images} title={property.title} />

          {/* Actions bar */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{TRANSACTION_TYPE_LABELS[property.transaction_type]}</Badge>
              <Badge variant="outline">{PROPERTY_TYPE_LABELS[property.property_type]}</Badge>
              {property.is_verified && <VerifiedListingBadge />}
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton propertyId={property.id} isFavorited={favorited} variant="full" />
              <ShareButton title={property.title} />
            </div>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title + Price */}
              <div>
                <h1 className="text-heading-2 font-bold">{property.title}</h1>
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{[property.quartier, property.commune, property.wilaya].filter(Boolean).join(', ')}</span>
                </div>
                <p className="mt-4 text-heading-3 font-bold text-bleu-nuit">
                  {formatPrice(property.price, property.currency, property.transaction_type === 'rent')}
                </p>
                {property.negotiable && (
                  <span className="text-sm font-medium text-or">Prix négociable</span>
                )}
                {property.published_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Publié {formatRelativeDate(property.published_at)}
                  </p>
                )}
              </div>

              {/* Characteristics */}
              <Card>
                <CardHeader><CardTitle>Caractéristiques</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {property.surface && (
                      <div className="text-center">
                        <Maximize className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-1 font-semibold">{formatSurface(property.surface)}</p>
                        <p className="text-xs text-muted-foreground">Surface</p>
                      </div>
                    )}
                    {property.rooms != null && property.rooms > 0 && (
                      <div className="text-center">
                        <Home className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-1 font-semibold">{property.rooms}</p>
                        <p className="text-xs text-muted-foreground">Pièces</p>
                      </div>
                    )}
                    {property.bedrooms != null && property.bedrooms > 0 && (
                      <div className="text-center">
                        <BedDouble className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-1 font-semibold">{property.bedrooms}</p>
                        <p className="text-xs text-muted-foreground">Chambres</p>
                      </div>
                    )}
                    {property.bathrooms != null && property.bathrooms > 0 && (
                      <div className="text-center">
                        <Bath className="mx-auto h-5 w-5 text-muted-foreground" />
                        <p className="mt-1 font-semibold">{property.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">SDB</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {property.description && (
                <Card>
                  <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-body-sm leading-relaxed">{property.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Équipements</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((a) => (
                        <Badge key={a} variant="outline">{AMENITY_LABELS[a] ?? a}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agency info */}
              <Card>
                <CardHeader><CardTitle>L'agence</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {agency.logo_url ? (
                      <img src={agency.logo_url} alt={agency.name} className="h-14 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-bleu-nuit text-xl font-bold text-white">
                        {agency.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{agency.name}</p>
                      <TrustBadgeGroup isVerified={agency.is_verified} licenseNumber={agency.license_number} />
                      {agency.address && (
                        <p className="mt-1 text-sm text-muted-foreground">{agency.address}</p>
                      )}
                      <Link
                        href={`/agence/${agency.slug}`}
                        className="mt-2 inline-block text-sm font-medium text-or hover:underline cursor-pointer"
                      >
                        Voir toutes les annonces
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar — contact panel (sticky on desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                <LeadContactPanel
                  agency={agency}
                  agencyId={agency.id}
                  propertyId={property.id}
                />
              </div>
            </div>
          </div>

          {/* Similar properties */}
          {similarProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-heading-3 font-bold">Biens similaires</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {similarProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    href={`/agence/${p.agency.slug}/annonces/${p.slug}`}
                    showAgency
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sticky CTA mobile */}
      <StickyContactCTA
        phone={agency.phone}
        agencyId={agency.id}
        propertyId={property.id}
        price={formatPrice(property.price, property.currency, property.transaction_type === 'rent')}
      />
    </>
  );
}
