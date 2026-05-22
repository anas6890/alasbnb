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

    await prisma.reservation.update({
      where: {
        id: reservationId,
      },
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
  }

  return new NextResponse(null, { status: 200 });
}
