"use client";

import { SafeReservation, SafeUser, safeListing } from "@/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo } from "react";
import Button from "../Button";
import HeartButton from "../HeartButton";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { enUS, fr } from "date-fns/locale";

type Props = {
  data: safeListing;
  reservation?: SafeReservation;
  onAction?: (id: string) => void;
  disabled?: boolean;
  actionLabel?: string;
  actionId?: string;
  currentUser?: SafeUser | null;
  children?: React.ReactNode;
};

function ListingCard({
  data,
  reservation,
  onAction,
  disabled,
  actionLabel,
  actionId = "",
  currentUser,
  children,
}: Props) {
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      onAction?.(actionId);
    },
    [onAction, actionId, disabled]
  );

  const price = useMemo(() => {
    if (reservation) {
      return reservation.totalPrice;
    }

    return data.pricePerNight;
  }, [reservation, data.pricePerNight]);

  const availabilityRange = useMemo(() => {
    const availabilityList = data.availabilities || [];
    if (availabilityList.length === 0) {
      return null;
    }

    const sorted = [...availabilityList].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const start = new Date(sorted[0].date);
    let end = new Date(sorted[0].date);

    for (let i = 1; i < sorted.length; i += 1) {
      const current = new Date(sorted[i].date);
      const nextExpected = new Date(end);
      nextExpected.setDate(end.getDate() + 1);

      if (current.getTime() === nextExpected.getTime()) {
        end = current;
      } else {
        break;
      }
    }

    return { start, end };
  }, [data.availabilities]);

  const availabilityDate = useMemo(() => {
    if (!availabilityRange) {
      return null;
    }

    const locale = language === "fr" ? fr : enUS;
    const startLabel = format(availabilityRange.start, "d MMM", { locale });
    const endLabel = format(availabilityRange.end, "d MMM", { locale });

    if (startLabel === endLabel) {
      return startLabel;
    }

    return `${startLabel} - ${endLabel}`;
  }, [availabilityRange, language]);

  const reservationDate = useMemo(() => {
    if (!reservation || !reservation.checkIn || !reservation.checkOut) {
      return null;
    }

    const start = new Date(reservation.checkIn);
    const end = new Date(reservation.checkOut);

    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  const { city, country } = reservation?.listing?.location || data?.location || { city: "", country: "" };
  const type = reservation?.listing?.type || data?.type || "";

  return (
    <Link
      href={`/listings/${data.id}`}
      className="col-span-1"
      prefetch
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 1, 0.5, 1],
        }}
        className="cursor-pointer group"
      >
        <div className="flex flex-col gap-3 w-full bg-white rounded-2xl p-2 border border-neutral-100 hover:shadow-md transition-shadow duration-200">
          <div className="aspect-square w-full relative overflow-hidden rounded-xl">
            <Image
              fill
              className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-200 ease-out"
              src={data.images?.[0] || ""}
              alt="listing"
            />
            <div className="absolute top-3 left-3 bg-brand-50/95 text-brand-700 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-brand-100">
              {language === "fr" ? "Coup de cœur" : "Guest favorite"}
            </div>
            <div className="absolute top-3 right-3">
              <HeartButton listingId={data.id} currentUser={currentUser} />
            </div>
          </div>
          
          <div className="px-1 flex flex-col gap-1">
            <div className="flex flex-row justify-between items-start">
              <div className="font-semibold text-[15px] text-neutral-800 line-clamp-1">
                {type} · {city}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-neutral-800 font-medium">
                <span className="text-[#f59e0b]">★</span>
                <span>
                  {data.avgRating > 0 ? (
                    <>
                      {data.avgRating.toFixed(1)}
                      <span className="text-neutral-400 font-light text-xs ml-0.5">
                        ({data.totalReviews})
                      </span>
                    </>
                  ) : (
                    language === "fr" ? "Nouveau" : "New"
                  )}
                </span>
              </div>
            </div>
            <div className="text-[13px] text-neutral-400 font-medium">
              {reservationDate || availabilityDate || (language === "fr" ? "Dates flexibles" : "Flexible dates")}
            </div>
            <div className="flex flex-row items-center gap-1 mt-1">
              <div className="font-bold text-neutral-900">
                €{price}
              </div>
              <div className="font-normal text-neutral-500 text-xs">
                {reservation ? t.total : `/ ${t.night}`}
              </div>
            </div>
          </div>
          
          {onAction && actionLabel && (
            <div className="px-1 mt-2">
              <Button
                disabled={disabled}
                small
                label={actionLabel}
                onClick={handleCancel}
              />
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </Link>
  );
}

export default ListingCard;
