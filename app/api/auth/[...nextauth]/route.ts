import prisma from "@/lib/prismadb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const customAdapter = PrismaAdapter(prisma);
const originalCreateUser = customAdapter.createUser;
if (originalCreateUser) {
    customAdapter.createUser = async (profile: any) => {
        return originalCreateUser({
            ...profile,
            name: undefined,
            firstname: profile.name?.split(" ")[0] || "User",
            lastname: profile.name?.split(" ").slice(1).join(" ") || "",
        } as any);
    };
}

export const authOptions: AuthOptions = {
    adapter: customAdapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_ID as string,
            clientSecret: process.env.FACEBOOK_SECRET as string,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    scope: "email public_profile",
                },
            },
            profile: (profile: any) => ({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                image: profile.picture?.data?.url,
            }),
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user?.hashedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );
                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }
                return user;
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    debug: process.env.NODE_ENV === "development",
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
