import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize, BedDouble, Bath } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FavoriteButton } from '@/components/real-estate/favorite-button';
import { formatPrice, formatSurface } from '@/lib/formatters';
import { TRANSACTION_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/constants';
import type { Property, PropertyWithAgency } from '@/types';

interface PropertyCardProps {
  property: Property | PropertyWithAgency;
  href: string;
  showStatus?: boolean;
  showAgency?: boolean;
  isFavorited?: boolean;
}

export function PropertyCard({ property, href, showStatus, showAgency, isFavorited }: PropertyCardProps) {
  const agency = 'agency' in property ? property.agency : null;

  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-elevated">
      <Link href={href} className="cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.is_featured && (
            <Badge className="absolute left-3 top-3 z-10" variant="secondary">
              En vedette
            </Badge>
          )}
          {showStatus && (
            <Badge
              className="absolute right-3 top-3 z-10"
              variant={property.status === 'published' ? 'success' : 'outline'}
            >
              {property.status === 'published' ? 'Publié' : property.status}
            </Badge>
          )}
          {isFavorited !== undefined && (
            <FavoriteButton
              propertyId={property.id}
              isFavorited={isFavorited}
              className="absolute right-3 top-3 z-10"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Building2Icon className="h-12 w-12 opacity-20" />
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {TRANSACTION_TYPE_LABELS[property.transaction_type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {PROPERTY_TYPE_LABELS[property.property_type]}
            </span>
          </div>

          <h3 className="line-clamp-1 text-sm font-semibold">{property.title}</h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {[property.commune, property.wilaya].filter(Boolean).join(', ')}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            {property.surface && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3 w-3" />
                {formatSurface(property.surface)}
              </span>
            )}
            {property.bedrooms != null && property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3 w-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" />
                {property.bathrooms}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-bold text-bleu-nuit">
              {formatPrice(
                property.price,
                property.currency,
                property.transaction_type === 'rent'
              )}
            </p>
            {property.negotiable && (
              <span className="text-xs text-or font-medium">Négociable</span>
            )}
          </div>

          {showAgency && agency && (
            <div className="mt-2 flex items-center gap-1.5 border-t pt-2 text-xs text-muted-foreground">
              <span className="truncate font-medium">{agency.name}</span>
              {agency.is_verified && (
                <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
