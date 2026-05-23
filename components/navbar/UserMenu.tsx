"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

import { SafeUser } from "@/types";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { AiOutlineMenu } from "react-icons/ai";
import { FiUser, FiBriefcase, FiHeart, FiList, FiHome, FiLogOut, FiLogIn, FiUserPlus, FiRepeat, FiCalendar, FiMessageCircle } from "react-icons/fi";
import Avatar from "../Avatar";
import MenuItem from "./MenuItem";
import axios from "axios";
import { pusherClient } from "@/lib/pusher";

interface Props {
  currentUser?: SafeUser | null;
}

function UserMenu({ currentUser }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHostMode = pathname?.startsWith("/hosting");
  
  // Determine if we are in experience mode based on URL or search params
  const isExperienceMode = pathname?.startsWith("/experiences") || searchParams?.get("type") === "EXPERIENCE";

  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const finalUser = currentUser || (session?.user as SafeUser);

  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    if (finalUser) {
      axios.get('/api/messages/unread').then((res) => {
        setHasUnreadMessages(res.data.unread);
      });

      if (pusherClient) {
        pusherClient.subscribe(`user-${finalUser.id}`);
        
        const unreadHandler = () => {
          setHasUnreadMessages(true);
        };
        
        pusherClient.bind("messages:unread", unreadHandler);

        return () => {
          if (pusherClient) {
            pusherClient.unsubscribe(`user-${finalUser.id}`);
            pusherClient.unbind("messages:unread", unreadHandler);
          }
        };
      }
    }
  }, [finalUser]);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const navigateTo = useCallback((path: string, showToast?: string) => {
    setIsOpen(false);
    if (showToast) {
      toast.success(showToast);
    }
    router.push(path);
  }, [router]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">

        <div
          onClick={toggleOpen}
          className="p-4 md:py-1 md:px-2 border-[1px] flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition relative"
        >
          {hasUnreadMessages && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
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
                <div className="px-4 py-3 border-b-[1px] border-neutral-100">
                  <p className="font-semibold text-neutral-800">
                    {finalUser.firstname} {finalUser.lastname}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">{finalUser.email}</p>
                </div>
                
                {isHostMode ? (
                  <>
                    <MenuItem
                      onClick={() => navigateTo("/", t.switched_to_guest)}
                      label={t.mode_guest}
                      icon={FiRepeat}
                    />
                    <hr className="my-1 border-neutral-100" />
                    <MenuItem
                      onClick={() => navigateTo("/hosting")}
                      label={t.dashboard}
                      icon={FiHome}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/hosting/listings")}
                      label={t.my_listings}
                      icon={FiList}
                    />
                    <MenuItem
                      onClick={() => navigateTo("/hosting/reservations")}
                      label={t.received_reservations}
                      icon={FiCalendar}
                    />
                    <MenuItem
                      onClick={() => {
                        setHasUnreadMessages(false);
                        navigateTo("/hosting/messages");
                      }}
                      label={t.messages}
                      icon={FiMessageCircle}
                    />
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => navigateTo("/hosting", t.switched_to_host)}
                      label={t.mode_host}
                      icon={FiRepeat}
                    />
                    <hr className="my-1 border-neutral-100" />
                    <MenuItem
                      onClick={() => navigateTo("/profile")}
                      label={t.profile}
                      icon={FiUser}
                    />
                    <MenuItem
                      onClick={() => navigateTo(isExperienceMode ? "/trips?type=EXPERIENCE" : "/trips?type=LISTING")}
                      label={t.bookings}
                      icon={FiBriefcase}
                    />
                    <MenuItem
                      onClick={() => navigateTo(isExperienceMode ? "/favorites?type=EXPERIENCE" : "/favorites?type=LISTING")}
                      label={t.wishlist}
                      icon={FiHeart}
                    />
                    <MenuItem
                      onClick={() => {
                        setHasUnreadMessages(false);
                        navigateTo("/messages");
                      }}
                      label={t.messages}
                      icon={FiMessageCircle}
                    />
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