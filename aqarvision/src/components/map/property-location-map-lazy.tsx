'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const PropertyLocationMap = lazy(() =>
  import('@/components/map/property-location-map').then((m) => ({
    default: m.PropertyLocationMap,
  }))
);

interface PropertyLocationMapCardProps {
  latitude: number;
  longitude: number;
  title: string;
  approximate?: boolean;
}

export function PropertyLocationMapCard({
  latitude,
  longitude,
  title,
  approximate,
}: PropertyLocationMapCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
              Chargement de la carte...
            </div>
          }
        >
          <PropertyLocationMap
            latitude={latitude}
            longitude={longitude}
            title={title}
            approximate={approximate}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}
