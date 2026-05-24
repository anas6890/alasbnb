"use client";

import { SafeUser } from "@/types";
import Container from "../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import Categories from "./Categories";
import { useRouter, usePathname } from "next/navigation";
import useLoginModel from "@/hook/useLoginModal";
import useRentModal from "@/hook/useRentModal";
import useLanguageModal from "@/hook/useLanguageModal";
import useLanguage from "@/hook/useLanguage";
import useSearchModal from "@/hook/useSearchModal";
import { translations } from "@/lib/translations";
import { useCallback, useState, useRef, useEffect } from "react";
import { MdLanguage } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import NotificationBell from "./NotificationBell";

type Props = {
  currentUser?: SafeUser | null;
};

function Navbar({ currentUser }: Props) {
  const router = useRouter();
  const loginModel = useLoginModel();
  const rentModel = useRentModal();
  const languageModal = useLanguageModal();
  const searchModal = useSearchModal();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const pathname = usePathname();
  const isExperiencePage = pathname === "/experiences" || pathname?.startsWith("/experiences/");
  const mode = isExperiencePage ? "experiences" : "logements";

  const [isScrolled, setIsScrolled] = useState(false);
  const isListingDetail = pathname?.startsWith("/listings/");
  const forceCompact = pathname !== "/" && pathname !== "/experiences";
  const isCompact = isScrolled || forceCompact;

  // Search bars visibility conditions
  let showCompactSearch = false;
  if (pathname === "/" || pathname === "/experiences") {
    showCompactSearch = isScrolled;
  } else if (isListingDetail) {
    showCompactSearch = !isScrolled;
  } else {
    showCompactSearch = true;
  }

  const showBigSearch = !isCompact;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const houseVideoRef = useRef<HTMLVideoElement>(null);
  const balloonVideoRef = useRef<HTMLVideoElement>(null);

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModel.onOpen();
    }

    const targetType = mode === "experiences" ? "EXPERIENCE" : "LISTING";
    router.push(`/hosting/create?type=${targetType}`);
  }, [currentUser, loginModel, router, mode]);

  return (
    <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-rose-100/90 via-white/95 to-orange-100/90 backdrop-blur-md z-50 transition-all duration-300 border-b border-rose-200/50 shadow-[0_4px_20px_rgba(244,63,94,0.05)]">
      <div className={`transition-all duration-500 ${isCompact ? "py-1.5" : "py-1.5"}`}>
        <Container>
          <div className={`flex flex-row items-center justify-between gap-3 md:gap-0 relative transition-all duration-300 ${isCompact ? "h-16" : "h-20"}`}>
            <div className="flex-none">
              <Logo />
            </div>

            {/* Center Area : Switcher & Compact Search */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">

              {/* The Switcher: Logements / Expériences */}
              <div className={`flex flex-row items-center gap-10 text-[15px] transition-all duration-500 ${isCompact ? "opacity-0 scale-90 pointer-events-none absolute" : "opacity-100 scale-100 relative pointer-events-auto"}`}>

                {/* Logements */}
                <div
                  onClick={() => {
                    router.push("/");
                    if (houseVideoRef.current) {
                      houseVideoRef.current.currentTime = 0;
                      houseVideoRef.current.play();
                    }
                  }}
                  className={`cursor-pointer transition-all duration-300 relative px-4 py-2 rounded-full flex flex-row items-center gap-2.5 group ${pathname === "/" ? "bg-neutral-100/80 text-neutral-900 font-bold shadow-sm" : "text-neutral-500 font-medium hover:bg-neutral-50 hover:text-neutral-900"}`}
                >
                  <video
                    ref={houseVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-10 h-10 object-cover bg-transparent opacity-90 group-hover:scale-110 transition-transform duration-300"
                  >
                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-selected.webm#t=0.001" type="video/webm" />
                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-selected.mov#t=0.001" type="video/mp4" />
                  </video>
                  <span>{t.logements}</span>
                </div>

                {/* Expériences */}
                <div
                  onClick={() => {
                    router.push("/experiences");
                    if (balloonVideoRef.current) {
                      balloonVideoRef.current.currentTime = 0;
                      balloonVideoRef.current.play();
                    }
                  }}
                  className={`cursor-pointer transition-all duration-300 relative px-4 py-2 rounded-full flex flex-row items-center gap-2.5 group ${pathname === "/experiences" ? "bg-neutral-100/80 text-neutral-900 font-bold shadow-sm" : "text-neutral-500 font-medium hover:bg-neutral-50 hover:text-neutral-900"}`}
                >
                  <video
                    ref={balloonVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-10 h-10 object-cover bg-transparent opacity-90 group-hover:scale-110 transition-transform duration-300"
                  >
                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/balloon-twirl.webm" type="video/webm" />
                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov" type="video/mp4" />
                  </video>
                  <span>{t.experiences}</span>
                </div>

              </div>

              {/* Compact Search Bar (Visible only when scrolled or compact mode) */}
              <div className={`flex w-auto justify-center transition-all duration-500 ${showCompactSearch ? "opacity-100 scale-100 translate-y-0 visible relative pointer-events-auto" : "opacity-0 scale-90 translate-y-4 invisible absolute pointer-events-none"}`}>
                <Search mode={mode} compact />
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 flex-none">
              <div
                onClick={onRent}
                className="hidden md:block text-[13px] font-bold py-3 px-5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {mode === "experiences" ? t.host_experience : t.host_listing}
              </div>
              <div
                onClick={languageModal.onOpen}
                className="p-3 hover:bg-neutral-100 rounded-full transition-all duration-300 cursor-pointer text-neutral-600"
              >
                <MdLanguage size={20} />
              </div>
              {currentUser && (
                <NotificationBell currentUser={currentUser} />
              )}
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
          
          {/* Big Search Bar Area (Hidden when scrolled) */}
          <div className={`flex items-center justify-center transition-all duration-500 origin-top overflow-hidden flex-col ${showBigSearch ? "h-[72px] opacity-100 mt-2 mb-2 scale-y-100" : "h-0 opacity-0 my-0 scale-y-0"}`}>
            <Search mode={mode} />
          </div>

        </Container>
      </div>
    </div>
  );
}

export default Navbar;
