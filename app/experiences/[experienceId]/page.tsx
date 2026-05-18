import getCurrentUser from "@/app/actions/getCurrentUser";
import getExperienceById from "@/app/actions/getExperienceById";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ExperienceClient from "@/components/experience/ExperienceClient";

interface IParams {
  experienceId?: string;
}

const ExperiencePage = async ({ params }: { params: IParams }) => {
  const [experience, currentUser] = await Promise.all([
    getExperienceById(params),
    getCurrentUser()
  ]);

  if (!experience) {
    return (
      <ClientOnly>
        <EmptyState title="Expérience non trouvée" subtitle="Cette expérience n'existe pas ou a été retirée." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ExperienceClient
        experience={experience}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default ExperiencePage;
