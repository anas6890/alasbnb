"use client";

import useCountries from "@/hook/useCountries";
import useSearchModal from "@/hook/useSearchModal";
import { differenceInDays } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";

type Props = {};

function Search({}: Props) {
  const searchModel = useSearchModal();
  const params = useSearchParams();

  // We are keeping locationValue as text for city/country
  const locationValue = params?.get("locationValue");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const guestCount = params?.get("guestCount");

  const locationLabel = useMemo(() => {
    if (locationValue) {
      return locationValue;
    }

    return "Rechercher une destination";
  }, [locationValue]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start);

      if (diff === 0) {
        diff = 1;
      }

      return `${diff} jours`;
    }

    return "Quand ?";
  }, [startDate, endDate]);

  const guessLabel = useMemo(() => {
    if (guestCount) {
      return `${guestCount} voyageurs`;
    }

    return "Ajouter des voyageurs";
  }, [guestCount]);

  return (
    <div
      onClick={searchModel.onOpen}
      className="border-[1px] w-full md:w-[850px] py-2 rounded-full shadow-md hover:shadow-lg transition cursor-pointer bg-white"
    >
      <div className="flex flex-row items-center justify-between px-2">
        
        {/* Destination */}
        <div className="flex flex-col px-3 md:px-6 flex-1 border-r-[1px] border-neutral-200">
          <div className="text-[10px] md:text-xs font-bold">Destination</div>
          <div className="text-xs md:text-sm text-neutral-500 truncate max-w-[100px] md:max-w-[200px]">{locationLabel}</div>
        </div>
        
        {/* Dates */}
        <div className="hidden sm:flex flex-col px-6 flex-1 border-r-[1px] border-neutral-200">
           <div className="text-xs font-bold">Dates</div>
           <div className="text-sm text-neutral-500">{durationLabel}</div>
        </div>
        
        {/* Voyageurs & Search Button */}
        <div className="flex flex-row items-center justify-between pl-3 md:pl-6 pr-2 flex-1">
          <div className="hidden sm:flex flex-col">
            <div className="text-xs font-bold">Voyageurs</div>
            <div className="text-sm text-neutral-500">{guessLabel}</div>
          </div>
          <div className="p-2 md:p-3 bg-rose-500 rounded-full text-white ml-auto flex items-center justify-center h-8 w-8 md:h-12 md:w-12">
            <BiSearch size={18} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Search;
