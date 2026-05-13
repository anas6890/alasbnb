import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { reservationId, rating, comment } = body;

  if (!reservationId || !rating || !comment) {
    return NextResponse.error();
  }

  // Check if reservation belongs to user
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.userId !== currentUser.id) {
    return NextResponse.error();
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(rating, 10),
      comment,
      authorId: currentUser.id,
      reservationId,
    },
  });

  return NextResponse.json(review);
}
