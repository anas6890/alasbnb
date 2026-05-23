"use client";

import { SafeUser } from "@/types";
import Container from "../Container";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

type Props = {
  currentUser?: SafeUser | null;
};

function HostNavbar({ currentUser }: Props) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const menuItems = [
    { label: t.dashboard, href: "/hosting" },
    { label: t.my_listings, href: "/hosting/listings" },
    { label: t.reservations, href: "/hosting/reservations" },
    { label: t.messages, href: "/messages" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-white z-50 border-b-[1px] shadow-sm">
      <div className="py-3">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-8">
              <Logo />
              <nav className="hidden lg:flex items-center gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-semibold transition hover:text-neutral-800 ${
                      pathname === item.href
                        ? "text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Link
                href="/"
                className="hidden md:block text-xs font-bold px-3 py-2 border-[1px] border-neutral-200 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              >
                {t.return_guest_mode}
              </Link>
              <UserMenu currentUser={currentUser} />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default HostNavbar;
