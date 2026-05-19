import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getExperiences from "@/app/actions/getExperiences";
import getCurrentUser from "@/app/actions/getCurrentUser";
import Container from "@/components/Container";
import ExperienceCard from "@/components/experience/ExperienceCard";

interface ExperiencesProps {
  searchParams: {
    userId?: string;
    guestCount?: number;
    roomCount?: number;
    bathroomCount?: number;
    startDate?: string;
    endDate?: string;
    locationValue?: string;
    category?: string;
  };
}

export default async function ExperiencesPage({ searchParams }: ExperiencesProps) {
  const experiences = await getExperiences(searchParams);
  const currentUser = await getCurrentUser();

  if (experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState title="Aucune experience" subtitle="Aucune experience ne correspond a votre recherche." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {experiences.map((experience: any) => (
            <ExperienceCard
              key={experience.id}
              data={experience}
              currentUser={currentUser}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
