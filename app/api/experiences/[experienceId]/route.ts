import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { EXCHANGE_RATES } from "@/hook/usePrice";

interface IParams {
  experienceId?: string;
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

  const { experienceId } = params;

  if (!experienceId || typeof experienceId !== "string") {
    throw new Error("Invalid Id");
  }

  const experience = await prisma.experience.deleteMany({
    where: {
      id: experienceId,
      hostId: currentUser.id,
    },
  });

  return NextResponse.json(experience);
}

export async function GET(
  request: Request,
  props: { params: Promise<IParams> }
) {
  const params = await props.params;
  const { experienceId } = params;

  if (!experienceId || typeof experienceId !== "string") {
    throw new Error("Invalid Id");
  }

  const experience = await prisma.experience.findUnique({
    where: {
      id: experienceId,
    },
    include: {
      location: true,
    }
  });

  if (!experience) return NextResponse.error();

  return NextResponse.json(experience);
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

  const { experienceId } = params;

  if (!experienceId || typeof experienceId !== "string") {
    throw new Error("Invalid Id");
  }

  const body = await request.json();
  const {
    title,
    description,
    images,
    category,
    guestCount,
    duration,
    price,
    amenities,
    cancellationPolicy,
    currency
  } = body;

  const experience = await prisma.experience.update({
    where: {
      id: experienceId,
      hostId: currentUser.id,
    },
    data: {
      title,
      description,
      images,
      category,
      maxGroupSize: guestCount,
      durationMinutes: duration,
      pricePerPerson: currency && currency !== "EUR" ? Math.round(parseInt(price, 10) / EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]) : parseInt(price, 10),
      amenities,
      cancellationPolicy
    },
  });

  return NextResponse.json(experience);
}
