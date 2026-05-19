"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import useRentModal from "@/hook/useRentModal";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { SafeUser } from "@/types";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { AiOutlineMenu } from "react-icons/ai";
import { FiUser, FiBriefcase, FiHeart, FiList, FiHome, FiPlusCircle, FiLogOut, FiLogIn, FiUserPlus, FiRepeat } from "react-icons/fi";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";

interface Props {
  currentUser?: SafeUser | null;
}

function UserMenu({ currentUser }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHostMode = pathname?.startsWith("/hosting");
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const rentModel = useRentModal();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;

  const finalUser = currentUser || (session?.user as SafeUser);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const navigateTo = useCallback((path: string) => {
    setIsOpen(false);
    router.push(path);
  }, [router]);

  const onRent = useCallback(() => {
    setIsOpen(false);
    if (!finalUser) {
      return loginModel.onOpen();
    }

    router.push("/hosting/create");
  }, [finalUser, loginModel, router]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">

        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border-[1px] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            {finalUser ? (
              <Avatar
                src={finalUser?.image!}
                userName={currentUser?.firstname || currentUser?.lastname || "User"}
              />
            ) : (
              <Image
                className="rounded-full"
                height="30"
                width="30"
                alt="Avatar"
                src="/assets/avatar.png"
              />
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute rounded-xl shadow-md w-[240px] bg-white overflow-hidden right-0 top-12 text-sm border-[1px] border-neutral-100">
          <div className="flex flex-col cursor-pointer">
            {finalUser ? (
              <>
                {isHostMode ? (
                  <>
                    <MenuItem
                      onClick={() => navigateTo("/")}
                      label="Mode voyageur"
                      icon={FiRepeat}
                    />
                    <hr className="my-1 border-neutral-200" />
                    <MenuItem
                      onClick={() => navigateTo("/hosting")}
                      label="Tableau de bord"
                      icon={FiHome}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/hosting/listings")}
                      label="Mes annonces"
                      icon={FiList}
                    />
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => navigateTo("/hosting")}
                      label="Mode hôte"
                      icon={FiRepeat}
                    />
                    <hr className="my-1 border-neutral-200" />
                    <MenuItem
                      onClick={() => navigateTo("/profile")}
                      label={t.profile || "Profil"}
                      icon={FiUser}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/trips")}
                      label={t.bookings}
                      icon={FiBriefcase}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/favorites")}
                      label={t.wishlist}
                      icon={FiHeart}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/reservations")}
                      label={t.reservations}
                      icon={FiList}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/properties")}
                      label={t.properties}
                      icon={FiHome}
                    />
                    <MenuItem onClick={onRent} label={t.host} icon={FiPlusCircle} />
                  </>
                )}
                <hr className="my-1 border-neutral-200" />
                <MenuItem onClick={() => { setIsOpen(false); signOut(); }} label={t.logout} icon={FiLogOut} />
              </>
            ) : (
              <>
                <MenuItem onClick={() => { setIsOpen(false); loginModel.onOpen(); }} label={t.login} icon={FiLogIn} />
                <MenuItem onClick={() => { setIsOpen(false); registerModel.onOpen(); }} label={t.signup} icon={FiUserPlus} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;