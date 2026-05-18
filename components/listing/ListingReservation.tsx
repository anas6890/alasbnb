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
};

function ListingReservation({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-6">
        <span className="text-2xl font-bold text-neutral-900">€{price}</span>
        <span className="font-normal text-neutral-500 text-sm ml-1">/ night</span>
      </div>
      <hr className="border-neutral-100" />
      <div className="p-2">
        <Calendar
          value={dateRange}
          disabledDates={disabledDates}
          onChange={(value) => onChangeDate(value.selection)}
        />
      </div>
      <hr className="border-neutral-100" />
      <div className="p-6">
        <Button disabled={disabled} label="Reserve" onClick={onSubmit} />
      </div>
      <hr className="border-neutral-100" />
      <div className="p-6 flex flex-row items-center justify-between font-bold text-lg text-neutral-800">
        <p>Total</p>
        <p>€{totalPrice}</p>
      </div>
    </div>
  );
}

export default ListingReservation;
