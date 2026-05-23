"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, Popup } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { usePrice } from "@/hook/usePrice";
import ListingCard from "./listing/ListingCard";

import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default leaflet icon being broken in Webpack/Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src || markerIcon,
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  shadowUrl: markerShadow.src || markerShadow,
});

const MapUpdater = ({ center, bounds }: { center?: L.LatLngExpression, bounds?: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.setView(center, 12);
    }
  }, [center, bounds, map]);
  return null;
};

const PriceMarker = ({ listing }: { listing: any }) => {
  const { formattedPrice } = usePrice(listing.pricePerNight);
  
  const icon = useMemo(() => {
    return L.divIcon({
      className: 'custom-price-pin',
      html: `<div style="background-color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 14px; white-space: nowrap; color: #222; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; cursor: pointer;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">${formattedPrice}</div>`,
      iconSize: [60, 30],
      iconAnchor: [30, 15]
    });
  }, [formattedPrice]);

  return (
    <Marker key={formattedPrice} position={[listing?.location?.lat || 0, listing?.location?.lng || 0]} icon={icon}>
      <Popup className="custom-map-popup" minWidth={280} maxWidth={280} closeButton={true}>
        <div className="w-[280px] h-auto max-h-[340px] overflow-hidden -m-[13px] bg-white">
          {listing && <ListingCard data={listing} />}
        </div>
      </Popup>
    </Marker>
  );
};

type Props = {
  center?: number[];
  className?: string;
  listings?: any[]; // To support the new search view
};

const Map = ({ center, className, listings }: Props) => {
  const hasListings = listings && listings.length > 0;
  
  // Calculate bounds if we have multiple listings
  const bounds = useMemo(() => {
    if (!hasListings) return undefined;
    const lats = listings.map(l => l?.location?.lat).filter(l => l !== undefined && l !== null && !isNaN(l));
    const lngs = listings.map(l => l?.location?.lng).filter(l => l !== undefined && l !== null && !isNaN(l));
    
    if (lats.length === 0 || lngs.length === 0) return undefined;

    let minLat = Math.min(...lats);
    let maxLat = Math.max(...lats);
    let minLng = Math.min(...lngs);
    let maxLng = Math.max(...lngs);

    if (minLat === maxLat) {
      minLat -= 0.01;
      maxLat += 0.01;
    }
    if (minLng === maxLng) {
      minLng -= 0.01;
      maxLng += 0.01;
    }

    return [
      [minLat, minLng],
      [maxLat, maxLng]
    ] as L.LatLngBoundsExpression;
  }, [listings, hasListings]);

  // Determine initial center
  const initialCenter = hasListings && listings[0]?.location?.lat !== undefined
    ? [listings[0].location.lat, listings[0].location.lng] as L.LatLngExpression
    : (center as L.LatLngExpression) || [51, -0.09];

  return (
    <MapContainer
      center={initialCenter}
      zoom={center || hasListings ? 12 : 2}
      scrollWheelZoom={false}
      className={className || "h-[45vh] rounded-2xl w-full border border-neutral-100 shadow-sm z-0"}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {hasListings ? (
        <>
          <MapUpdater bounds={bounds} />
          {listings.map((listing) => (
             <PriceMarker 
               key={listing.id} 
               listing={listing} 
             />
          ))}
        </>
      ) : center ? (
        <>
          <MapUpdater center={center as L.LatLngExpression} />
          <Marker position={center as L.LatLngExpression} />
        </>
      ) : null}
    </MapContainer>
  );
};

export default Map;
