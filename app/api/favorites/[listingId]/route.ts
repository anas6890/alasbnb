import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

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
    return NextResponse.json(user);
  }
}
