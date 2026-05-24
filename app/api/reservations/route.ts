import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

/**
 * Normalise une date à minuit UTC pour correspondre exactement
 * aux valeurs stockées dans ListingAvailability.
 */
function toMidnightUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();

  const {
    listingId,
    experienceId,
    type = "LISTING",
    startDate,
    endDate,
    totalPrice,
    adults,
    children,
    infants,
    pets,
  } = body;

  if (!startDate || !totalPrice) {
    return new NextResponse("Missing data", { status: 400 });
  }

  // ─────────────────────────────────────────────────────────────────
  // EXPÉRIENCE — Confirmation immédiate + décrémentation des places
  // ─────────────────────────────────────────────────────────────────
  if (type === "EXPERIENCE") {
    if (!experienceId) return new NextResponse("Missing experienceId", { status: 400 });

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { user: true },
    });

    if (!experience) return new NextResponse("Experience not found", { status: 404 });

    const dateTime = new Date(startDate);
    const guests = adults || 1;

    // Trouver ou créer la session
    let session = await prisma.experienceSession.findFirst({
      where: { experienceId, dateTime, isCancelled: false },
    });

    if (!session) {
      session = await prisma.experienceSession.create({
        data: {
          experienceId,
          dateTime,
          spotsTotal: experience.maxGroupSize,
          spotsLeft: experience.maxGroupSize,
        },
      });
    }

    if (session.spotsLeft < guests) {
      return new NextResponse("Not enough spots available", { status: 400 });
    }

    // Transaction atomique : créer la réservation CONFIRMED + décrémenter les places
    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: {
          userId: currentUser.id,
          sessionId: session.id,
          type: "EXPERIENCE",
          totalPrice,
          pricePerPerson: experience.pricePerPerson,
          adults: guests,
          status: "CONFIRMED", // ← directement confirmé
          cancellationPolicy: experience.cancellationPolicy,
          experienceSnapshot: {
            experienceId: experience.id,
            title: experience.title,
            category: experience.category,
            city: experience.location.city,
            country: experience.location.country,
            image: experience.images[0],
          },
          hostSnapshot: {
            hostId: experience.user.id,
            firstname: experience.user.firstname,
            lastname: experience.user.lastname,
            image: experience.user.image,
          },
        },
      }),
      prisma.experienceSession.update({
        where: { id: session.id },
        data: {
          spotsLeft: { decrement: guests },
        },
      }),
    ]);

    return NextResponse.json(reservation);
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGEMENT — Confirmation immédiate + blocage des dates
  // ─────────────────────────────────────────────────────────────────
  if (!listingId || !endDate) {
    return new NextResponse("Missing listing data", { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { user: true },
  });

  if (!listing) {
    return new NextResponse("Listing not found", { status: 404 });
  }

  const checkIn  = toMidnightUTC(new Date(startDate));
  const checkOut = toMidnightUTC(new Date(endDate));
  const nights   = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Créer la réservation directement CONFIRMED
  const reservation = await prisma.reservation.create({
    data: {
      userId: currentUser.id,
      listingId,
      type: "LISTING",
      checkIn,
      checkOut,
      nights,
      totalPrice,
      pricePerNight: listing.pricePerNight,
      adults: adults || 1,
      children: children || 0,
      infants: infants || 0,
      pets: pets || 0,
      status: "CONFIRMED", // ← directement confirmé
      cancellationPolicy: listing.cancellationPolicy,
      listingSnapshot: {
        listingId: listing.id,
        title: listing.title,
        type: listing.type,
        city: listing.location.city,
        country: listing.location.country,
        image: listing.images[0],
        lat: listing.location.lat,
        lng: listing.location.lng,
      },
      hostSnapshot: {
        hostId: listing.user.id,
        firstname: listing.user.firstname,
        lastname: listing.user.lastname,
        image: listing.user.image,
      },
    },
  });

  // Bloquer les dates immédiatement en parallèle
  const datesToBlock: Date[] = [];
  const current = new Date(checkIn);
  while (current < checkOut) {
    datesToBlock.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  await Promise.all(
    datesToBlock.map((date) =>
      prisma.listingAvailability.upsert({
        where: {
          listingId_date: { listingId, date },
        },
        update: { isAvailable: false },
        create: { listingId, date, isAvailable: false },
      })
    )
  );

  return NextResponse.json(reservation);
}
