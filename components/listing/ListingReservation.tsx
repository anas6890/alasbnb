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
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden sticky top-24">
      <div className="flex flex-row items-baseline gap-1 p-6 pb-4">
        <span className="text-2xl font-bold text-neutral-800">€{price}</span>
        <span className="font-light text-neutral-500 text-base">par nuit</span>
      </div>
      <div className="px-6 pb-2">
        <div className="border border-neutral-300 rounded-xl overflow-hidden">
          <Calendar
            value={dateRange}
            disabledDates={disabledDates}
            onChange={(value) => onChangeDate(value.selection)}
          />
        </div>
      </div>
      <div className="p-6 pt-4">
        <Button disabled={disabled} label="Réserver" onClick={onSubmit} />
        <div className="text-center text-sm font-light text-neutral-500 mt-4">
          Aucun montant ne vous sera débité pour le moment
        </div>
      </div>

      <div className="px-6 py-4 border-t border-neutral-200">
        <div className="flex flex-row justify-between items-center text-sm text-neutral-600 mb-2">
          <span className="underline">Politique d&apos;annulation</span>
        </div>
        <div className="text-sm font-semibold text-neutral-800">
          {renderPolicy()}
        </div>
      </div>

      <div className="p-6 pt-0 flex flex-row items-center justify-between font-bold text-lg text-neutral-800 border-t border-neutral-200 mt-4 pt-4">
        <p>Total</p>
        <p>€{totalPrice}</p>
      </div>
    </div>
  );
}

export default ListingReservation;
