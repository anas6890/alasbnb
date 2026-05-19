"use client";

import useCountries from "@/hook/useCountries";
import { SafeUser } from "@/types";
import dynamic from "next/dynamic";
import React from "react";
import { IconType } from "react-icons";
import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";
import Sleep from "../Sleep";
import Offers from "../Offers";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

import { FiKey, FiAward } from "react-icons/fi";
import { TbPool } from "react-icons/tb";

type Props = {
  user: SafeUser;
  description: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
  lat: number;
  lng: number;
  locationValue: string;
  avgRating?: number;
  totalReviews?: number;
  amenities?: string[];
  location?: any;
};

function ListingInfo({
  user,
  description,
  maxGuests,
  bedrooms,
  beds,
  bathrooms,
  category,
  lat,
  lng,
  locationValue,
  avgRating = 0,
  totalReviews = 0,
  amenities = [],
  location,
}: Props) {
  const coordinates = lat && lng ? [lat, lng] : undefined;

  return (
    <div className="col-span-4 flex flex-col gap-8">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <div className="text-xl font-semibold flex flex-row items-center justify-between w-full">
          <div>Logement entier : {category?.label || "logement"} - {user?.firstname}</div>
          <Avatar src={user?.image} userName={user?.firstname} />
        </div>
        <div className="flex flex-row items-center gap-2 font-light text-neutral-500 text-sm">
          <div>{maxGuests} voyageurs</div>
          <div>·</div>
          <div>{bedrooms} chambres</div>
          <div>·</div>
          <div>{beds || bedrooms || 1} lits</div>
          <div>·</div>
          <div>{bathrooms} salles de bain</div>
        </div>
      </div>
      <hr />

      {/* Guest Favorite / Coup de cœur voyageurs banner */}
      {avgRating >= 4.5 && (
        <div className="border border-neutral-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm gap-4">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-bold text-base text-neutral-800">
                <FiAward size={22} className="text-brand-600" />
                <span>Coup de cœur voyageurs</span>
              </div>
              <p className="text-xs text-neutral-500 font-light mt-1 max-w-[280px]">
                Un des logements préférés des voyageurs sur Airbnb
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-neutral-800">{avgRating.toFixed(1)}</div>
              <div className="text-[10px] text-[#f59e0b] tracking-tighter">★★★★★</div>
            </div>
            <div className="h-8 w-[1px] bg-neutral-200 hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-neutral-800">{totalReviews}</div>
              <div className="text-xs text-neutral-500 font-light underline">Commentaires</div>
            </div>
          </div>
        </div>
      )}

      {/* Host Experience & Unique Selling Points */}
      <div className="flex flex-col gap-6">
        {/* Host card */}
        <div className="flex flex-row items-start gap-4">
          <Avatar src={user?.image} userName={user?.firstname} />
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-neutral-800 text-[15px]">Hôte : {user?.firstname}</div>
            <div className="text-sm text-neutral-500 font-light">
              6 mois d&apos;expérience en tant qu&apos;hôte sur Alasbnb
            </div>
          </div>
        </div>

        {/* Dynamic highlights */}
        {avgRating >= 4.5 && (
          <div className="flex flex-row items-start gap-4">
            <FiAward size={28} className="text-neutral-700 mt-1" />
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-neutral-800 text-[15px]">Très bien noté par les voyageurs</div>
              <div className="text-sm text-neutral-500 font-light">
                100 % des voyageurs ont attribué 5 étoiles à ce logement.
              </div>
            </div>
          </div>
        )}

        {amenities.includes("Piscine") && (
          <div className="flex flex-row items-start gap-4">
            <TbPool size={28} className="text-neutral-700 mt-1" />
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-neutral-800 text-[15px]">Offrez-vous un plongeon</div>
              <div className="text-sm text-neutral-500 font-light">
                C&apos;est l&apos;un des rares logements de la région disposant d&apos;une piscine.
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row items-start gap-4">
          <FiKey size={28} className="text-neutral-700 mt-1" />
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-neutral-800 text-[15px]">Procédure d&apos;arrivée exceptionnelle</div>
            <div className="text-sm text-neutral-500 font-light">
              Les voyageurs récents ont attribué 5 étoiles à la procédure d&apos;arrivée.
            </div>
          </div>
        </div>
      </div>
      <hr />

      {/* Auto-translation banner */}
      <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex flex-col gap-1">
        <div className="text-xs text-neutral-500 font-light leading-relaxed">
          Certaines informations ont été traduites automatiquement. <span className="underline font-semibold cursor-pointer text-neutral-800">Afficher le texte d&apos;origine</span>
        </div>
      </div>
      <hr />

      {/* Description */}
      <div className="flex flex-col gap-2">
        <p className="text-[15px] leading-relaxed text-neutral-600 font-light whitespace-pre-line">
          {description}
        </p>
      </div>
      <hr />

      {/* Sleep Component */}
      <Sleep bedrooms={bedrooms} />
      <hr />

      {/* Offers Component */}
      <Offers amenities={amenities} />
      <hr />

      {/* Map location */}
      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold text-neutral-800">Où se situe le logement</p>
        <p className="text-sm font-light text-neutral-500">
          {location?.city ? `${location.city}, ` : ""}{location?.country || locationValue}
        </p>
      </div>
      <Map center={coordinates} />
    </div>
  );
}

export default ListingInfo;
