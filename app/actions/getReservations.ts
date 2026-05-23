import prisma from "@/lib/prismadb";

interface IParams {
  listingId?: string;
  userId?: string;
  authorId?: string;
}

export default async function getReservation(params: IParams) {
  try {
    const { listingId, userId, authorId } = params;

    const query: any = {};

    if (listingId) {
      query.listingId = listingId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (authorId) {
      query.OR = [
        { listing: { hostId: authorId } },
        { session: { experience: { hostId: authorId } } }
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
        session: {
          include: {
            experience: true
          }
        },
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeReservations = reservations.map((reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
      checkIn: reservation.checkIn?.toISOString() || null,
      checkOut: reservation.checkOut?.toISOString() || null,
      cancelledAt: reservation.cancelledAt?.toISOString() || null,
      listing: reservation.listing
        ? {
            ...reservation.listing,
            createdAt: reservation.listing.createdAt.toISOString(),
            updatedAt: reservation.listing.updatedAt.toISOString(),
            deletedAt: reservation.listing.deletedAt?.toISOString() || null,
          }
        : null,
      session: reservation.session
        ? {
            ...reservation.session,
            dateTime: reservation.session.dateTime.toISOString(),
            experience: {
              ...reservation.session.experience,
              createdAt: reservation.session.experience.createdAt.toISOString(),
            }
          }
        : null,
      user: reservation.user
        ? {
            ...reservation.user,
            createdAt: reservation.user.createdAt.toISOString(),
            updatedAt: reservation.user.updatedAt.toISOString(),
            deletedAt: reservation.user.deletedAt?.toISOString() || null,
            emailVerified: reservation.user.emailVerified?.toISOString() || null,
          }
        : null,
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
