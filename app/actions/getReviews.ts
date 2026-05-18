import prisma from "@/lib/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getReviews(params: IParams) {
  try {
    const { listingId } = params;

    const query: any = {};

    if (listingId) {
      query.reservation = {
        listingId: listingId
      };
    }

    const reviews = await prisma.review.findMany({
      where: query,
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
