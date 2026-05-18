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
      className={` rounded-xl border-2 p-4 flex flex-col gap-3 hover:border-black transition cursor-pointer ${
        selected ? "border-black" : "border-neutral-200"
      }`}
    >
      <Icon size={30} />
      <div className="font-semibold">{displayLabel}</div>
    </div>
  );
}

export default CategoryInput;
