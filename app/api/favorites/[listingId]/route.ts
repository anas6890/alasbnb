import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import neo4jDriver from "@/lib/neo4j";

interface IPrisma {
  listingId?: string;
}

export async function POST(request: Request, props: { params: Promise<IPrisma> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { listingId } = params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  if (type === "EXPERIENCE") {
    let savedExperienceIds = [...(currentUser.savedExperienceIds || [])];
    if (!savedExperienceIds.includes(listingId)) {
        savedExperienceIds.push(listingId);
    }

    const user = await prisma.user.update({
        where: { id: currentUser.id },
        data: { savedExperienceIds },
    });
    return NextResponse.json(user);
  } else {
    let savedListingIds = [...(currentUser.savedListingIds || [])];
    if (!savedListingIds.includes(listingId)) {
        savedListingIds.push(listingId);
    }

    const user = await prisma.user.update({
        where: { id: currentUser.id },
        data: { savedListingIds },
    });

    // Neo4j integration
    try {
      const session = neo4jDriver.session();
      await session.run(
        `MERGE (u:User {id: $userId})
         MERGE (l:Listing {id: $listingId})
         MERGE (u)-[:FAVORITED]->(l)`,
        { userId: currentUser.id, listingId }
      );
      await session.close();
    } catch (error) {
      console.error("Neo4j error on favorite:", error);
    }

    return NextResponse.json(user);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<IPrisma> }
) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { listingId } = params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  if (type === "EXPERIENCE") {
    let savedExperienceIds = [...(currentUser.savedExperienceIds || [])];
    savedExperienceIds = savedExperienceIds.filter((id) => id !== listingId);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { savedExperienceIds },
    });
    return NextResponse.json(user);
  } else {
    let savedListingIds = [...(currentUser.savedListingIds || [])];
    savedListingIds = savedListingIds.filter((id) => id !== listingId);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { savedListingIds },
    });

    // Neo4j integration
    try {
      const session = neo4jDriver.session();
      await session.run(
        `MATCH (u:User {id: $userId})-[r:FAVORITED]->(l:Listing {id: $listingId})
         DELETE r`,
        { userId: currentUser.id, listingId }
      );
      await session.close();
    } catch (error) {
      console.error("Neo4j error on unfavorite:", error);
    }

    return NextResponse.json(user);
  }
}
