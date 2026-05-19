import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import MessageClient from "./MessageClient";
import prisma from "@/lib/prismadb";

export default async function MessagePage({ params }: { params: { reservationId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter" />
      </ClientOnly>
    );
  }

  const reservation = await prisma.reservation.findUnique({
    where: {
      id: params.reservationId
    },
    include: {
      listing: true,
      user: true
    }
  });

  if (!reservation) {
    return (
      <ClientOnly>
        <EmptyState title="Introuvable" subtitle="Cette réservation n'existe pas" />
      </ClientOnly>
    );
  }

  // Find the other party id
  const hostId = reservation.listing?.hostId || reservation.hostSnapshot?.hostId;
  const guestId = reservation.userId;

  if (currentUser.id !== hostId && currentUser.id !== guestId) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Vous ne faites pas partie de cette réservation" />
      </ClientOnly>
    );
  }

  const receiverId = currentUser.id === hostId ? guestId : hostId;

  // Get receiver user data to display name
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

  return (
    <ClientOnly>
      <MessageClient
        currentUser={currentUser}
        reservationId={params.reservationId}
        receiverId={receiverId as string}
        receiverName={receiver?.firstname || "Utilisateur"}
        receiverImage={receiver?.image || null}
        listingTitle={reservation.listing?.title || reservation.listingSnapshot?.title || "Logement"}
      />
    </ClientOnly>
  );
}

