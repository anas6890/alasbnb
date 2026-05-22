import prisma from "@/lib/prismadb";
import getCurrentUser from "./getCurrentUser";
import { cache } from "react";

const getFavoriteListings = cache(async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: [...(currentUser.savedListingIds || [])],
        },
      },
    });

    const favoriteExperiences = await prisma.experience.findMany({
      where: {
        id: {
          in: [...(currentUser.savedExperienceIds || [])],
        },
      },
    });

    const safeListings = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    const safeExperiences = favoriteExperiences.map((exp) => ({
      ...exp,
      createdAt: exp.createdAt.toString(),
    }));

    return { listings: safeListings, experiences: safeExperiences };
  } catch (error: any) {
    throw new Error(error.message);
  }
});

export default getFavoriteListings;
