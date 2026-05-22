import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import HostReservationsClient from "./HostReservationsClient";

const HostReservationsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter" />
      </ClientOnly>
    );
  }

  // Get reservations where the current user is the host
  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="Aucune réservation"
          subtitle="Vous n'avez pas encore reçu de demandes de réservation."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <HostReservationsClient
        reservations={reservations}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
};

export default HostReservationsPage;
