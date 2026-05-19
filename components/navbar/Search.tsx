"use client";

import useSearchModal from "@/hook/useSearchModal";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { differenceInDays } from "date-fns";

// Steps matching SearchModal
const STEP_LOCATION = 0;
const STEP_DATE = 1;
const STEP_GUESTS = 2;

type Props = {
  mode?: "logements" | "experiences";
  compact?: boolean;
};

function Search({ mode = "logements", compact = false }: Props) {
  const searchModal = useSearchModal();
  const params = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const isFr = language === "fr";
  const isExp = mode === "experiences";

  const locationValue = params?.get("locationValue");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const guestCount = params?.get("guestCount");

  const destinationLabel = useMemo(() => {
    if (locationValue) return locationValue;
    return isExp
      ? (isFr ? "Ville, musée ou monument" : "City, museum or monument")
      : (isFr ? "Rechercher une destination" : "Search destinations");
  }, [locationValue, isExp, isFr]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const diff = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)));
      return `${diff} ${isFr ? "jours" : "days"}`;
    }
    return isFr ? "Quand ?" : "Any week";
  }, [startDate, endDate, isFr]);

  const guestLabel = useMemo(() => {
    if (guestCount && Number(guestCount) > 0) {
      const n = Number(guestCount);
      return `${n} ${isFr ? (n > 1 ? "voyageurs" : "voyageur") : (n > 1 ? "guests" : "guest")}`;
    }
    return isFr ? "Ajouter des voyageurs" : "Add guests";
  }, [guestCount, isFr]);

  // ── COMPACT ─────────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div
        onClick={() => searchModal.onOpen(STEP_LOCATION)}
        className="border border-gray-200 py-1 pl-2 pr-1 rounded-full shadow-md hover:shadow-lg transition cursor-pointer flex flex-row items-center justify-between text-[15px] font-medium text-gray-800 bg-white"
      >
        <div className="flex flex-row items-center gap-2 px-3 hover:bg-neutral-100 rounded-full transition py-2">
          <video key={mode} autoPlay muted playsInline className="w-5 h-5 object-cover bg-transparent outline-none">
            {isExp ? (
              <>
                <source src="https://a0.muscache.com/videos/search-bar-icons/webm/balloon-twirl.webm" type="video/webm" />
                <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov" type="video/mp4" />
              </>
            ) : (
              <>
                <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-selected.webm#t=0.001" type="video/webm" />
                <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-selected.mov#t=0.001" type="video/mp4" />
              </>
            )}
          </video>
          <span className="font-semibold truncate max-w-[160px]">{destinationLabel}</span>
        </div>
        <div className="px-4 border-l border-r border-gray-200 flex-1 text-center py-2 hover:bg-neutral-100 rounded-full transition font-semibold">
          {durationLabel}
        </div>
        <div className="flex flex-row items-center gap-3 pl-4 pr-1 py-1 hover:bg-neutral-100 rounded-full transition">
          <span className="text-neutral-500 text-sm truncate max-w-[160px]">{guestLabel}</span>
          <div className="p-2 bg-brand-500 rounded-full text-white inline-flex items-center justify-center">
            <BiSearch size={16} />
          </div>
        </div>
      </div>
    );
  }

  // ── EXPANDED ─────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 w-full md:w-[750px] rounded-full shadow-md hover:shadow-lg bg-white">
      <div className="flex flex-row items-center h-[58px]">

        {/* Destination */}
        <div
          onClick={() => searchModal.onOpen(STEP_LOCATION)}
          className="flex flex-col justify-center flex-1 h-full px-6 rounded-l-full hover:bg-neutral-100 transition cursor-pointer"
        >
          <p className="text-[11px] font-bold text-black">{isFr ? "Destination" : "Where"}</p>
          <p className={`text-[13px] truncate ${locationValue ? "text-gray-800" : "text-neutral-400"}`}>
            {destinationLabel}
          </p>
        </div>

        <div className="h-8 w-px bg-neutral-200 flex-shrink-0" />

        {/* Dates */}
        <div
          onClick={() => searchModal.onOpen(STEP_DATE)}
          className="hidden sm:flex flex-col justify-center flex-1 h-full px-6 hover:bg-neutral-100 transition cursor-pointer"
        >
          <p className="text-[11px] font-bold text-black">{isFr ? "Dates" : "When"}</p>
          <p className={`text-[13px] ${(startDate && endDate) ? "text-gray-800" : "text-neutral-400"}`}>
            {durationLabel}
          </p>
        </div>

        <div className="hidden sm:block h-8 w-px bg-neutral-200 flex-shrink-0" />

        {/* Voyageurs */}
        <div className="flex flex-row items-center flex-1 h-full pr-2">
          <div
            onClick={() => searchModal.onOpen(STEP_GUESTS)}
            className="hidden sm:flex flex-col justify-center flex-1 h-full pl-6 pr-2 hover:bg-neutral-100 rounded-r-full transition cursor-pointer"
          >
            <p className="text-[11px] font-bold text-black">{isFr ? "Voyageurs" : "Who"}</p>
            <p className={`text-[13px] ${guestCount ? "text-gray-800" : "text-neutral-400"}`}>
              {guestLabel}
            </p>
          </div>

          {/* Search button */}
          <div
            onClick={() => searchModal.onOpen(STEP_LOCATION)}
            className="p-4 bg-brand-500 rounded-full text-white ml-2 mr-1 flex items-center justify-center hover:bg-brand-600 transition flex-shrink-0 cursor-pointer"
          >
            <BiSearch size={18} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Search;
