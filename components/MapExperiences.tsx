"use client";

import { Experience } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

type Props = {
  experiences: Experience[];
  className?: string;
};

export default function MapExperiences({ experiences, className }: Props) {
  const router = useRouter();

  const markers = useMemo(() => {
    return experiences
      .filter((experience) => experience.location?.lat && experience.location?.lng)
      .map((experience) => ({
        id: experience.id,
        price: experience.pricePerPerson,
        position: [experience.location.lat, experience.location.lng] as [number, number],
      }));
  }, [experiences]);

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
              click: () => router.push(`/experiences/${marker.id}`),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
