import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ContactReservationClient from "./ContactReservationClient";

interface IParams {
  reservationId?: string;
}

export default async function ContactReservationPage(props: { params: Promise<IParams> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter." />
      </ClientOnly>
    );
  }

  if (!params.reservationId) {
    return (
      <ClientOnly>
        <EmptyState title="Erreur" subtitle="Réservation invalide." />
      </ClientOnly>
    );
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: params.reservationId },
    include: {
      listing: {
        include: { user: true }
      },
      session: {
        include: { experience: { include: { user: true } } }
      }
    }
  });

  if (!reservation || reservation.userId !== currentUser.id) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Cette réservation ne vous appartient pas." />
      </ClientOnly>
    );
  }

  // Si c'est une expérience, on bloque ou on adapte, mais pour l'instant on se concentre sur les logements
  if (reservation.type === "EXPERIENCE" || !reservation.listing) {
    return (
      <ClientOnly>
        <EmptyState title="Non supporté" subtitle="Contact spécifique aux logements pour le moment." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ContactReservationClient
        reservation={reservation}
        listing={reservation.listing}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
