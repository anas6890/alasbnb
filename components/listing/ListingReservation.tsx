"use client";

import React from "react";
import { Range } from "react-date-range";
import Calendar from "../inputs/Calendar";
import Button from "../Button";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

type Props = {
  price: number;
  dateRange: Range;
  totalPrice: number;
  formattedPrice?: string;
  formattedTotalPrice?: string;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  cancellationPolicy?: string;
};

function ListingReservation({
  price,
  dateRange,
  totalPrice,
  formattedPrice,
  formattedTotalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
  cancellationPolicy = "FLEXIBLE",
}: Props) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const renderPolicy = () => {
    switch (cancellationPolicy) {
      case "FLEXIBLE":
        return t.policy_flexible || "Annulation gratuite jusqu'à 24h avant l'arrivée.";
      case "MODERATE":
        return t.policy_moderate || "Annulation gratuite jusqu'à 5 jours avant l'arrivée.";
      case "STRICT":
        return t.policy_strict || "Remboursement de 50% jusqu'à 7 jours avant l'arrivée.";
      case "NON_REFUNDABLE":
        return t.policy_non_refundable || "Non remboursable.";
      default:
        return t.policy_flexible || "Annulation gratuite jusqu'à 24h avant l'arrivée.";
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-neutral-200 shadow-floating overflow-hidden sticky top-28 z-10 p-6">
      <div className="flex flex-col gap-6 pb-6 border-b border-neutral-200">
        <div className="flex flex-row items-baseline gap-1.5">
          <span className="text-2xl font-bold text-neutral-900">{formattedPrice || `€${price}`}</span>
          <span className="font-normal text-neutral-600 text-base">/ {cancellationPolicy === "EXPERIENCE" ? t.person : t.night}</span>
        </div>
        
        <div className="bg-white rounded-[16px] border border-neutral-300 overflow-hidden shadow-sm">
          <Calendar
            value={dateRange}
            disabledDates={disabledDates}
            onChange={(value) => onChangeDate(value.selection)}
          />
        </div>
      </div>
      
      <div className="pt-6 pb-6">
        <button 
          disabled={disabled}
          onClick={onSubmit}
          className="w-full px-6 py-3.5 bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:brightness-110 text-white font-bold rounded-[8px] transition-all duration-300 shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
        >
          <span className="text-[16px]">{t.reserve}</span>
        </button>
        <div className="text-center text-[14px] font-normal text-neutral-600 mt-4">
          {t.no_charge_yet || "Aucun montant ne vous sera débité pour le moment"}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between font-semibold text-[16px] text-neutral-900 pt-6 border-t border-neutral-200">
        <p className="underline underline-offset-2 decoration-neutral-300">{t.total}</p>
        <p>{formattedTotalPrice || `€${totalPrice}`}</p>
      </div>
    </div>
  );
}

export default ListingReservation;
