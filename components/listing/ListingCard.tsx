"use client";

import useCountries from "@/hook/useCountries";
import { SafeReservation, SafeUser, safeListing } from "@/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import Button from "../Button";
import HeartButton from "../HeartButton";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

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
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const { getByValue } = useCountries();

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
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

  const reservationDate = useMemo(() => {
    if (!reservation) {
      return null;
    }

    const start = new Date(reservation.checkIn);
    const end = new Date(reservation.checkOut);

    return `${format(start, "PP")} - ${format(end, "PP")}`;
  }, [reservation]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: [0, 0.71, 0.2, 1.01],
      }}
      onClick={() => router.push(`/listings/${data.id}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <Image
            fill
            className="object-cover h-full w-full group-hover:scale-110 transition"
            src={data.images?.[0] || ""}
            alt="listing"
          />
          <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
            {language === "fr" ? "Coup de cœur voyageurs" : "Guest favorite"}
          </div>
          <div className="absolute top-3 right-3">
            <HeartButton listingId={data.id} currentUser={currentUser} />
          </div>
        </div>
        <div className="flex flex-row justify-between items-start">
          <div className="font-bold text-base">
            {data.type} - {data.city}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>★</span>
            <span>5,0</span>
          </div>
        </div>
        <div className="font-light text-neutral-500 text-sm">
          {reservationDate || "15-17 May"}
        </div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">
             €{price}
          </div>
          <div className="font-light text-neutral-500 text-sm">
            {reservation ? t.total : `/ ${t.night}`}
          </div>
        </div>
        {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
          />
        )}
        {children}
      </div>
    </motion.div>
  );
}

export default ListingCard;
