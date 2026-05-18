import prisma from "@/lib/prismadb";

interface IParams {
  experienceId?: string;
}

export default async function getExperienceById(params: IParams) {
  try {
    const { experienceId } = params;

    if (!experienceId) {
      return null;
    }

    const experience = await prisma.experience.findUnique({
      where: {
        id: experienceId,
      },
      include: {
        user: true,
      },
    });

    if (!experience || !experience.user) {
      return null;
    }

    return {
      ...experience,
      createdAt: experience.createdAt.toString(),
      user: {
        ...experience.user,
        createdAt: experience.user.createdAt.toISOString(),
        updatedAt: experience.user.updatedAt.toISOString(),
        emailVerified: experience.user.emailVerified?.toISOString() || null,
        deletedAt: experience.user.deletedAt,
      },
    };
  } catch (error: any) {
    console.error("Error in getExperienceById:", error);
    return null;
  }
}
