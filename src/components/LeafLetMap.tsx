"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function LeafletMap() {
  return (
    <MapContainer center={[-7.797068, 110.370529]} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[-7.797068, 110.370529]}>
        <Popup>Contoh Marker</Popup>
      </Marker>
    </MapContainer>
  );
}
