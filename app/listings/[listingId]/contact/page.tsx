import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ContactHostClient from "./ContactHostClient";

interface IParams {
  listingId?: string;
}

export default async function ContactHostPage(props: { params: Promise<IParams> }) {
  const params = await props.params;
  const [listing, currentUser] = await Promise.all([
    getListingById(params),
    getCurrentUser()
  ]);

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState showReset />
      </ClientOnly>
    );
  }

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter pour contacter l'hôte." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ContactHostClient
        listing={listing}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
