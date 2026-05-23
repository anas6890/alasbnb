import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { CancellationPolicy, ReservationStatus } from "@prisma/client";

interface IParams {
  reservationId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<IParams> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const resolvedParams = await params;
  const { reservationId } = resolvedParams;

  if (!reservationId || typeof reservationId !== "string") {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  const body = await request.json();
  const { reason } = body;

  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId
    },
    include: {
      listing: true,
      session: {
        include: { experience: true }
      }
    }
  });

  if (!reservation) {
    return new NextResponse("Reservation not found", { status: 404 });
  }

  const isGuest = reservation.userId === currentUser.id;
  const isHost = reservation.listing?.hostId === currentUser.id || reservation.session?.experience?.hostId === currentUser.id;

  if (!isGuest && !isHost) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Calculate refund
  let refundAmount = 0;
  const now = new Date();
  const checkInDate = reservation.type === "LISTING" ? reservation.checkIn : reservation.session?.dateTime;

  if (isHost) {
    // Host cancels: 100% refund
    refundAmount = reservation.totalPrice;
  } else if (checkInDate) {
    // Guest cancels: depends on policy
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const policy = reservation.cancellationPolicy;

    if (policy === CancellationPolicy.FLEXIBLE) {
      if (hoursUntilCheckIn >= 24) refundAmount = reservation.totalPrice;
      else refundAmount = 0;
    } else if (policy === CancellationPolicy.MODERATE) {
      if (hoursUntilCheckIn >= 120) refundAmount = reservation.totalPrice; // 5 days
      else refundAmount = 0;
    } else if (policy === CancellationPolicy.STRICT) {
      if (hoursUntilCheckIn >= 168) refundAmount = Math.floor(reservation.totalPrice * 0.5); // 7 days, 50%
      else refundAmount = 0;
    } else if (policy === CancellationPolicy.NON_REFUNDABLE) {
      refundAmount = 0;
    }
  }

  // Update reservation
  const updatedReservation = await prisma.reservation.update({
    where: {
      id: reservationId
    },
    data: {
      status: ReservationStatus.CANCELLED,
      cancelledAt: now,
      cancelReason: reason || "No reason provided",
      cancelledBy: currentUser.id,
      payment: reservation.payment ? {
        ...reservation.payment,
        status: "refunded",
        refundAmount: refundAmount,
        refundedAt: now
      } : undefined
    }
  });

  // Re-open calendar if listing
  if (reservation.type === "LISTING" && reservation.listingId && reservation.checkIn && reservation.checkOut) {
    for (let d = new Date(reservation.checkIn); d < reservation.checkOut; d.setDate(d.getDate() + 1)) {
      const dateToUpdate = new Date(d);
      dateToUpdate.setUTCHours(0, 0, 0, 0);
      
      await prisma.listingAvailability.updateMany({
        where: {
          listingId: reservation.listingId,
          date: dateToUpdate
        },
        data: {
          isAvailable: true
        }
      });
    }
  }

  // If experience session, increase spotsLeft
  if (reservation.type === "EXPERIENCE" && reservation.sessionId) {
    await prisma.experienceSession.update({
      where: { id: reservation.sessionId },
      data: {
        spotsLeft: { increment: reservation.adults + reservation.children }
      }
    });
  }

  return NextResponse.json(updatedReservation);
}
