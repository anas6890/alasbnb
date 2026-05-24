import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import neo4jDriver from "@/lib/neo4j";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const reservationId = session?.metadata?.reservationId;

    if (!reservationId) {
      return new NextResponse("Reservation ID is required", { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    // ── Idempotency guard ──────────────────────────────────────────────
    // Si le paiement est déjà enregistré, on ignore le webhook rejoué.
    if (reservation.payment?.status === "captured") {
      console.log(`[WEBHOOK] Payment already captured for ${reservationId} — skipping.`);
      return new NextResponse(null, { status: 200 });
    }

    // ── Enregistrer les informations de paiement uniquement ───────────
    // La réservation est déjà CONFIRMED et les dates/places déjà bloquées
    // au moment de la création. On enregistre juste le détail du paiement.
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        payment: {
          set: {
            amount: session.amount_total || 0,
            currency: session.currency || "eur",
            status: "captured",
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          },
        },
      },
    });

    // ── Intégration Neo4j (recommandations) ───────────────────────────
    if (reservation.type === "LISTING" && reservation.listingId) {
      try {
        const neo4jSession = neo4jDriver.session();
        await neo4jSession.run(
          `MERGE (u:User {id: $userId})
           MERGE (l:Listing {id: $listingId})
           MERGE (u)-[:BOOKED]->(l)`,
          { userId: reservation.userId, listingId: reservation.listingId }
        );
        await neo4jSession.close();
      } catch (error) {
        console.error("[WEBHOOK] Neo4j error on booking:", error);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
