import Stripe from "stripe";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as any, // Or latest
});

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { reservationId } = body;

    if (!reservationId) {
      return new NextResponse("Reservation ID is required", { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { 
        listing: true, 
        session: { include: { experience: true } } 
      }
    });

    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    const cookieStore = await cookies();
    const language = cookieStore.get("language")?.value || "en";
    const t = translations[language as keyof typeof translations] || translations.en;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: reservation.currency.toLowerCase(),
            product_data: {
              name: reservation.type === 'EXPERIENCE' 
                ? (reservation.session?.experience?.title || t.experiences)
                : (reservation.listingSnapshot?.title || t.logements),
              description: reservation.type === 'EXPERIENCE'
                ? (t.reservation_label || "Reservation")
                : `Reservation from ${reservation.checkIn?.toLocaleDateString()} to ${reservation.checkOut?.toLocaleDateString()}`,
            },
            unit_amount: reservation.totalPrice * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/trips?success=1&type=${reservation.type}`,
      cancel_url: reservation.type === 'EXPERIENCE'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${reservation.session?.experienceId}?cancelled=1`
        : `${process.env.NEXT_PUBLIC_APP_URL}/listings/${reservation.listingId}?cancelled=1`,
      metadata: {
        reservationId: reservation.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
