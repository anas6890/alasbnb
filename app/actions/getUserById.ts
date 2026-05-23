import prisma from "@/lib/prismadb";

interface IParams {
  userId?: string;
}

export default async function getUserById(params: IParams) {
  try {
    const { userId } = params;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        listings: true, 
        experiences: true, 
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt?.toISOString() || null,
      emailVerified: user.emailVerified?.toISOString() || null,
      listings: user.listings.map((listing) => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
        updatedAt: listing.updatedAt.toISOString(),
        deletedAt: listing.deletedAt?.toISOString() || null,
      })),
      experiences: user.experiences.map((exp) => ({
        ...exp,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString(),
        deletedAt: exp.deletedAt?.toISOString() || null,
      }))
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
