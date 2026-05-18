"use client";

import useSearchModal from "@/hook/useSearchModal";
import useLanguage from "@/hook/useLanguage";
import { formatISO } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

import CitySelect, { CitySelectValue } from "../inputs/CitySelect";
import Modal from "./Modal";
import Heading from "../Heading";
import Calendar from "../inputs/Calendar";

const Map = dynamic(() => import("../Map"), { ssr: false });

// ── Steps ──────────────────────────────────────────────────────────────────
enum STEPS {
  LOCATION = 0,
  DATE = 1,
  GUESTS = 2,
}

// ── Mini counter row (Airbnb style) ────────────────────────────────────────
function CounterRow({
  title,
  subtitle,
  value,
  onChange,
  min = 0,
}: {
  title: string;
  subtitle: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-semibold text-[15px] text-neutral-800">{title}</p>
        <p className="text-sm text-neutral-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition
            ${value <= min
              ? "border-neutral-200 text-neutral-200 cursor-not-allowed"
              : "border-neutral-400 text-neutral-600 hover:border-neutral-800 cursor-pointer"
            }`}
        >
          <AiOutlineMinus size={12} />
        </button>
        <span className="w-5 text-center text-[16px] text-neutral-700">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition cursor-pointer"
        >
          <AiOutlinePlus size={12} />
        </button>
      </div>
    </div>
  );
}

// ── SearchModal ────────────────────────────────────────────────────────────
export default function SearchModal() {
  const router = useRouter();
  const params = useSearchParams();
  const searchModel = useSearchModal();
  const { language } = useLanguage();
  const isFr = language === "fr";

  const [location, setLocation] = useState<CitySelectValue>();
  const [step, setStep] = useState(STEPS.LOCATION);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [pets, setPets] = useState(0);

  // Open at the step requested from the store
  useEffect(() => {
    if (searchModel.isOpen) {
      setStep(searchModel.initialStep ?? STEPS.LOCATION);
    }
  }, [searchModel.isOpen, searchModel.initialStep]);

  const onBack = () => setStep((s) => s - 1);
  const onNext = () => setStep((s) => s + 1);

  const onSubmit = useCallback(async () => {
    if (step !== STEPS.GUESTS) return onNext();

    const totalGuests = adults + children + babies + pets;
    let currentQuery = params ? qs.parse(params.toString()) : {};

    const updatedQuery: any = {
      ...currentQuery,
      locationValue: location?.label,
      guestCount: totalGuests || 1,
    };

    if (dateRange.startDate) updatedQuery.startDate = formatISO(dateRange.startDate);
    if (dateRange.endDate) updatedQuery.endDate = formatISO(dateRange.endDate);

    const url = qs.stringifyUrl({ url: "/", query: updatedQuery }, { skipNull: true });

    setStep(STEPS.LOCATION);
    searchModel.onClose();
    router.push(url);
  }, [step, searchModel, location, router, adults, children, babies, pets, dateRange, params]);

  const actionLabel = step === STEPS.GUESTS
    ? (isFr ? "Rechercher" : "Search")
    : (isFr ? "Suivant" : "Next");

  const secondaryActionLabel = step === STEPS.LOCATION ? undefined : (isFr ? "Retour" : "Back");

  // ── Step content ──────────────────────────────────────────────────────
  let bodyContent = (
    <div className="flex flex-col gap-6">
      <Heading
        title={isFr ? "Où voulez-vous aller ?" : "Where do you want to go?"}
        subtitle={isFr ? "Trouvez la destination parfaite !" : "Find the perfect location!"}
      />
      <CitySelect value={location} onChange={(v) => setLocation(v as CitySelectValue)} />
      <hr />
      <Map center={location?.latlng} />
    </div>
  );

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title={isFr ? "Quand souhaitez-vous partir ?" : "When do you plan to go?"}
          subtitle={isFr ? "Choisissez vos dates !" : "Pick your dates!"}
        />
        <Calendar
          onChange={(v) => setDateRange(v.selection)}
          value={dateRange}
        />
      </div>
    );
  }

  if (step === STEPS.GUESTS) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title={isFr ? "Qui voyage ?" : "Who's coming?"}
          subtitle={isFr ? "Combien de personnes ?" : "How many guests?"}
        />
        <CounterRow
          title={isFr ? "Adultes" : "Adults"}
          subtitle={isFr ? "13 ans et plus" : "Ages 13 or above"}
          value={adults}
          onChange={setAdults}
        />
        <hr className="border-neutral-100" />
        <CounterRow
          title={isFr ? "Enfants" : "Children"}
          subtitle={isFr ? "De 2 à 12 ans" : "Ages 2–12"}
          value={children}
          onChange={setChildren}
        />
        <hr className="border-neutral-100" />
        <CounterRow
          title={isFr ? "Bébés" : "Infants"}
          subtitle={isFr ? "Moins de 2 ans" : "Under 2"}
          value={babies}
          onChange={setBabies}
        />
        <hr className="border-neutral-100" />
        <CounterRow
          title={isFr ? "Animaux domestiques" : "Pets"}
          subtitle={
            isFr ? (
              <>Vous voyagez avec un animal d'assistance ?{" "}
                <span className="underline font-medium text-neutral-700 cursor-pointer">Obtenez de l'aide</span>
              </>
            ) : (
              <>Bringing a service animal?{" "}
                <span className="underline font-medium text-neutral-700 cursor-pointer">Get help</span>
              </>
            )
          }
          value={pets}
          onChange={setPets}
        />
      </div>
    );
  }

  return (
    <Modal
      isOpen={searchModel.isOpen}
      onClose={searchModel.onClose}
      onSubmit={onSubmit}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      secondaryActionLabel={secondaryActionLabel}
      title={isFr ? "Filtres" : "Filters"}
      actionLabel={actionLabel}
      body={bodyContent}
    />
  );
}
