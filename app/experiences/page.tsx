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

export default async function ExperiencesPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
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
      <div className="relative w-full h-[25vh] min-h-[220px] max-h-[300px] overflow-hidden bg-neutral-900 mb-12">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1887&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-2 max-w-4xl">
            Vivez l&apos;exceptionnel.
          </h1>
          <p className="text-sm md:text-lg text-neutral-200 font-light max-w-2xl drop-shadow-md">
            Des moments inoubliables, créés par des experts passionnés.
          </p>
        </div>
      </div>

      <Container>
        <div className="pb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
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
