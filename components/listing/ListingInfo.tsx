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
import Link from "next/link";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

import { FiKey, FiAward } from "react-icons/fi";
import { TbPool, TbShieldCheck } from "react-icons/tb";

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
  listingId: string;
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
  listingId,
}: Props) {
  const coordinates = lat && lng ? [lat, lng] : undefined;
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <div className="col-span-4 flex flex-col gap-8">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
          {t.listing_entire} {category?.label?.toLowerCase() || "logement"}
        </h2>
        <div className="flex flex-row items-center gap-1.5 font-normal text-neutral-600 text-[15px]">
          <div>{maxGuests} {t.travelers_label}</div>
          <div>·</div>
          <div>{bedrooms} {t.bedrooms_label}</div>
          <div>·</div>
          <div>{beds || bedrooms || 1} {t.beds_label}</div>
          <div>·</div>
          <div>{bathrooms} {t.bathrooms_label}</div>
        </div>
      </div>
      <hr className="border-neutral-200" />

      {/* Category Info */}
      {category && (
        <ListingCategory
          icon={category.icon}
          label={t[category.label] || category.label}
          description={t[`desc_${category.label}`] || category.description}
        />
      )}

      {/* Guest Favorite / Coup de cœur voyageurs banner */}
      {avgRating >= 4.5 && (
        <>
          <hr className="border-neutral-200" />
          <div className="border border-neutral-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm gap-4">
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 font-bold text-base text-neutral-800">
                  <FiAward size={22} className="text-brand-600" />
                  <span>{t.guest_favorite}</span>
                </div>
                <p className="text-xs text-neutral-500 font-light mt-1 max-w-[280px]">
                  {t.guest_favorite_desc}
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
                <div className="text-xs text-neutral-500 font-light underline">{t.comments_label}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Host Experience & Unique Selling Points */}
      <div className="flex flex-col gap-8">
        
        {/* Clickable Host Card */}
        <Link href={`/users/${user.id}`} className="group">
          <div className="flex flex-row items-center gap-5 p-4 rounded-2xl border border-transparent hover:border-neutral-200 hover:bg-neutral-50 transition-all duration-300">
            <div className="relative">
              <Avatar src={user?.image} userName={user?.firstname} />
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <div className="bg-brand-500 rounded-full p-0.5 text-white">
                    <TbShieldCheck size={12} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-neutral-900 text-lg group-hover:underline decoration-2 underline-offset-2">
                {t.host_label} {user?.firstname}
              </div>
              <div className="text-[15px] text-neutral-500 font-normal">
                {t.click_to_view_profile}
              </div>
            </div>
          </div>
        </Link>
        <div className="pl-[72px] -mt-4">
          <Link
            href={`/listings/${listingId}/contact`}
            className="px-6 py-3 border border-neutral-900 rounded-xl font-semibold text-neutral-900 hover:bg-neutral-100 transition-colors inline-block"
          >
            {t.contact_host}
          </Link>
        </div>

        {/* Dynamic highlights */}
        {avgRating >= 4.5 && (
          <div className="flex flex-row items-start gap-4">
            <FiAward size={28} className="text-neutral-700 mt-1" />
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-neutral-800 text-[15px]">{t.highly_rated}</div>
              <div className="text-sm text-neutral-500 font-light">
                {t.highly_rated_desc}
              </div>
            </div>
          </div>
        )}

        {amenities.includes("Piscine") && (
          <div className="flex flex-row items-start gap-4">
            <TbPool size={28} className="text-neutral-700 mt-1" />
            <div className="flex flex-col gap-0.5">
              <div className="font-semibold text-neutral-800 text-[15px]">{t.take_a_dip}</div>
              <div className="text-sm text-neutral-500 font-light">
                {t.take_a_dip_desc}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row items-start gap-4">
          <FiKey size={28} className="text-neutral-700 mt-1" />
          <div className="flex flex-col gap-0.5">
            <div className="font-semibold text-neutral-800 text-[15px]">{t.great_checkin}</div>
            <div className="text-sm text-neutral-500 font-light">
              {t.great_checkin_desc}
            </div>
          </div>
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
        <p className="text-xl font-semibold text-neutral-800">{t.where_it_is}</p>
        <p className="text-sm font-light text-neutral-500">
          {location?.city ? `${location.city}, ` : ""}{location?.country || locationValue}
        </p>
      </div>
      <Map center={coordinates} />
    </div>
  );
}

export default ListingInfo;
