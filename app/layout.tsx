import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import NextAuthProvider from "./providers/NextAuthProvider";
import ClientLayout from "./providers/ClientLayout";

export const metadata = {
  title: "AlasBnB — Trouvez votre logement idéal",
  description: "AlasBnB — La plateforme de location de logements et d'expériences uniques.",
  icons: "/assets/logo.png",
};

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={font.className}>
        <NextAuthProvider>
          <ClientLayout currentUser={currentUser}>
            {children}
          </ClientLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
