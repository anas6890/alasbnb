import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import HostReservationsClient from "./HostReservationsClient";

const HostReservationsPage = async () => {
  const currentUser = await getCurrentUser();
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title={t.unauthorized} subtitle={t.please_login} />
      </ClientOnly>
    );
  }

  // Get reservations where the current user is the host
  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title={t.host_reservations_none_found}
          subtitle={t.host_reservations_none_found}
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
