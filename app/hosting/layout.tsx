"use client";

import Container from "@/components/Container";
import Logo from "@/components/navbar/Logo";
import UserMenu from "@/components/navbar/UserMenu";
import { SafeUser } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { 
  FiLayout, 
  FiList, 
  FiCalendar, 
  FiMessageSquare, 
  FiPlus, 
  FiArrowLeft,
  FiSettings,
  FiTrendingUp
} from "react-icons/fi";

interface HostLayoutProps {
  children: React.ReactNode;
  currentUser?: SafeUser | null;
}

const HostLayout: React.FC<HostLayoutProps> = ({ children, currentUser }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const navigation = [
    { name: t.dashboard, href: "/hosting", icon: FiLayout },
    { name: t.my_listings, href: "/hosting/listings", icon: FiList },
    { name: t.reservations, href: "/hosting/reservations", icon: FiCalendar },
    { name: t.messages, href: "/messages", icon: FiMessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Top Navbar - Fixed */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-neutral-200 z-[100] px-4 md:px-8">
        <div className="h-full max-w-[2520px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden lg:h-8 lg:w-[1px] lg:bg-neutral-200" />
            <Link 
              href="/"
              className="hidden lg:flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition"
            >
              <FiArrowLeft size={18} />
              {t.return_guest_mode}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/hosting/create"
              className="hidden md:flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition shadow-sm"
            >
              <FiPlus size={18} />
              {t.create}
            </Link>
            <UserMenu currentUser={currentUser} />
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-neutral-200 h-[calc(100vh-80px)] fixed left-0 overflow-y-auto">
          <nav className="flex-1 px-4 py-8 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-200
                    ${isActive 
                      ? "bg-neutral-900 text-white shadow-md shadow-neutral-200" 
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"}
                  `}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-neutral-100">
            <button className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-[15px] font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition">
              <FiSettings size={20} />
              {t.settings}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:pl-72 min-h-[calc(100vh-80px)]">
          <div className="p-4 md:p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 py-3 flex justify-between items-center z-[100] pb-safe">
        {navigation.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition ${isActive ? "text-neutral-900" : "text-neutral-400"}`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default HostLayout;
