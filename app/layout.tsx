import ClientOnly from "@/components/ClientOnly";
import Footer from "@/components/Footer";
import ToastContainerBar from "@/components/ToastContainerBar";
import LoginModal from "@/components/models/LoginModal";
import RegisterModal from "@/components/models/RegisterModal";
import RentModal from "@/components/models/RentModal";
import SearchModal from "@/components/models/SearchModal";
import LanguageModal from "@/components/models/LanguageModal";
import Navbar from "@/components/navbar/Navbar";
import { Nunito } from "next/font/google";
import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import NextAuthProvider from "./providers/NextAuthProvider";

export const metadata = {
  title: "AlasBnB — Trouvez votre logement idéal",
  description: "AlasBnB — La plateforme de location de logements et d'expériences uniques.",
  icons: "/assets/logo.png",
};

const font = Nunito({
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
          <ClientOnly>
            <ToastContainerBar />
            <SearchModal />
            <LanguageModal />
            <RegisterModal />
            <LoginModal />
            <RentModal />
            <Navbar currentUser={currentUser} />
          </ClientOnly>
          <div className="pt-28 pb-20">
            {children}
          </div>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
