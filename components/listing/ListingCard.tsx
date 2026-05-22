"use client";

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
  isExperience?: boolean;
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
  isExperience,
}: Props) {
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const router = useRouter();

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

  const renderStatusBadge = () => {
    if (!reservation) return null;
    
    // Check if the reservation is past
    const isPast = reservation.type === "EXPERIENCE" 
      ? (reservation.session && new Date(reservation.session.dateTime) < new Date())
      : (reservation.checkOut && new Date(reservation.checkOut) < new Date());

    const status = isPast && reservation.status === "CONFIRMED" ? "COMPLETED" : reservation.status;

    switch (status) {
      case "PENDING":
        return <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm">En attente</div>;
      case "CONFIRMED":
        return <div className="absolute top-3 left-3 bg-teal-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm">Confirmée</div>;
      case "CANCELLED":
        return <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm">Annulée</div>;
      case "COMPLETED":
        return <div className="absolute top-3 left-3 bg-neutral-600 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shadow-sm">Terminée</div>;
      default:
        return null;
    }
  };

  const targetPath = isExperience ? `/experiences/${data.id}` : `/listings/${data.id}`;

  return (
    <div
      onClick={() => router.push(targetPath)}
      className="block w-full h-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="cursor-pointer group h-full"
      >
        <div className="flex flex-col gap-2 w-full transition-all duration-500 h-full">
          <div className="aspect-[20/19] w-full relative overflow-hidden rounded-[16px]">
            <Image
              fill
              className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-700 ease-out"
              src={data.images?.[0] || ""}
              alt="listing"
            />
            {renderStatusBadge()}
            <div className="absolute top-4 right-4">
              <HeartButton listingId={data.id} currentUser={currentUser} />
            </div>
          </div>
          
          <div className="flex flex-col gap-0.5 mt-2">
            <div className="text-[15px] text-neutral-800 font-normal truncate">
              <span className="capitalize">{type}</span> · {city}
            </div>
            
            <div className="text-[15px] text-neutral-500 font-normal truncate">
              {reservationDate || availabilityDate || (language === "fr" ? "Dates flexibles" : "Flexible dates")}
            </div>

            <div className="flex flex-row items-center mt-1 text-[15px] text-neutral-500">
              <span className="font-semibold text-neutral-800">{price} €</span>
              <span className="ml-1">
                {reservation ? t.total : `pour 1 ${t.night.toLowerCase()}`}
              </span>
              <span className="mx-1.5">·</span>
              <span className="flex items-center gap-1">
                <span className="text-[12px] mt-0.5">★</span>
                <span>{data.avgRating > 0 ? data.avgRating.toFixed(2) : (language === "fr" ? "Nouveau" : "New")}</span>
              </span>
            </div>
          </div>
          
          {onAction && actionLabel && (
            <div className="px-2 mt-auto">
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
    </div>
  );
}

export default ListingCard;
