import prisma from "@/lib/prismadb";

export interface IExperiencesParams {
  userId?: string;
  guestCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export default async function getExperiences(searchParams: IExperiencesParams = {}) {
  try {
    if (!(prisma as any).experience) {
      console.error("Prisma experience model is missing! Try restarting your dev server.");
      return [];
    }

    const { userId, guestCount, startDate, endDate, locationValue, category } = searchParams;

    const query: any = {};

    if (userId) {
      query.hostId = userId;
    }

    if (category) {
      query.category = category;
    }

    if (guestCount) {
      query.maxGroupSize = {
        gte: +guestCount,
      };
    }

    if (locationValue) {
      const [cityPart, countryPart] = locationValue.split(" - ").map((item) => item.trim());
      const city = countryPart ? cityPart : null;
      const country = countryPart || locationValue;

      const locationFilters: any[] = [{ location: { is: { country } } }];
      if (city) {
        locationFilters.unshift({ location: { is: { city } } });
      }

      query.OR = locationFilters;
    }

    if (startDate && endDate) {
      query.sessions = {
        some: {
          isCancelled: false,
          spotsLeft: { gt: 0 },
          dateTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      };
    }

    const experiences = await (prisma as any).experience.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
    });

    return experiences;
  } catch (error: any) {
    console.error("Error in getExperiences:", error);
    return [];
  }
}
