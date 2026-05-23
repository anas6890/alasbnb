import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getExperiences from "@/app/actions/getExperiences";
import getCurrentUser from "@/app/actions/getCurrentUser";
import Container from "@/components/Container";
import ExperienceCard from "@/components/experience/ExperienceCard";
import { cookies } from "next/headers";
import ExperienceCarousel from "@/components/experience/ExperienceCarousel";
import { translations } from "@/lib/translations";

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
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;
  
  // Define a mapping or just use t[groupName] if it exists in translations
  const getCategoryLabel = (category: string) => {
    // If the category matches a translation key, use it
    if (t[category.toLowerCase()]) {
      return t[category.toLowerCase()];
    }
    return category;
  };

  const searchParams = await props.searchParams;
  const experiences = await getExperiences(searchParams);
  const currentUser = await getCurrentUser();

  if (experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState title={t.no_experience} subtitle={t.no_experience_desc} />
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
            {t.exp_hero_title}
          </h1>
          <p className="text-sm md:text-lg text-neutral-200 font-light max-w-2xl drop-shadow-md">
            {t.exp_hero_subtitle}
          </p>
        </div>
      </div>

      <Container>
        <div className="pb-16 flex flex-col gap-8">
          {Object.entries(
            experiences.reduce((acc: any, exp: any) => {
              const groupKey = exp.category || exp.location?.city || "Ailleurs";
              if (!acc[groupKey]) acc[groupKey] = [];
              acc[groupKey].push(exp);
              return acc;
            }, {})
          ).map(([groupName, groupExperiences]: [string, any]) => {
            const title =
              groupName === "Ailleurs"
                ? t.elsewhere
                : `Expériences : ${getCategoryLabel(groupName)}`;
            return (
              <ExperienceCarousel
                key={groupName}
                title={title}
                experiences={groupExperiences as any}
                currentUser={currentUser}
              />
            );
          })}
        </div>
      </Container>
    </ClientOnly>
  );
}
