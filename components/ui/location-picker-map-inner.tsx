"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default marker icon paths (broken in Next.js/webpack by default)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  disabled?: boolean;
}

export default function LocationPickerMapInner({
  lat,
  lng,
  onLocationSelect,
  height = "350px",
  disabled = false,
}: LocationPickerMapProps) {
  const [showHint, setShowHint] = useState(true);

  // Hide hint after 5 seconds
  useEffect(() => {
    if (!disabled) {
      const timeout = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [disabled]);

  // Component that handles map clicks
  function MapClickHandler() {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        if (disabled) return;
        onLocationSelect?.(e.latlng.lat, e.latlng.lng);
        setShowHint(false);
      },
    });
    return null;
  }

  // Component that flies to new coordinates when props change
  function FlyToUpdater({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    const prevCoords = useRef({ lat, lng });

    useEffect(() => {
      if (
        lat &&
        lng &&
        (prevCoords.current.lat !== lat || prevCoords.current.lng !== lng)
      ) {
        map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 });
        prevCoords.current = { lat, lng };
      }
    }, [lat, lng, map]);

    return null;
  }

  const displayLat = lat || 40.4093;
  const displayLng = lng || 49.8671;

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={[displayLat, displayLng]}
        zoom={15}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
        className={`location-picker-map${disabled ? " disabled" : ""}`}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker
          position={[displayLat, displayLng]}
          draggable={!disabled}
          eventHandlers={{
            dragend: (e: any) => {
              if (disabled) return;
              const marker = e.target;
              const pos = marker.getLatLng();
              onLocationSelect?.(pos.lat, pos.lng);
            },
          }}
        />
        <MapClickHandler />
        <FlyToUpdater lat={displayLat} lng={displayLng} />
      </MapContainer>

      {/* Click hint */}
      {!disabled && showHint && (
        <div className="map-click-hint">
          📍 Xəritədə klikləyərək məkan seçin
        </div>
      )}
    </div>
  );
}
