import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { EXCHANGE_RATES } from "@/hook/usePrice";

interface IParams {
  listingId?: string;
}

export async function DELETE(
  request: Request,
  props: { params: Promise<IParams> }
) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid Id");
  }

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      hostId: currentUser.id,
    },
  });

  return NextResponse.json(listing);
}

export async function GET(
  request: Request,
  props: { params: Promise<IParams> }
) {
  const params = await props.params;
  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid Id");
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      location: true,
    }
  });

  if (!listing) return NextResponse.error();

  return NextResponse.json(listing);
}

export async function PUT(
  request: Request,
  props: { params: Promise<IParams> }
) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid Id");
  }

  const body = await request.json();
  const {
    title,
    description,
    images,
    category,
    roomCount,
    bathroomCount,
    guestCount,
    bedCount,
    price,
    amenities,
    checkInTime,
    checkOutTime,
    petsAllowed,
    smokingAllowed,
    partiesAllowed,
    cancellationPolicy,
    currency
  } = body;

  const listing = await prisma.listing.update({
    where: {
      id: listingId,
      hostId: currentUser.id,
    },
    data: {
      title,
      description,
      images,
      category,
      bedrooms: roomCount,
      bathrooms: bathroomCount,
      maxGuests: guestCount,
      beds: bedCount,
      pricePerNight: currency && currency !== "EUR" ? Math.round(parseInt(price, 10) / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]) : parseInt(price, 10),
      amenities,
      checkInTime,
      checkOutTime,
      petsAllowed,
      smokingAllowed,
      partiesAllowed,
      cancellationPolicy
    },
  });

  return NextResponse.json(listing);
}
