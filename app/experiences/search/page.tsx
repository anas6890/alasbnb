import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ExperienceCard from "@/components/experience/ExperienceCard";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getExperiences, { IExperiencesParams } from "@/app/actions/getExperiences";
import dynamic from "next/dynamic";
import { BiFilter } from "react-icons/bi";

interface ExperienceSearchProps {
  searchParams: IExperiencesParams;
}

export default async function ExperienceSearchPage({ searchParams }: ExperienceSearchProps) {
  const [experiences, currentUser] = await Promise.all([
    getExperiences(searchParams),
    getCurrentUser(),
  ]);

  const MapExperiences = dynamic(() => import("@/components/MapExperiences"), { ssr: false });

  const locationLabel = searchParams.locationValue
    ? searchParams.locationValue.split(" - ")[0]
    : "Toutes les destinations";
  const resultsLabel = experiences.length === 1 ? "1 experience" : `${experiences.length} experiences`;

  if (experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset title="Aucune experience" subtitle="Aucune experience ne correspond a votre recherche." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-28 pb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-neutral-900">{locationLabel} : {resultsLabel}</h1>
              <p className="text-sm text-neutral-500">Classement des resultats</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-800 hover:shadow-md transition">
              <BiFilter size={18} />
              Filtres
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
    </ClientOnly>
  );
}
