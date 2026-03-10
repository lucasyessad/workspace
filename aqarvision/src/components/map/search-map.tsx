'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { formatPrice, formatSurface } from '@/lib/formatters';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import type { PropertyWithAgency } from '@/types';
import 'leaflet/dist/leaflet.css';

// Default marker icon fix for webpack/next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'leaflet-marker-active',
});

L.Marker.prototype.options.icon = defaultIcon;

// Center of Algeria
const ALGERIA_CENTER: [number, number] = [28.0339, 1.6596];
const ALGERIA_ZOOM = 5;

interface SearchMapProps {
  properties: PropertyWithAgency[];
  activePropertyId?: string | null;
  onPropertyHover?: (id: string | null) => void;
}

function FitBounds({ properties }: { properties: PropertyWithAgency[] }) {
  const map = useMap();

  useEffect(() => {
    const coords = properties
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [p.latitude!, p.longitude!] as [number, number]);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView(ALGERIA_CENTER, ALGERIA_ZOOM);
    }
  }, [properties, map]);

  return null;
}

export function SearchMap({ properties, activePropertyId, onPropertyHover }: SearchMapProps) {
  const geoProperties = useMemo(
    () => properties.filter((p) => p.latitude && p.longitude),
    [properties]
  );

  if (geoProperties.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30 text-center text-sm text-muted-foreground">
        <div>
          <p className="font-medium">Aucune annonce géolocalisée</p>
          <p className="mt-1 text-xs">Les biens avec coordonnées apparaîtront ici.</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={ALGERIA_CENTER}
      zoom={ALGERIA_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds properties={geoProperties} />
      {geoProperties.map((property) => (
        <PropertyMarker
          key={property.id}
          property={property}
          isActive={property.id === activePropertyId}
          onHover={onPropertyHover}
        />
      ))}
    </MapContainer>
  );
}

function PropertyMarker({
  property,
  isActive,
  onHover,
}: {
  property: PropertyWithAgency;
  isActive: boolean;
  onHover?: (id: string | null) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      mouseover() { onHover?.(property.id); },
      mouseout() { onHover?.(null); },
    }),
    [property.id, onHover]
  );

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(isActive ? activeIcon : defaultIcon);
      if (isActive) {
        markerRef.current.openPopup();
      }
    }
  }, [isActive]);

  const href = `agency` in property && property.agency
    ? `/agence/${property.agency.slug}/annonces/${property.slug}`
    : '#';

  return (
    <Marker
      ref={markerRef}
      position={[property.latitude!, property.longitude!]}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <Link href={href} className="block max-w-[200px] cursor-pointer no-underline">
          <p className="text-xs text-muted-foreground">
            {TRANSACTION_TYPE_LABELS[property.transaction_type]}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground line-clamp-1">
            {property.title}
          </p>
          <p className="mt-1 text-sm font-bold text-bleu-nuit">
            {formatPrice(property.price, property.currency, property.transaction_type === 'rent')}
          </p>
          {property.surface && (
            <p className="text-xs text-muted-foreground">{formatSurface(property.surface)}</p>
          )}
        </Link>
      </Popup>
    </Marker>
  );
}
