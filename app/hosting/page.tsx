import Container from "@/components/Container";
import Heading from "@/components/Heading";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";
import getReservations from "../actions/getReservations";
import getExperiences from "../actions/getExperiences";
import { FiHome, FiDollarSign, FiStar, FiActivity, FiClock, FiCheckCircle, FiArrowRight, FiPlus, FiTrendingUp } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";
import { formatPriceServer } from "@/hook/usePrice";
import { Currency } from "@/hook/useCurrency";

export default async function HostingPage() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const currency = (cookieStore.get("currency")?.value || "EUR") as Currency;
  const t = translations[language as keyof typeof translations] || translations.en;

  const currentUser = await getCurrentUser();
  const [listings, experiences, reservations] = await Promise.all([
    getListings({ userId: currentUser?.id }),
    getExperiences({ userId: currentUser?.id }),
    getReservations({ authorId: currentUser?.id })
  ]);

  const activeListings = listings.filter(l => l.status === "PUBLISHED").length;
  const activeExperiences = experiences.filter((e: any) => e.status === "PUBLISHED").length;
  const allHostItems = [...listings, ...experiences];

  // Financial Logic
  const earnings = reservations
    .filter(res => res.status !== 'CANCELLED')
    .reduce((acc, res) => acc + (res.totalPrice || 0), 0);

  return (
    <Container>
      <div className="pt-8 pb-24 flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 tracking-tight">
              {t.host_dashboard_welcome ? t.host_dashboard_welcome.replace(',', '') : 'Welcome'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">{currentUser?.firstname}</span>
            </h1>
            <p className="text-neutral-500">
              {t.host_dashboard_subtitle || "Here is a global overview of your host activity."}
            </p>
          </div>
          <Link href="/hosting/create" className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <FiPlus size={18} />
            <span>{t.host_dashboard_create}</span>
          </Link>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Earnings Card */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[28px] p-8 shadow-xl flex flex-col gap-4 text-white relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/20 rounded-full blur-[60px] group-hover:bg-rose-500/30 transition-all duration-700"></div>
            <div className="flex items-center gap-2 text-neutral-400 relative z-10">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiDollarSign size={22} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{t.host_dashboard_secured_earnings}</span>
            </div>
            <h2 className="text-5xl font-black text-white relative z-10 mt-2">
              {formatPriceServer(earnings, currency)}
            </h2>
          </div>

          {/* Active Listings Card */}
          <div className="bg-white rounded-[28px] p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group">
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <FiHome size={22} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.host_dashboard_active_listings}</span>
            </div>
            <h2 className="text-5xl font-black text-neutral-900 mt-2">
              {activeListings}
            </h2>
          </div>

          {/* Active Experiences Card */}
          <div className="bg-white rounded-[28px] p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 group">
            <div className="flex items-center gap-2 text-neutral-500">
              <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <FiActivity size={22} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.host_dashboard_active_experiences}</span>
            </div>
            <h2 className="text-5xl font-black text-neutral-900 mt-2">
              {activeExperiences}
            </h2>
          </div>

        </div>

        {/* BOTTOM SECTION - Recent Bookings and Top Rated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Bookings List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900">{t.host_dashboard_recent_reservations}</h3>
              <Link href="/hosting/reservations" className="text-sm font-medium text-neutral-500 hover:text-neutral-900 underline transition-colors">{t.host_dashboard_view_all}</Link>
            </div>
            
            {reservations.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <p className="text-neutral-500 font-medium text-sm">{t.host_dashboard_no_recent_reservations}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reservations.slice(0, 4).map((res) => {
                  const imageUrl = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.image : res.listingSnapshot?.image;
                  const title = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.title : res.listingSnapshot?.title;

                  return (
                    <div key={res.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden relative">
                           {imageUrl && <Image src={imageUrl} alt="preview" fill className="object-cover" />}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold text-neutral-900 line-clamp-1">{title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? 'bg-green-500' : res.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                              <span className="text-xs font-medium text-neutral-500 capitalize">{(t as any)[`status_${res.status.toLowerCase()}`]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">{formatPriceServer(res.totalPrice, currency)}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(res.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Rated Items List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900">{t.host_dashboard_top_rated}</h3>
            </div>
            
             {allHostItems.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <p className="text-neutral-500 font-medium text-sm">{t.host_dashboard_no_top_rated}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {allHostItems
                    .filter(i => i.avgRating > 0)
                    .sort((a, b) => b.avgRating - a.avgRating)
                    .slice(0, 4)
                    .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden relative">
                         {item.images?.[0] && <Image src={item.images[0]} alt="preview" fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-neutral-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs font-medium text-neutral-500 mt-1">
                            {item.location.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-900">
                      <FiStar size={14} className="fill-current" />
                      <span className="font-semibold text-sm">{(item.avgRating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Container>
  );
}
