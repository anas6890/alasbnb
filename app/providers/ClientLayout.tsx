"use client";

import ClientOnly from "@/components/ClientOnly";
import ToastContainerBar from "@/components/ToastContainerBar";
import LoginModal from "@/components/models/LoginModal";
import RegisterModal from "@/components/models/RegisterModal";
import RentModal from "@/components/models/RentModal";
import SearchModal from "@/components/models/SearchModal";
import LanguageModal from "@/components/models/LanguageModal";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { SafeUser } from "@/types";

interface ClientLayoutProps {
  currentUser?: SafeUser | null;
  children: React.ReactNode;
}

export default function ClientLayout({ currentUser, children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHostMode = pathname?.startsWith("/hosting");
  const isListingDetail = pathname?.startsWith("/listings/");
  const isTripsPage = pathname?.startsWith("/trips");
  const isHome = pathname === "/" || pathname === "/experiences";
  const isMessagesPage = pathname?.startsWith("/messages");
  
  const paddingClass = isHostMode ? "" : isMessagesPage ? "pt-[80px]" : isHome ? "pt-[172px] pb-20" : "pt-28 pb-20";

  return (
    <ClientOnly>
      <ToastContainerBar />
      <SearchModal />
      <LanguageModal />
      <RegisterModal />
      <LoginModal />
      <RentModal />
      {!isHostMode && <Navbar currentUser={currentUser} />}
      <div className={paddingClass}>
        {children}
      </div>
      {!isHostMode && !isMessagesPage && <Footer />}
    </ClientOnly>
  );
}
