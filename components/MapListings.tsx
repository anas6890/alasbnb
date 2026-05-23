"use client";

import { safeListing } from "@/types";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";

import "leaflet/dist/leaflet.css";

type Props = {
  listings: safeListing[];
  className?: string;
};

function BoundsHelper({ markers }: { markers: { position: [number, number] }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, markers]);
  
  return null;
}

export default function MapListings({ listings, className }: Props) {
  const router = useRouter();

  const markers = useMemo(() => {
    const positionCounts: Record<string, number> = {};

    return listings
      .filter((listing) => listing.location?.lat && listing.location?.lng)
      .map((listing) => {
        let lat = listing.location.lat;
        let lng = listing.location.lng;

        // Offset overlapping markers
        const posKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        if (positionCounts[posKey] === undefined) {
          positionCounts[posKey] = 0;
        } else {
          positionCounts[posKey]++;
          // 0.0003 degrees is approx 30 meters
          const offsetMultiplier = Math.ceil(positionCounts[posKey] / 8);
          const angle = (positionCounts[posKey] % 8) * (Math.PI / 4);
          lat += Math.cos(angle) * 0.0003 * offsetMultiplier;
          lng += Math.sin(angle) * 0.0003 * offsetMultiplier;
        }

        return {
          id: listing.id,
          price: listing.pricePerNight,
          position: [lat, lng] as [number, number],
        };
      });
  }, [listings]);

  const center = useMemo(() => {
    if (markers.length === 0) {
      return [48.8566, 2.3522] as [number, number]; // Paris default
    }

    const avgLat = markers.reduce((sum, marker) => sum + marker.position[0], 0) / markers.length;
    const avgLng = markers.reduce((sum, marker) => sum + marker.position[1], 0) / markers.length;
    return [avgLat, avgLng] as [number, number];
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={markers.length > 0 ? 12 : 2}
      scrollWheelZoom={false}
      className={className || "h-[70vh] rounded-2xl w-full border border-neutral-100 shadow-sm z-0"}
    >
      <BoundsHelper markers={markers} />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {markers.map((marker) => {
        const customIcon = L.divIcon({
          className: "custom-price-marker",
          html: `<div class="bg-white border-2 border-neutral-900 rounded-full px-3 py-1 font-bold text-sm shadow-md hover:scale-110 transition-transform">€${marker.price}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

        return (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={customIcon}
            eventHandlers={{
              click: () => router.push(`/listings/${marker.id}`),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
