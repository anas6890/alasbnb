import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { 
    reservationId, 
    comment,
    ratingCleanliness,
    ratingAccuracy,
    ratingCheckin,
    ratingCommunication,
    ratingLocation,
    ratingValue
  } = body;

  if (!reservationId || !comment) {
    return NextResponse.error();
  }

  // Check if reservation belongs to user
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation || reservation.userId !== currentUser.id) {
    return NextResponse.error();
  }

  const listingId = reservation.listingId;
  if (!listingId) {
    return NextResponse.error(); // Only handling listing reviews for now
  }

  const avgRating = (
    ratingCleanliness +
    ratingAccuracy +
    ratingCheckin +
    ratingCommunication +
    ratingLocation +
    ratingValue
  ) / 6;

  const review = await prisma.review.create({
    data: {
      avgRating,
      ratingCleanliness,
      ratingAccuracy,
      ratingCheckin,
      ratingCommunication,
      ratingLocation,
      ratingValue,
      comment,
      authorId: currentUser.id,
      reservationId,
      listingId,
    },
  });

  // Recalculate listing averages
  const allReviews = await prisma.review.findMany({
    where: { listingId, deletedAt: null }
  });

  const totalReviews = allReviews.length;
  if (totalReviews > 0) {
    const sumClean = allReviews.reduce((sum, r) => sum + (r.ratingCleanliness || 5), 0);
    const sumAcc = allReviews.reduce((sum, r) => sum + (r.ratingAccuracy || 5), 0);
    const sumCheck = allReviews.reduce((sum, r) => sum + (r.ratingCheckin || 5), 0);
    const sumComm = allReviews.reduce((sum, r) => sum + (r.ratingCommunication || 5), 0);
    const sumLoc = allReviews.reduce((sum, r) => sum + (r.ratingLocation || 5), 0);
    const sumVal = allReviews.reduce((sum, r) => sum + (r.ratingValue || 5), 0);
    const sumAvg = allReviews.reduce((sum, r) => sum + r.avgRating, 0);

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        totalReviews,
        avgRating: sumAvg / totalReviews,
        avgRatingCleanliness: sumClean / totalReviews,
        avgRatingAccuracy: sumAcc / totalReviews,
        avgRatingCheckin: sumCheck / totalReviews,
        avgRatingCommunication: sumComm / totalReviews,
        avgRatingLocation: sumLoc / totalReviews,
        avgRatingValue: sumVal / totalReviews,
      }
    });
  }

  return NextResponse.json(review);
}
