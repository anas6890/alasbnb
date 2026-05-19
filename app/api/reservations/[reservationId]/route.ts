import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

interface IParams {
  reservationId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = params;

  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid Id");
  }

  const reservation = await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      OR: [{ userId: currentUser.id }, { listing: { hostId: currentUser.id } }],
    },
  });

  return NextResponse.json(reservation);
}

export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { reservationId } = params;

  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid Id");
  }

  const body = await request.json();
  const { status } = body;

  const reservationToUpdate = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: true }
  });

  if (!reservationToUpdate) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (reservationToUpdate.listing?.hostId !== currentUser.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status }
  });

  return NextResponse.json(updatedReservation);
}
