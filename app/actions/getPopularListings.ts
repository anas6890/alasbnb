import prisma from "@/lib/prismadb";
import neo4jDriver from "@/lib/neo4j";
import { safeListing } from "@/types";

export interface IPopularParams {
  limit?: number;
}

export default async function getPopularListings(
  params: IPopularParams = {}
): Promise<safeListing[]> {
  try {
    const { limit = 20 } = params;

    const session = neo4jDriver.session();
    
    // Cypher query to calculate popularity score
    // Score = (Number of bookings * 3) + (Number of favorites)
    const result = await session.run(
      `
      MATCH (l:Listing)
      OPTIONAL MATCH ()-[b:BOOKED]->(l)
      WITH l, count(b) AS bookingsCount
      OPTIONAL MATCH ()-[f:FAVORITED]->(l)
      WITH l, bookingsCount, count(f) AS favoritesCount
      WITH l.id AS listingId, (bookingsCount * 3) + favoritesCount AS score
      WHERE score > 0
      RETURN listingId, score
      ORDER BY score DESC
      LIMIT 500
      `
    );
    
    await session.close();

    const popularIds = result.records.map((record) => record.get("listingId"));

    if (popularIds.length === 0) {
      return [];
    }

    // Fetch the actual listings from Prisma
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: popularIds },
      },
      include: {
        reviews: {
          select: {
            avgRating: true,
          },
        },
      },
    });

    // Format safe listings
    const safeListings = listings.map((listing) => {
      const dynamicAvgRating =
        listing.reviews && listing.reviews.length > 0
          ? listing.reviews.reduce((acc, review) => acc + review.avgRating, 0) /
            listing.reviews.length
          : 0;

      return {
        ...listing,
        avgRating: dynamicAvgRating,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        deletedAt: listing.deletedAt?.toISOString() || null,
      };
    });

    // Sort to match the Neo4j descending score order exactly, then limit to requested count
    return safeListings.sort((a, b) => {
      return popularIds.indexOf(a.id) - popularIds.indexOf(b.id);
    }).slice(0, limit);

  } catch (error: any) {
    console.error("Neo4j Popular Listings Error:", error);
    return [];
  }
}
