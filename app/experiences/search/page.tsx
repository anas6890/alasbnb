import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getExperiences, { IExperiencesParams } from "@/app/actions/getExperiences";
import ExperienceSearchClient from "./ExperienceSearchClient";

export default async function ExperienceSearchPage(props: { searchParams: Promise<IExperiencesParams> }) {
  const searchParams = await props.searchParams;
  const [experiences, currentUser] = await Promise.all([
    getExperiences(searchParams),
    getCurrentUser(),
  ]);

  if (experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset title="Aucune experience" subtitle="Aucune experience ne correspond a votre recherche." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ExperienceSearchClient 
        experiences={experiences} 
        currentUser={currentUser} 
        searchParams={searchParams} 
      />
    </ClientOnly>
  );
}
