"use client";

import React from "react";
import { IconType } from "react-icons";
import useLanguage from "@/hook/useLanguage";

type Props = {
  icon: IconType;
  label: string;
  selected?: boolean;
  onClick: (value: string) => void;
};

const translations: Record<string, Record<string, string>> = {
  fr: {
    apartment: "Appartement",
    house: "Maison",
    villa: "Villa",
    cabin: "Chalet",
    boat: "Bateau",
    treehouse: "Cabane",
  },
  en: {
    apartment: "Apartment",
    house: "House",
    villa: "Villa",
    cabin: "Cabin",
    boat: "Boat",
    treehouse: "Treehouse",
  }
};

function CategoryInput({ icon: Icon, label, selected, onClick }: Props) {
  const { language } = useLanguage();
  const displayLabel = translations[language]?.[label] || label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div
      onClick={() => onClick(label)}
      className={`relative overflow-hidden rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer text-center ${
        selected 
          ? "border-rose-500 bg-rose-50/50 shadow-[0_8px_25px_rgba(244,63,94,0.15)] text-rose-600" 
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
      }`}
    >
      <Icon size={36} className={`transition-colors duration-300 ${selected ? "text-rose-500" : "text-neutral-700"}`} />
      <div className={`font-bold text-lg tracking-tight transition-colors duration-300 ${selected ? "text-rose-900" : "text-neutral-900"}`}>{displayLabel}</div>
      {selected && (
        <div className="absolute top-4 right-4 flex items-center justify-center w-5 h-5 bg-rose-500 rounded-full text-white shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      )}
    </div>
  );
}

export default CategoryInput;
