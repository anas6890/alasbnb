import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

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
      include: { listing: true, session: true }
    });

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    // 1. Update reservation status
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CONFIRMED",
        payment: {
          set: {
            amount: session.amount_total || 0,
            currency: session.currency || "eur",
            status: "captured",
            stripePaymentIntentId: session.payment_intent as string,
            paidAt: new Date(),
          }
        }
      },
    });

    // 2. Business Logic based on type
    if (reservation.type === "EXPERIENCE" && reservation.sessionId) {
      // Decrement spots only after payment confirmation
      await prisma.experienceSession.update({
        where: { id: reservation.sessionId },
        data: {
          spotsLeft: {
            decrement: reservation.adults + (reservation.children || 0)
          }
        }
      });
    } else if (reservation.type === "LISTING" && reservation.listingId && reservation.checkIn && reservation.checkOut) {
      // Block dates in ListingAvailability
      const startDate = new Date(reservation.checkIn);
      const endDate = new Date(reservation.checkOut);
      
      const datesToBlock = [];
      let currentDate = new Date(startDate);
      while (currentDate < endDate) {
        datesToBlock.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const date of datesToBlock) {
        await prisma.listingAvailability.upsert({
          where: {
            listingId_date: {
              listingId: reservation.listingId,
              date: date
            }
          },
          update: { isAvailable: false },
          create: {
            listingId: reservation.listingId,
            date: date,
            isAvailable: false
          }
        });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
