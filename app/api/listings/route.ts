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
    images,
    category,
    roomCount,
    bedCount,
    bathroomCount,
    guestCount,
    location,
    city,
    address,
    price,
    dateRange,
    amenities,
  } = body;

  const availabilities = [];
  if (dateRange && dateRange.startDate && dateRange.endDate) {
    let current = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    while (current <= end) {
      availabilities.push({
        date: new Date(current),
        isAvailable: true,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  const listen = await prisma.listing.create({
    data: {
      title,
      description,
      images: images && images.length > 0 ? images : [imageSrc],
      type: category,
      bedrooms: roomCount,
      bathrooms: bathroomCount,
      maxGuests: guestCount,
      beds: bedCount || roomCount || 1,
      amenities: amenities || [],
      status: "PUBLISHED",
      location: {
        set: {
          address: address || location.label,
          city: city || location.label.split(" - ")[0],
          country: location.label.includes(" - ") ? location.label.split(" - ")[1] : location.label,
          lat: location.latlng[0],
          lng: location.latlng[1],
        },
      },
      pricePerNight: parseInt(price, 10),
      hostId: currentUser.id,
      availabilities: {
        create: availabilities,
      },
    },
  });

  return NextResponse.json(listen);
}
