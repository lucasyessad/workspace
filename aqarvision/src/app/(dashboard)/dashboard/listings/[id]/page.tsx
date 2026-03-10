import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth/guard';
import { getPropertyById } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatSurface, formatDate } from '@/lib/formatters';
import { PROPERTY_STATUS_LABELS, TRANSACTION_TYPE_LABELS, PROPERTY_TYPE_LABELS, AMENITY_LABELS } from '@/lib/constants';
import { PropertyActions } from './actions';

export const metadata = { title: 'Détail annonce' };

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requirePermission('properties:read');
  const property = await getPropertyById(params.id);

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/listings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-heading-3 font-bold">{property.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={property.status === 'published' ? 'success' : 'outline'}>
              {PROPERTY_STATUS_LABELS[property.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {TRANSACTION_TYPE_LABELS[property.transaction_type]} &middot; {PROPERTY_TYPE_LABELS[property.property_type]}
            </span>
          </div>
        </div>
        <PropertyActions propertyId={property.id} status={property.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Prix</dt>
                  <dd className="text-lg font-bold">{formatPrice(property.price, property.currency)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Surface</dt>
                  <dd className="font-medium">{formatSurface(property.surface)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Pièces</dt>
                  <dd className="font-medium">{property.rooms ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Chambres</dt>
                  <dd className="font-medium">{property.bedrooms ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Salles de bain</dt>
                  <dd className="font-medium">{property.bathrooms ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Négociable</dt>
                  <dd className="font-medium">{property.negotiable ? 'Oui' : 'Non'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localisation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{[property.quartier, property.commune, property.wilaya].filter(Boolean).join(', ')}</p>
              {property.address && <p className="text-sm text-muted-foreground">{property.address}</p>}
            </CardContent>
          </Card>

          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-body-sm">{property.description}</p>
              </CardContent>
            </Card>
          )}

          {property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Équipements</CardTitle>
              </CardHeader>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le</span>
                <span>{formatDate(property.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mise à jour</span>
                <span>{formatDate(property.updated_at)}</span>
              </div>
              {property.published_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publiée le</span>
                  <span>{formatDate(property.published_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">En vedette</span>
                <span>{property.is_featured ? 'Oui' : 'Non'}</span>
              </div>
            </CardContent>
          </Card>

          {property.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos ({property.images.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {property.images.map((img) => (
                    <div key={img.id} className="aspect-square overflow-hidden rounded-md bg-muted">
                      {img.public_url && (
                        <img src={img.public_url} alt={img.alt_text} className="h-full w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
