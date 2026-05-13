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
import { useCallback } from "react";

type Props = {
  currentUser?: SafeUser | null;
};

function Navbar({ currentUser }: Props) {
  const router = useRouter();
  const loginModel = useLoginModel();
  const rentModel = useRentModal();
  const pathname = usePathname();

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModel.onOpen();
    }

    rentModel.onOpen();
  }, [currentUser, loginModel, rentModel]);

  return (
    <div className="fixed w-full bg-white z-20 shadow-sm border-b-[1px]">
      <div className="py-4">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <Logo />
            
            {/* The Switcher: Logements / Expériences */}
            <div className="hidden md:flex flex-row items-center gap-8 text-base font-medium text-neutral-600">
              <div 
                onClick={() => router.push("/")}
                className={`cursor-pointer hover:text-black transition relative pb-1 ${pathname === "/" ? "text-black after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black" : ""}`}
              >
                Logements
              </div>
              <div 
                onClick={() => router.push("/experiences")}
                className={`cursor-pointer hover:text-black transition relative pb-1 ${pathname === "/experiences" ? "text-black after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black" : ""}`}
              >
                Expériences
              </div>
            </div>

            <div className="flex flex-row items-center gap-3">
              <div 
                onClick={onRent}
                className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                Devenir hôte
              </div>
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
          
          {/* Big Search Bar Area */}
          <div className="flex justify-center my-2 md:my-6">
             <Search />
          </div>

        </Container>
      </div>
      {/* Categories only on home page */}
      {pathname === "/" && <Categories />}
    </div>
  );
}

export default Navbar;
