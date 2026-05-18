import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();

  const { listingId, startDate, endDate, totalPrice } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.error();
  }

  const pricePerNight = listing.pricePerNight;

  const listenAndReservation = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      reservations: {
        create: {
          userId: currentUser.id,
          checkIn: new Date(startDate),
          checkOut: new Date(endDate),
          totalPrice: totalPrice,
          pricePerNight: pricePerNight,
          type: "LISTING",
        },
      },
    },
  });

  return NextResponse.json(listenAndReservation);
}
