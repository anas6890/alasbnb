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

    const safeFavorite = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    return safeFavorite;
  } catch (error: any) {
    throw new Error(error.message);
  }
});

export default getFavoriteListings;
