import prisma from "@/lib/prismadb";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { cache } from "react";

export async function getSession() {
  return await getServerSession(authOptions);
}

const getCurrentUser = cache(async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!currentUser) {
      const displayName = session.user.name || "User";
      const [firstname, ...rest] = displayName.split(" ");
      const lastname = rest.join(" ");

      const createdUser = await prisma.user.create({
        data: {
          email: session.user.email as string,
          firstname: firstname || "User",
          lastname: lastname || "",
          image: session.user.image || null,
          savedListingIds: [],
          savedExperienceIds: [],
        },
      });

      return {
        ...createdUser,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
        emailVerified: createdUser.emailVerified?.toISOString() || null,
        deletedAt: createdUser.deletedAt?.toISOString() || null,
      };
    }

    return {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
      deletedAt: currentUser.deletedAt?.toISOString() || null,
    };
  } catch (error: any) {
    console.log(
      "🚀 ~ file: getCurrentUser.ts:13 ~ getCurrentUser ~ error:",
      error
    );
    return null;
  }
});

export default getCurrentUser;
