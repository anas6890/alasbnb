import prisma from "@/lib/prismadb";

export default async function getExperiences() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return experiences;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
