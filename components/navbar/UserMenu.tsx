"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import useRentModal from "@/hook/useRentModal";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { SafeUser } from "@/types";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { AiOutlineMenu } from "react-icons/ai";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";

interface Props {
  currentUser?: SafeUser | null;
}

function UserMenu({ currentUser }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
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

  const onRent = useCallback(() => {
    if (!finalUser) {
      return loginModel.onOpen();
    }

    rentModel.onOpen();
  }, [finalUser, loginModel, rentModel]);

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
              <Avatar src={finalUser?.image!} userName={finalUser?.firstname || finalUser?.name} />
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
                <MenuItem
                  onClick={() => router.push("/trips")}
                  label={t.bookings}
                />
                <MenuItem
                  onClick={() => router.push("/favorites")}
                  label={t.wishlist}
                />
                <MenuItem
                  onClick={() => router.push("/reservations")}
                  label={t.reservations}
                />
                <MenuItem
                  onClick={() => router.push("/properties")}
                  label={t.properties}
                />

                <MenuItem onClick={onRent} label={t.host} />
                <hr />
                <MenuItem onClick={() => signOut()} label={t.logout} />
              </>
            ) : (
              <>
                <MenuItem onClick={loginModel.onOpen} label={t.login} />
                <MenuItem onClick={registerModel.onOpen} label={t.signup} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
