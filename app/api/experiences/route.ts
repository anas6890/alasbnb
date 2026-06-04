import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { EXCHANGE_RATES } from "@/hook/usePrice";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    title,
    description,
    images,
    category,
    guestCount,
    location,
    city,
    address,
    price,
    duration,
    cancellationPolicy,
    currency,
  } = body;

  const experience = await prisma.experience.create({
    data: {
      title,
      description,
      images: images || [],
      category: category,
      durationMinutes: parseInt(duration, 10) || 60,
      pricePerPerson: currency && currency !== "EUR" ? Math.round(parseInt(price, 10) / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]) : parseInt(price, 10),
      maxGroupSize: parseInt(guestCount, 10),
      status: "PUBLISHED",
      cancellationPolicy: cancellationPolicy || "FLEXIBLE",
      location: {
        set: {
          address: address || location.label,
          city: city || location.label.split(" - ")[0],
          country: location.label.includes(" - ") ? location.label.split(" - ")[1] : location.label,
          lat: location.latlng[0],
          lng: location.latlng[1],
        },
      },
      hostId: currentUser.id,
    },
  });

  return NextResponse.json(experience);
}
