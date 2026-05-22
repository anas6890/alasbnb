import Container from "@/components/Container";
import Heading from "@/components/Heading";
import EmptyState from "@/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getExperiences from "@/app/actions/getExperiences";
import ListingCard from "@/components/listing/ListingCard";
import ExperienceCard from "@/components/experience/ExperienceCard";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export default async function HostListingsPage() {
  const currentUser = await getCurrentUser();
  const [listings, experiences] = await Promise.all([
    getListings({ userId: currentUser?.id }),
    getExperiences({ userId: currentUser?.id })
  ]);

  const hasContent = listings.length > 0 || experiences.length > 0;

  if (!hasContent) {
    return (
      <Container>
        <div className="pt-8 flex flex-col gap-8">
           <div className="flex flex-row items-center justify-between">
            <Heading
              title="Mes annonces"
              subtitle="Gérez vos logements et vos expériences."
            />
            <Link
              href="/hosting/create"
              className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition"
            >
              <FiPlus size={20} />
              Créer une annonce
            </Link>
          </div>
          <EmptyState
            title="Aucune annonce trouvée"
            subtitle="Il semble que vous n'ayez pas encore d'annonces."
          />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pt-8 flex flex-col gap-12">
        <div className="flex flex-row items-center justify-between">
          <Heading
            title="Mes annonces"
            subtitle="Gérez vos logements et vos expériences."
          />
          <Link
            href="/hosting/create"
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-neutral-800 transition"
          >
            <FiPlus size={20} />
            Créer une annonce
          </Link>
        </div>

        {listings.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-neutral-800">Mes logements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  data={listing}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-neutral-800">Mes expériences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
              {experiences.map((experience: any) => (
                <ExperienceCard
                  key={experience.id}
                  data={experience}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
