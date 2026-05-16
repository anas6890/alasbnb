import prisma from "@/lib/prismadb";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getListings(params: IListingsParams) {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      locationValue,
      startDate,
      endDate,
      category,
    } = params;

    let query: any = {};

    if (userId) {
      query.hostId = userId;
    }

    if (category) {
      query.type = category;
    }

    if (roomCount) {
      query.bedrooms = {
        gte: +roomCount,
      };
    }

    if (guestCount) {
      query.maxGuests = {
        gte: +guestCount,
      };
    }

    if (bathroomCount) {
      query.bathrooms = {
        gte: +bathroomCount,
      };
    }

    if (locationValue) {
      const parts = locationValue.split(" - ");
      if (parts.length === 2) {
        query.OR = [
          { city: { contains: parts[0], mode: "insensitive" } },
          { country: { contains: parts[1], mode: "insensitive" } }
        ];
      } else {
        query.OR = [
          { city: { contains: locationValue, mode: "insensitive" } },
          { country: { contains: locationValue, mode: "insensitive" } }
        ];
      }
    }

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                checkOut: { gte: startDate },
                checkIn: { lte: startDate },
              },
              {
                checkIn: { lte: endDate },
                checkOut: { gte: endDate },
              },
            ],
          },
        },
      };
    }

    const listing = await prisma.listing.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeListings = listing.map((list) => ({
      ...list,
      createdAt: list.createdAt.toISOString(),
    }));

    return safeListings;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
