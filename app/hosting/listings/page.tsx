import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";
import getExperiences from "@/app/actions/getExperiences";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import HostListingsClient from "./HostListingsClient";

const HostListingsPage = async () => {
  const currentUser = await getCurrentUser();
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title={t.unauthorized}
          subtitle={t.please_login}
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
