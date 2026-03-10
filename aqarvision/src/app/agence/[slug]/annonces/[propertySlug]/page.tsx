import { notFound } from 'next/navigation';
import { MapPin, Maximize, BedDouble, Bath, Home } from 'lucide-react';
import { resolvePublicAgency } from '@/lib/tenant/resolve';
import { getPublicPropertyBySlug } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadContactPanel } from '@/components/real-estate/lead-contact-panel';
import { VerifiedListingBadge } from '@/components/algeria/trust-badges';
import { formatPrice, formatSurface } from '@/lib/formatters';
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

  return (
    <section className="py-8">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Images */}
            {property.images.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {property.images.slice(0, 4).map((img) => (
                  <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                    {img.public_url && (
                      <img src={img.public_url} alt={img.alt_text} className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                <Home className="h-16 w-16 text-muted-foreground/20" />
              </div>
            )}

            {/* Title + Price */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{TRANSACTION_TYPE_LABELS[property.transaction_type]}</Badge>
                <Badge variant="outline">{PROPERTY_TYPE_LABELS[property.property_type]}</Badge>
                {property.is_verified && <VerifiedListingBadge />}
              </div>
              <h1 className="mt-3 text-heading-2 font-bold">{property.title}</h1>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeadContactPanel
              agency={agency}
              agencyId={agency.id}
              propertyId={property.id}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
