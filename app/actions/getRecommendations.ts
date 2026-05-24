import prisma from "@/lib/prismadb";
import neo4jDriver from "@/lib/neo4j";
import { safeListing } from "@/types";

export interface IRecommendationParams {
  listingId: string;
  limit?: number;
}

export default async function getRecommendations(
  params: IRecommendationParams
): Promise<safeListing[]> {
  try {
    const { listingId, limit = 4 } = params;

    const session = neo4jDriver.session();
    
    // Cypher query for Collaborative Filtering:
    // Users who FAVORITED or BOOKED this listing also FAVORITED or BOOKED other listings.
    const result = await session.run(
      `
      MATCH (current:Listing {id: $listingId})<-[:FAVORITED|BOOKED]-(u:User)-[:FAVORITED|BOOKED]->(rec:Listing)
      WHERE rec.id <> current.id
      RETURN rec.id as recommendedId, count(*) as frequency
      ORDER BY frequency DESC
      LIMIT toInteger($limit)
      `,
      { listingId, limit }
    );
    
    await session.close();

    const recommendedIds = result.records.map((record) => record.get("recommendedId"));

    if (recommendedIds.length === 0) {
      return [];
    }

    // Fetch the actual listings from Prisma
    const listings = await prisma.listing.findMany({
      where: {
        id: { in: recommendedIds },
      },
      include: {
        reviews: {
          select: {
            avgRating: true,
          },
        },
      },
    });

    // Format safe listings and map them back to the ordered result from Neo4j
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

    // Sort to match the Neo4j recommendation order
    return safeListings.sort((a, b) => {
      return recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id);
    });

  } catch (error: any) {
    console.error("Neo4j Recommendation Error:", error);
    return [];
  }
}
