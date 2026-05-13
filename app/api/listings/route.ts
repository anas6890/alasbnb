import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    title,
    description,
    imageSrc,
    category,
    roomCount,
    bathroomCount,
    guestCount,
    location,
    city,
    address,
    price,
  } = body;

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      images: [imageSrc],
      type: category,
      bedrooms: roomCount,
      bathrooms: bathroomCount,
      maxGuests: guestCount,
      beds: roomCount, // default
      address: address || location.label,
      city: city || location.region,
      country: location.label || location.value,
      lat: location.latlng?.[0] || 0,
      lng: location.latlng?.[1] || 0,
      pricePerNight: parseInt(price, 10),
      hostId: currentUser.id,
    },
  });

  return NextResponse.json(listen);
}
