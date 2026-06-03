import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import NextAuthProvider from "./providers/NextAuthProvider";
import ClientLayout from "./providers/ClientLayout";
import { Nunito } from "next/font/google";
import Script from "next/script";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "AlasBnB",
  description: "La plateforme de location de logements et d'expériences uniques.",
  icons: "/assets/logo.png",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className={`${nunito.className} antialiased text-neutral-800 bg-white selection:bg-rose-500/30`}>
        <Script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          strategy="beforeInteractive"
        />
        <NextAuthProvider>
          <ClientLayout currentUser={currentUser}>
            {children}
          </ClientLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
