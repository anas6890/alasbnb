"use client";

import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import React, { useCallback } from "react";
import { IconType } from "react-icons";
import useLanguage from "@/hook/useLanguage";

type Props = {
  icon: IconType;
  label: string;
  selected?: boolean;
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

function CategoryBox({ icon: Icon, label, selected }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { language } = useLanguage();

  const handleClick = useCallback(() => {
    let currentQuery = {};

    if (params) {
      currentQuery = qs.parse(params.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      category: label,
    };

    if (params?.get("category") === label) {
      delete updatedQuery.category;
    }

    const url = qs.stringifyUrl(
      {
        url: "/",
        query: updatedQuery,
      },
      { skipNull: true }
    );

    router.push(url);
  }, [label, params, router]);

  const displayLabel = translations[language]?.[label] || label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 border-b-2 transition-all duration-300 cursor-pointer ${
        selected ? "border-b-neutral-800 text-neutral-800 opacity-100" : "border-transparent text-neutral-500 opacity-70 hover:opacity-100 hover:border-b-neutral-300"
      }`}
    >
      <Icon size={26} />
      <div className="font-medium text-xs whitespace-nowrap">{displayLabel}</div>
    </div>
  );
}

export default CategoryBox;
