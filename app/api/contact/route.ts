import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: Request
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, hostId, content } = body;

    if (!listingId || !hostId || !content) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Récupérer le listing avec le snapshot
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true }
    });

    if (!listing) {
      return NextResponse.json({ error: "Logement introuvable" }, { status: 404 });
    }

    // Créer une réservation "PENDING" (Inquiry) sans dates
    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId: listingId,
        type: "LISTING",
        status: "PENDING",
        totalPrice: 0,
        currency: "EUR",
        adults: 1,
        // Snapshots
        listingSnapshot: {
          listingId: listing.id,
          title: listing.title,
          type: listing.type,
          city: listing.location.city,
          country: listing.location.country,
          image: listing.images[0],
          lat: listing.location.lat,
          lng: listing.location.lng,
        },
        hostSnapshot: {
          hostId: listing.user.id,
          firstname: listing.user.firstname,
          lastname: listing.user.lastname,
          image: listing.user.image,
        }
      }
    });

    // Créer le message lié
    const message = await prisma.message.create({
      data: {
        content,
        senderId: currentUser.id,
        receiverId: hostId,
        reservationId: reservation.id,
      }
    });

    // Optionnel: Déclencher Pusher pour l'hôte si connecté
    await pusherServer.trigger(reservation.id, "messages:new", message);

    return NextResponse.json(reservation);

  } catch (error) {
    console.error("CONTACT_API_ERROR", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
