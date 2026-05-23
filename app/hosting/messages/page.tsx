import EmptyState from "@/components/EmptyState";
import ClientOnly from "@/components/ClientOnly";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import MessagesClient from "@/app/messages/MessagesClient";

const HostMessagesPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter" />
      </ClientOnly>
    );
  }

  const rawConversations = await prisma.conversation.findMany({
    where: {
      hostId: currentUser.id
    },
    include: {
      guest: true,
      host: true,
      listing: true,
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  const safeConversations = rawConversations.map(conv => ({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    guest: {
        ...conv.guest,
        createdAt: conv.guest.createdAt.toISOString(),
        updatedAt: conv.guest.updatedAt.toISOString(),
        deletedAt: conv.guest.deletedAt?.toISOString() || null,
        emailVerified: conv.guest.emailVerified?.toISOString() || null,
    },
    host: {
        ...conv.host,
        createdAt: conv.host.createdAt.toISOString(),
        updatedAt: conv.host.updatedAt.toISOString(),
        deletedAt: conv.host.deletedAt?.toISOString() || null,
        emailVerified: conv.host.emailVerified?.toISOString() || null,
    },
    listing: conv.listing ? {
        ...conv.listing,
        createdAt: conv.listing.createdAt.toISOString(),
        updatedAt: conv.listing.updatedAt.toISOString(),
        deletedAt: conv.listing.deletedAt?.toISOString() || null,
    } : null
  }));

  return (
    <ClientOnly>
      <MessagesClient conversations={safeConversations} currentUser={currentUser} isHostMode={true} />
    </ClientOnly>
  );
};

export default HostMessagesPage;
