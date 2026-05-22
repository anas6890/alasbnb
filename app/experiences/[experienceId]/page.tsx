import getCurrentUser from "@/app/actions/getCurrentUser";
import getExperienceById from "@/app/actions/getExperienceById";
import getReviews from "@/app/actions/getReviews";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ExperienceClient from "@/components/experience/ExperienceClient";

interface IParams {
  experienceId?: string;
}

const ExperiencePage = async (props: { params: Promise<IParams> }) => {
  const params = await props.params;
  const [experience, currentUser, reviews] = await Promise.all([
    getExperienceById(params),
    getCurrentUser(),
    getReviews({ experienceId: params.experienceId })
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
        reviews={reviews}
      />
    </ClientOnly>
  );
};

export default ExperiencePage;
