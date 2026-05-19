"use client";

import { safeListing } from "@/types";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

type Props = {
  listings: safeListing[];
  className?: string;
};

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
];

function createPriceMarkerSvg(price: number) {
  const label = `€${price}`;
  const width = Math.max(44, 16 + label.length * 8);
  const height = 32;
  const radius = 16;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius}" ry="${radius}" fill="#ffffff" stroke="#111827" stroke-width="1" />
      <text x="${width / 2}" y="${height / 2 + 5}" font-family="Arial, sans-serif" font-size="13" fill="#111827" text-anchor="middle" font-weight="600">${label}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    size: { width, height },
  };
}

export default function MapListings({ listings, className }: Props) {
  const router = useRouter();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    id: "google-map-script",
  });

  const markers = useMemo(() => {
    return listings
      .filter((listing) => listing.location?.lat && listing.location?.lng)
      .map((listing) => ({
        id: listing.id,
        price: listing.pricePerNight,
        position: {
          lat: listing.location.lat,
          lng: listing.location.lng,
        },
      }));
  }, [listings]);

  const center = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 20, lng: 0 };
    }

    const avgLat = markers.reduce((sum, marker) => sum + marker.position.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, marker) => sum + marker.position.lng, 0) / markers.length;
    return { lat: avgLat, lng: avgLng };
  }, [markers]);

  if (loadError) {
    return (
      <div className={className || "h-[70vh] rounded-2xl bg-neutral-100 flex items-center justify-center text-sm text-neutral-400"}>
        Erreur de chargement de la carte
      </div>
    );
  }

  if (!isLoaded) {
    return <div className={className || "h-[70vh] rounded-2xl bg-neutral-200 animate-pulse"} />;
  }

  return (
    <GoogleMap
      mapContainerClassName={className || "h-[70vh] rounded-2xl w-full border border-neutral-100 shadow-sm"}
      center={center}
      zoom={markers.length > 0 ? 12 : 2}
      options={{
        styles: MAP_STYLES,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        scrollwheel: false,
      }}
    >
      {markers.map((marker) => {
        const icon = createPriceMarkerSvg(marker.price);
        return (
          <MarkerF
            key={marker.id}
            position={marker.position}
            onClick={() => router.push(`/listings/${marker.id}`)}
            icon={{
              url: icon.url,
              scaledSize: new window.google.maps.Size(icon.size.width, icon.size.height),
              anchor: new window.google.maps.Point(icon.size.width / 2, icon.size.height / 2),
            }}
          />
        );
      })}
    </GoogleMap>
  );
}
