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
      const parts = locationValue.split(" - ").map((item) => item.trim());
      if (parts.length === 2) {
        const [city, country] = parts;
        query.location = {
          is: {
            city,
            country
          }
        };
      } else {
        query.OR = [
          { location: { is: { city: locationValue } } },
          { location: { is: { country: locationValue } } }
        ];
      }
    }

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            status: { notIn: ["PENDING", "CANCELLED"] },
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const listing = await prisma.listing.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        availabilities: {
          where: {
            isAvailable: true,
            date: {
              gte: today,
            },
          },
          orderBy: {
            date: "asc",
          },
          take: 30,
        },
        reviews: {
          select: {
            avgRating: true,
          },
        },
      },
    });

    const safeListings = listing.map((list) => {
      const dynamicAvgRating = list.reviews && list.reviews.length > 0
        ? list.reviews.reduce((acc, review) => acc + review.avgRating, 0) / list.reviews.length
        : 0;

      return {
        ...list,
        avgRating: dynamicAvgRating,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        deletedAt: list.deletedAt?.toISOString() || null,
        availabilities: list.availabilities?.map((availability) => ({
          ...availability,
          date: availability.date.toISOString(),
        })),
      };
    });

    // Sort by avgRating (descending), then by createdAt (newest first)
    safeListings.sort((a, b) => {
      if (b.avgRating !== a.avgRating) {
        return b.avgRating - a.avgRating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return safeListings;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
