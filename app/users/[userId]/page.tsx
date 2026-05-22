import getCurrentUser from "@/app/actions/getCurrentUser";
import getUserById from "@/app/actions/getUserById";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import UserClient from "./UserClient";

interface IParams {
  userId?: string;
}

export default async function UserPage(props: { params: Promise<IParams> }) {
  const params = await props.params;
  const [user, currentUser] = await Promise.all([
    getUserById(params),
    getCurrentUser()
  ]);

  if (!user) {
    return (
      <ClientOnly>
        <EmptyState title="Utilisateur introuvable" subtitle="Cet utilisateur n'existe pas ou a été supprimé." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <UserClient user={user} currentUser={currentUser} />
    </ClientOnly>
  );
}
