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
  const t = translations[language] || translations.fr;
  const pathname = usePathname();
  const mode = pathname === "/experiences" ? "experiences" : "logements";

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
    <div className="fixed top-0 left-0 w-full bg-white z-50 transition-all duration-300 border-b-[1px] shadow-sm">
      <div className={`transition-all duration-300 ${isCompact ? "py-2" : "py-4"}`}>
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 relative h-[64px]">
            <div className="flex-none">
              <Logo />
            </div>

            {/* Center Area : Switcher & Compact Search */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center">

              {/* The Switcher: Logements / Expériences */}
              <div className={`flex flex-row items-center gap-8 text-[16px] transition-all duration-300 ${isCompact ? "opacity-0 scale-95 pointer-events-none absolute pt-4" : "opacity-100 scale-100 relative pointer-events-auto"}`}>

                {/* Logements */}
                <div
                  onClick={() => {
                    router.push("/");
                    if (houseVideoRef.current) {
                      houseVideoRef.current.currentTime = 0;
                      houseVideoRef.current.play();
                    }
                  }}
                  onMouseEnter={() => {
                    if (houseVideoRef.current) {
                      houseVideoRef.current.currentTime = 0;
                      houseVideoRef.current.play();
                    }
                  }}
                  className={`cursor-pointer transition relative pb-2 flex flex-row items-center gap-2 hover:text-neutral-800 ${pathname === "/" ? "text-neutral-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-black" : "font-medium text-neutral-500"}`}
                >
                  <video
                    ref={houseVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-10 h-10 object-cover bg-transparent opacity-80"
                  >
                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/house-selected.webm#t=0.001" type="video/webm" />
                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/house-selected.mov#t=0.001" type="video/mp4" />
                  </video>
                  <span>Logements</span>
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
                  onMouseEnter={() => {
                    if (balloonVideoRef.current) {
                      balloonVideoRef.current.currentTime = 0;
                      balloonVideoRef.current.play();
                    }
                  }}
                  className={`cursor-pointer transition relative pb-2 flex flex-row items-center gap-2 hover:text-neutral-800 ${pathname === "/experiences" ? "text-neutral-900 font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-black" : "font-medium text-neutral-500"}`}
                >
                  <video
                    ref={balloonVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-10 h-10 object-cover bg-transparent opacity-80"
                  >
                    <source src="https://a0.muscache.com/videos/search-bar-icons/webm/balloon-twirl.webm" type="video/webm" />
                    <source src="https://a0.muscache.com/videos/search-bar-icons/hevc/balloon-twirl.mov" type="video/mp4" />
                  </video>
                  <span>Expériences</span>
                </div>

              </div>

              {/* Compact Search Bar (Visible only when scrolled or compact mode) */}
              <div className={`flex w-auto justify-center transition-all duration-300 ${showCompactSearch ? "opacity-100 scale-100 translate-y-0 visible relative pointer-events-auto" : "opacity-0 scale-95 translate-y-4 invisible absolute pointer-events-none"}`}>
                <Search mode={mode} compact />
              </div>
            </div>

            <div className="flex flex-row items-center gap-3 flex-none">
              <div
                onClick={onRent}
                className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                {mode === "experiences" ? "Proposer une expérience" : "Mettre mon logement sur AlasBnB"}
              </div>
              <div
                onClick={languageModal.onOpen}
                className="p-3 hover:bg-neutral-100 rounded-full transition cursor-pointer"
              >
                <MdLanguage size={18} />
              </div>
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
          
          {/* Big Search Bar Area (Hidden when scrolled) */}
          <div className={`flex items-center justify-center transition-all duration-300 origin-top overflow-hidden flex-col ${showBigSearch ? "h-[90px] opacity-100 my-3 scale-y-100" : "h-0 opacity-0 my-0 scale-y-0"}`}>
            <Search mode={mode} />
          </div>

        </Container>
      </div>
      <Categories />
    </div>
  );
}

export default Navbar;
