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
  const t = translations[language] || translations.en;
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
        className="border border-neutral-200/60 py-1.5 pl-3 pr-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer flex flex-row items-center justify-between text-sm bg-white/95 backdrop-blur-xl"
      >
        <div className="flex flex-row items-center gap-3 px-4 hover:bg-neutral-100/80 rounded-full transition-colors duration-200 py-1.5 font-bold text-neutral-800">
          <video key={mode} autoPlay muted playsInline className="w-4 h-4 object-cover bg-transparent opacity-90">
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
          <span className="truncate max-w-[120px]">{destinationLabel}</span>
        </div>
        <div className="px-5 border-l border-neutral-200/60 flex-1 text-center py-1.5 hover:bg-neutral-100/80 rounded-full transition-colors duration-200 font-bold text-neutral-800">
          {durationLabel}
        </div>
        <div className="flex flex-row items-center gap-3 pl-5 pr-1 py-1 hover:bg-neutral-100/80 rounded-full transition-colors duration-200 border-l border-neutral-200/60">
          <span className="text-neutral-500 font-medium truncate max-w-[120px]">{guestLabel}</span>
          <div className="p-2 bg-gradient-to-br from-brand-500 to-emerald-500 rounded-full text-white shadow-sm hover:shadow-md transition-all">
            <BiSearch size={14} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 w-full md:w-[820px] rounded-full shadow-sm hover:shadow-md bg-white transition-shadow duration-300">
      <div className="flex flex-row items-center h-[66px]">

        {/* Destination */}
        <div
          onClick={() => searchModal.onOpen(STEP_LOCATION)}
          className="flex flex-col justify-center flex-[1.2] h-full px-8 xl:px-10 rounded-full hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
        >
          <p className="text-[12px] font-extrabold text-neutral-800 mb-0.5 tracking-wide">{isFr ? "Destination" : "Where"}</p>
          <p className={`text-sm truncate ${locationValue ? "text-neutral-900 font-semibold" : "text-neutral-500 font-normal"}`}>
            {destinationLabel}
          </p>
        </div>

        <div className="h-8 w-[1px] bg-neutral-200 flex-shrink-0" />

        {/* Dates */}
        <div
          onClick={() => searchModal.onOpen(STEP_DATE)}
          className="hidden sm:flex flex-col justify-center flex-1 h-full px-6 xl:px-8 rounded-full hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
        >
          <p className="text-[12px] font-extrabold text-neutral-800 mb-0.5 tracking-wide">{isFr ? "Dates" : "When"}</p>
          <p className={`text-sm ${(startDate && endDate) ? "text-neutral-900 font-semibold" : "text-neutral-500 font-normal"}`}>
            {durationLabel}
          </p>
        </div>

        <div className="hidden sm:block h-8 w-[1px] bg-neutral-200 flex-shrink-0" />

        {/* Voyageurs */}
        <div className="flex flex-row items-center flex-[1.1] h-full pr-2">
          <div
            onClick={() => searchModal.onOpen(STEP_GUESTS)}
            className="hidden sm:flex flex-col justify-center flex-1 h-full pl-6 xl:pl-8 pr-4 hover:bg-neutral-100 rounded-full transition-colors duration-200 cursor-pointer"
          >
            <p className="text-[12px] font-extrabold text-neutral-800 mb-0.5 tracking-wide">{isFr ? "Voyageurs" : "Who"}</p>
            <p className={`text-sm truncate ${guestCount ? "text-neutral-900 font-semibold" : "text-neutral-500 font-normal"}`}>
              {guestLabel}
            </p>
          </div>

          <div
            onClick={() => searchModal.onOpen(STEP_LOCATION)}
            className="h-[48px] px-6 bg-[#FF385C] rounded-full text-white flex items-center justify-center gap-2 hover:bg-[#D70466] transition-all duration-300 shadow-md active:scale-95 cursor-pointer ml-auto"
          >
            <BiSearch size={20} strokeWidth={1} />
            <span className="font-bold text-[15px] hidden lg:block">{t.search}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Search;
