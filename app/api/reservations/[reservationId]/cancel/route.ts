import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { CancellationPolicy, ReservationStatus } from "@prisma/client";

interface IParams {
  reservationId?: string;
}

/**
 * Normalise une date à minuit UTC pour correspondre exactement
 * aux valeurs stockées dans ListingAvailability.
 */
function toMidnightUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
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
    where: { id: reservationId },
    include: {
      listing: true,
      session: {
        include: { experience: true },
      },
    },
  });

  if (!reservation) {
    return new NextResponse("Reservation not found", { status: 404 });
  }

  // Vérification des droits — voyageur OU hôte
  const isGuest = reservation.userId === currentUser.id;
  const isHost =
    reservation.listing?.hostId === currentUser.id ||
    reservation.session?.experience?.hostId === currentUser.id;

  if (!isGuest && !isHost) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Seules les réservations CONFIRMED peuvent être annulées
  if (reservation.status !== "CONFIRMED") {
    return new NextResponse("Only confirmed reservations can be cancelled", { status: 400 });
  }

  // ── Calcul du remboursement ────────────────────────────────────────
  let refundAmount = 0;
  const now = new Date();
  const checkInDate =
    reservation.type === "LISTING"
      ? reservation.checkIn
      : reservation.session?.dateTime;

  if (isHost) {
    // L'hôte annule → remboursement intégral au voyageur
    refundAmount = reservation.totalPrice;
  } else if (checkInDate) {
    // Le voyageur annule → selon la politique
    const hoursUntilCheckIn =
      (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const policy = reservation.cancellationPolicy;

    if (policy === CancellationPolicy.FLEXIBLE) {
      refundAmount = hoursUntilCheckIn >= 24 ? reservation.totalPrice : 0;
    } else if (policy === CancellationPolicy.MODERATE) {
      refundAmount = hoursUntilCheckIn >= 120 ? reservation.totalPrice : 0; // 5 jours
    } else if (policy === CancellationPolicy.STRICT) {
      refundAmount =
        hoursUntilCheckIn >= 168
          ? Math.floor(reservation.totalPrice * 0.5)
          : 0; // 7 jours → 50%
    } else if (policy === CancellationPolicy.NON_REFUNDABLE) {
      refundAmount = 0;
    }
  }

  // ── Mettre à jour la réservation ──────────────────────────────────
  const cancelReason = reason || (isHost ? "Annulation par l'hôte" : "Annulation par le voyageur");

  const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: ReservationStatus.CANCELLED,
      cancelledAt: now,
      cancelReason,
      cancelledBy: currentUser.id,
      payment: reservation.payment
        ? {
            ...reservation.payment,
            status: "refunded",
            refundAmount,
            refundedAt: now,
          }
        : undefined,
    },
  });

  if (isHost) {
    const hostName = `${currentUser.firstname} ${currentUser.lastname}`;
    const notification = await prisma.notification.create({
      data: {
        userId: reservation.userId,
        type: "BOOKING_CANCELLED",
        title: `❌ Réservation annulée`,
        body: `${hostName} a annulé votre réservation pour ${reservation.listing?.title || reservation.session?.experience?.title}.`,
        link: `/trips`,
      },
    });

    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`user-${reservation.userId}`, "notifications:new", {
      id: notification.id,
      type: "BOOKING_CANCELLED",
      title: notification.title,
      body: notification.body,
      link: notification.link,
      createdAt: notification.createdAt,
      senderName: hostName,
      senderImage: currentUser.image,
    });
  }

  // ── Libérer le calendrier si logement ────────────────────────────
  if (
    reservation.type === "LISTING" &&
    reservation.listingId &&
    reservation.checkIn &&
    reservation.checkOut
  ) {
    const startDate = toMidnightUTC(new Date(reservation.checkIn));
    const endDate   = toMidnightUTC(new Date(reservation.checkOut));

    const datesToFree: Date[] = [];
    const current = new Date(startDate);
    while (current < endDate) {
      datesToFree.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    await Promise.all(
      datesToFree.map((date) =>
        prisma.listingAvailability.updateMany({
          where: { listingId: reservation.listingId!, date },
          data: { isAvailable: true },
        })
      )
    );
  }

  // ── Remettre les places disponibles si expérience ────────────────
  if (reservation.type === "EXPERIENCE" && reservation.sessionId) {
    await prisma.experienceSession.update({
      where: { id: reservation.sessionId },
      data: {
        spotsLeft: { increment: reservation.adults + (reservation.children || 0) },
      },
    });
  }

  return NextResponse.json(updatedReservation);
}
