import { PrismaClient } from "@prisma/client";
import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();
const driver = neo4j.driver(
  process.env.NEO4J_URI || "",
  neo4j.auth.basic(process.env.NEO4J_USER || "", process.env.NEO4J_PASSWORD || "")
);

async function syncData() {
  const session = driver.session();
  console.log("Starting sync from MongoDB to Neo4j...");

  try {
    // 1. Sync Users
    const users = await prisma.user.findMany();
    console.log(`Syncing ${users.length} users...`);
    for (const user of users) {
      await session.run(
        `MERGE (u:User {id: $id})
         SET u.name = $name`,
        { id: user.id, name: user.firstname || "User" }
      );
    }

    // 2. Sync Listings
    const listings = await prisma.listing.findMany();
    console.log(`Syncing ${listings.length} listings...`);
    for (const listing of listings) {
      await session.run(
        `MERGE (l:Listing {id: $id})
         SET l.title = $title, l.type = $type`,
        { id: listing.id, title: listing.title, type: listing.type || "Unknown" }
      );
    }

    // 3. Sync Favorites (User -[:FAVORITED]-> Listing)
    console.log("Syncing favorites...");
    for (const user of users) {
      if (user.savedListingIds && user.savedListingIds.length > 0) {
        for (const listingId of user.savedListingIds) {
          await session.run(
            `MATCH (u:User {id: $userId})
             MATCH (l:Listing {id: $listingId})
             MERGE (u)-[:FAVORITED]->(l)`,
            { userId: user.id, listingId }
          );
        }
      }
    }

    // 4. Sync Reservations (User -[:BOOKED]-> Listing)
    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] }
      }
    });
    console.log(`Syncing ${reservations.length} reservations...`);
    for (const res of reservations) {
      if (res.listingId) {
        await session.run(
          `MATCH (u:User {id: $userId})
           MATCH (l:Listing {id: $listingId})
           MERGE (u)-[:BOOKED]->(l)`,
          { userId: res.userId, listingId: res.listingId }
        );
      }
    }

    console.log("✅ Neo4j Sync Complete!");
  } catch (error) {
    console.error("Error syncing to Neo4j:", error);
  } finally {
    await session.close();
    await driver.close();
    await prisma.$disconnect();
  }
}

syncData();
