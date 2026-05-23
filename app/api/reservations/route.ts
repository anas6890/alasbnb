import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();

  const { listingId, experienceId, type = "LISTING", startDate, endDate, totalPrice, adults, children, infants, pets } = body;

  if (!startDate || !totalPrice) {
    return new NextResponse("Missing data", { status: 400 });
  }

  if (type === "EXPERIENCE") {
    if (!experienceId) return new NextResponse("Missing experienceId", { status: 400 });

    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { user: true }
    });

    if (!experience) return new NextResponse("Experience not found", { status: 404 });

    const dateTime = new Date(startDate);
    const guests = adults || 1;

    // Find or create session
    let session = await prisma.experienceSession.findFirst({
      where: {
        experienceId,
        dateTime,
        isCancelled: false
      }
    });

    if (!session) {
      session = await prisma.experienceSession.create({
        data: {
          experienceId,
          dateTime,
          spotsTotal: experience.maxGroupSize,
          spotsLeft: experience.maxGroupSize
        }
      });
    }

    if (session.spotsLeft < guests) {
      return new NextResponse("Not enough spots available", { status: 400 });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        sessionId: session.id,
        type: "EXPERIENCE",
        totalPrice,
        pricePerPerson: experience.pricePerPerson,
        adults: guests,
        status: "CONFIRMED",
        cancellationPolicy: experience.cancellationPolicy,
        experienceSnapshot: {
          experienceId: experience.id,
          title: experience.title,
          category: experience.category,
          city: experience.location.city,
          country: experience.location.country,
          image: experience.images[0]
        },
        hostSnapshot: {
          hostId: experience.user.id,
          firstname: experience.user.firstname,
          lastname: experience.user.lastname,
          image: experience.user.image
        }
      }
    });

    return NextResponse.json(reservation);
  }

  // LISTING logic
  if (!listingId || !endDate) {
    return new NextResponse("Missing listing data", { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ 
    where: { id: listingId },
    include: { user: true }
  });

  if (!listing) {
    return new NextResponse("Listing not found", { status: 404 });
  }

  const checkIn = new Date(startDate);
  const checkOut = new Date(endDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Create the reservation with snapshots as defined in Prisma schema
  const reservation = await prisma.reservation.create({
    data: {
      userId: currentUser.id,
      listingId: listingId,
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
      status: "CONFIRMED",
      cancellationPolicy: listing.cancellationPolicy,
      listingSnapshot: {
        listingId: listing.id,
        title: listing.title,
        type: listing.type,
        city: listing.location.city,
        country: listing.location.country,
        image: listing.images[0],
        lat: listing.location.lat,
        lng: listing.location.lng
      },
      hostSnapshot: {
        hostId: listing.user.id,
        firstname: listing.user.firstname,
        lastname: listing.user.lastname,
        image: listing.user.image
      }
    }
  });

  // Block calendar dates for the reservation
  for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
    const dateToUpdate = new Date(d);
    dateToUpdate.setUTCHours(0, 0, 0, 0);

    await prisma.listingAvailability.upsert({
      where: {
        listingId_date: {
          listingId: listingId,
          date: dateToUpdate,
        },
      },
      update: {
        isAvailable: false,
      },
      create: {
        listingId: listingId,
        date: dateToUpdate,
        isAvailable: false,
      },
    });
  }

  return NextResponse.json(reservation);
}
