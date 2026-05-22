"use client";

import React from "react";
import { Range } from "react-date-range";
import Calendar from "../inputs/Calendar";
import Button from "../Button";

type Props = {
  price: number;
  dateRange: Range;
  totalPrice: number;
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
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
  cancellationPolicy = "FLEXIBLE",
}: Props) {
  const renderPolicy = () => {
    switch (cancellationPolicy) {
      case "FLEXIBLE":
        return "Annulation gratuite jusqu'à 24h avant l'arrivée.";
      case "MODERATE":
        return "Annulation gratuite jusqu'à 5 jours avant l'arrivée.";
      case "STRICT":
        return "Remboursement de 50% jusqu'à 7 jours avant l'arrivée.";
      case "NON_REFUNDABLE":
        return "Non remboursable.";
      default:
        return "Annulation gratuite jusqu'à 24h avant l'arrivée.";
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden sticky top-32 z-10 p-1">
      <div className="flex flex-col gap-6 p-7 pb-4">
        <div className="flex flex-row items-baseline gap-1.5">
          <span className="text-3xl font-black text-neutral-900">€{price}</span>
          <span className="font-medium text-neutral-500 text-sm tracking-wide">/ nuit</span>
        </div>
        
        <div className="bg-neutral-50/50 rounded-2xl border border-neutral-100 overflow-hidden shadow-inner">
          <Calendar
            value={dateRange}
            disabledDates={disabledDates}
            onChange={(value) => onChangeDate(value.selection)}
          />
        </div>
      </div>
      
      <div className="px-7 pt-2 pb-6">
        <button 
          disabled={disabled}
          onClick={onSubmit}
          className="w-full px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(var(--brand-500-rgb),0.2)] hover:shadow-[0_15px_30px_rgba(var(--brand-500-rgb),0.3)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 relative overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></span>
          <span className="relative z-10 text-lg">Réserver</span>
        </button>
        <div className="text-center text-[13px] font-medium text-neutral-500 mt-4">
          Aucun montant ne vous sera débité pour le moment
        </div>
      </div>

      <div className="px-7 py-5 bg-neutral-50/80 border-t border-neutral-100/80">
        <div className="flex flex-row justify-between items-center text-[13px] text-neutral-500 mb-1.5 font-medium">
          <span>Politique d'annulation</span>
        </div>
        <div className="text-sm font-bold text-neutral-800 leading-tight">
          {renderPolicy()}
        </div>
      </div>

      <div className="px-7 py-6 flex flex-row items-center justify-between font-black text-xl text-neutral-900 border-t border-neutral-100/80">
        <p>Total</p>
        <p>€{totalPrice}</p>
      </div>
    </div>
  );
}

export default ListingReservation;
