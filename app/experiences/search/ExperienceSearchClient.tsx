"use client";

import dynamic from "next/dynamic";
import { IExperiencesParams } from "@/app/actions/getExperiences";
import Container from "@/components/Container";
import ExperienceCard from "@/components/experience/ExperienceCard";
import { BiFilter } from "react-icons/bi";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

const MapExperiences = dynamic(() => import("@/components/MapExperiences"), { ssr: false });

interface ExperienceSearchClientProps {
  experiences: any[];
  currentUser: any;
  searchParams: IExperiencesParams;
}

export default function ExperienceSearchClient({
  experiences,
  currentUser,
  searchParams,
}: ExperienceSearchClientProps) {
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;

  const locationLabel = searchParams.locationValue
    ? searchParams.locationValue.split(" - ")[0]
    : t.all_destinations || "Toutes les destinations";
  const resultsLabel = experiences.length === 1 
    ? `1 ${t.experiences.toLowerCase().replace(/s$/, '') || "experience"}` 
    : `${experiences.length} ${t.experiences.toLowerCase() || "experiences"}`;

  return (
    <Container>
      <div className="pt-28 pb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-neutral-900">{locationLabel} : {resultsLabel}</h1>
            <p className="text-sm text-neutral-500">{t.available_ranking || "Classement des resultats"}</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-800 hover:shadow-md transition">
            <BiFilter size={18} />
            {t.more_filters || "Filtres"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {experiences.map((experience: any) => (
              <ExperienceCard
                key={experience.id}
                data={experience}
                currentUser={currentUser}
              />
            ))}
          </div>

          <div className="hidden lg:block sticky top-28">
            <MapExperiences experiences={experiences} className="h-[75vh] rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </Container>
  );
}
