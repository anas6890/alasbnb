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
        listings: true, // Include their listings so we can display them
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() || null,
      listings: user.listings.map((listing) => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
      }))
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
