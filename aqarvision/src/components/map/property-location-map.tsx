'use client';

import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  approximate?: boolean;
}

export function PropertyLocationMap({ latitude, longitude, approximate }: PropertyLocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      className="h-[300px] w-full rounded-lg"
      scrollWheelZoom={false}
      dragging
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {approximate ? (
        <Circle
          center={[latitude, longitude]}
          radius={500}
          pathOptions={{
            color: '#0c1b2a',
            fillColor: '#0c1b2a',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />
      ) : (
        <Marker position={[latitude, longitude]} icon={icon} />
      )}
    </MapContainer>
  );
}
