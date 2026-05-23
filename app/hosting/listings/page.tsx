import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getExperiences from "@/app/actions/getExperiences";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import HostListingsClient from "./HostListingsClient";

const HostListingsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Non autorisé"
          subtitle="Veuillez vous connecter pour gérer vos annonces."
        />
      </ClientOnly>
    );
  }

  const [listings, experiences] = await Promise.all([
    getListings({ userId: currentUser.id }),
    getExperiences({ userId: currentUser.id })
  ]);

  return (
    <ClientOnly>
      <HostListingsClient
        listings={listings}
        experiences={experiences}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default HostListingsPage;
