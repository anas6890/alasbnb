import prisma from "@/lib/prismadb";

export default async function getExperiences() {
  try {
    if (!(prisma as any).experience) {
      console.error("Prisma experience model is missing! Try restarting your dev server.");
      return [];
    }

    const experiences = await (prisma as any).experience.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return experiences;
  } catch (error: any) {
    console.error("Error in getExperiences:", error);
    return [];
  }
}
