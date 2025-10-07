// components/LeafLetMap.tsx
'use client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  onClick?: (lat: number, lng: number) => void;
  markerPosition?: [number, number];
  markerText?: string;
}

export default function LeafletMap({ 
  center, 
  zoom, 
  onClick, 
  markerPosition, 
  markerText = "Lokasi Terpilih" 
}: LeafletMapProps) {
  function MapEvents() {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onClick?.(lat, lng);
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            {markerText}
          </Popup>
        </Marker>
      )}
      <MapEvents />
    </MapContainer>
  );
}