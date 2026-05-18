"use client";

import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useRef } from "react";

type Props = {
  center?: number[];
  locationValue?: string;
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

const PIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#00B4D8"/>
    <circle cx="16" cy="16" r="7" fill="white"/>
  </svg>`
);

function Map({ center, locationValue, className }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    id: "google-map-script",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);
  const onUnmount = useCallback(() => { mapRef.current = null; }, []);

  const position = center
    ? { lat: center[0], lng: center[1] }
    : { lat: 20, lng: 0 };

  if (loadError) {
    return (
      <div className={className || "h-[45vh] rounded-2xl bg-neutral-100 flex items-center justify-center text-sm text-neutral-400"}>
        Erreur de chargement de la carte
      </div>
    );
  }

  if (!isLoaded) {
    return <div className={className || "h-[45vh] rounded-2xl bg-neutral-200 animate-pulse"} />;
  }

  return (
    <GoogleMap
      mapContainerClassName={className || "h-[45vh] rounded-2xl w-full border border-neutral-100 shadow-sm"}
      center={position}
      zoom={center ? 5 : 2}
      onLoad={onLoad}
      onUnmount={onUnmount}
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
      {center && (
        <MarkerF
          position={position}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${PIN_SVG}`,
            scaledSize: new window.google.maps.Size(32, 40),
            anchor: new window.google.maps.Point(16, 40),
          }}
        />
      )}
    </GoogleMap>
  );
}

export default Map;
