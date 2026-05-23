import getCurrentUser from "@/app/actions/getCurrentUser";
import getExperienceById from "@/app/actions/getExperienceById";
import getReviews from "@/app/actions/getReviews";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import ExperienceClient from "@/components/experience/ExperienceClient";

interface IParams {
  experienceId?: string;
}

const ExperiencePage = async (props: { params: Promise<IParams> }) => {
  const params = await props.params;
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  const [experience, currentUser, reviews] = await Promise.all([
    getExperienceById(params),
    getCurrentUser(),
    getReviews({ experienceId: params.experienceId })
  ]);

  if (!experience) {
    return (
      <ClientOnly>
        {
          (() => {
            return <EmptyState title={t.no_experience} subtitle={t.no_experience_desc} />;
          })()
        }
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
