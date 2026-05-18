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
      query.listing = { hostId: authorId };
    }

    const reservations = await prisma.reservation.findMany({
      where: query,
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeReservations = reservations.map((reservation) => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      checkIn: reservation.checkIn?.toISOString() || null,
      checkOut: reservation.checkOut?.toISOString() || null,
      listing: reservation.listing
        ? {
            ...reservation.listing,
            createdAt: reservation.listing.createdAt.toISOString(),
          }
        : null,
    }));

    return safeReservations;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
