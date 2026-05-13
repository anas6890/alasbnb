import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getExperiences from "@/app/actions/getExperiences";
import getCurrentUser from "@/app/actions/getCurrentUser";
import Container from "@/components/Container";
import ExperienceCard from "@/components/experience/ExperienceCard";

export default async function ExperiencesPage() {
  const experiences = await getExperiences();
  const currentUser = await getCurrentUser();

  if (experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState title="No experiences found" subtitle="Looks like we have no experiences to offer right now." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {experiences.map((experience) => (
            <ExperienceCard
              currentUser={currentUser}
              key={experience.id}
              data={experience}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
