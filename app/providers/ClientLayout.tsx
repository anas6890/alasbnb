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

  return (
    <ClientOnly>
      <ToastContainerBar />
      <SearchModal />
      <LanguageModal />
      <RegisterModal />
      <LoginModal />
      <RentModal />
      {!isHostMode && <Navbar currentUser={currentUser} />}
      <div className={!isHostMode ? "pt-64 pb-20" : ""}>
        {children}
      </div>
      {!isHostMode && <Footer />}
    </ClientOnly>
  );
}
