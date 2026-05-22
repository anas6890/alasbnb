import prisma from "@/lib/prismadb";

interface IParams {
  listingId?: string;
  experienceId?: string;
}

export default async function getReviews(params: IParams) {
  try {
    const { listingId, experienceId } = params;

    const query: any = {};

    if (listingId) {
      query.listingId = listingId;
    }

    if (experienceId) {
      query.experienceId = experienceId;
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
