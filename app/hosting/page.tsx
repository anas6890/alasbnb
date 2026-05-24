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
  const confirmedReservations = reservations.filter(res => res.status === 'CONFIRMED' || res.status === 'COMPLETED');
  const pendingReservations = reservations.filter(res => res.status === 'PENDING');
  
  const securedEarnings = confirmedReservations.reduce((acc, res) => acc + (res.totalPrice || 0), 0);
  const potentialEarnings = pendingReservations.reduce((acc, res) => acc + (res.totalPrice || 0), 0);

  return (
    <Container>
      <div className="pt-8 pb-24 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200/60 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              {t.host_dashboard_welcome ? t.host_dashboard_welcome.replace(',', '') : 'Bienvenue'}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">{currentUser?.firstname}</span> 👋
            </h1>
            <p className="text-lg text-neutral-500 font-medium">
              {t.host_dashboard_subtitle || "Voici un aperçu de vos performances et de votre activité d'hôte."}
            </p>
          </div>
          <Link href="/hosting/create" className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-7 py-3.5 rounded-full text-[15px] font-bold shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.35)] hover:-translate-y-[2px] transition-all duration-300 w-fit">
            <FiPlus size={20} />
            <span>Créer une annonce</span>
          </Link>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[140px]">
          
          {/* Main Earnings Card (Spans 2x2) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-neutral-900 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-between shadow-xl group border border-neutral-800 hover:border-neutral-700 transition-all duration-500">
            {/* Ambient glowing orb */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:bg-white/15 transition-all duration-1000"></div>
            
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-3 text-neutral-400">
                <FiDollarSign size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">Gains Sécurisés</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-sm">
                {formatPriceServer(securedEarnings, currency)}
              </h2>
            </div>
            
            <div className="relative z-10 flex items-end justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-neutral-400 text-sm font-medium">En attente de confirmation</span>
                <span className="text-2xl font-bold text-neutral-200">+{formatPriceServer(potentialEarnings, currency)}</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                <FiTrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Pending Action Card */}
          <Link href="/hosting/reservations" className="col-span-1 md:col-span-1 lg:col-span-2 row-span-1 bg-amber-50 rounded-[32px] p-6 flex items-center justify-between group hover:bg-amber-100 hover:shadow-md transition-all duration-300 border border-amber-200/50 relative overflow-hidden">
             <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center gap-2 text-amber-600">
                  <FiClock size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">À traiter</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-amber-900 tracking-tight">
                  {pendingReservations.length} {pendingReservations.length > 1 ? "demandes" : "demande"}
                </h3>
             </div>
             <div className="w-12 h-12 rounded-full bg-amber-200/50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform duration-300 relative z-10">
               <FiArrowRight size={20} />
             </div>
          </Link>

          {/* Active Listings Mini Card */}
          <div className="col-span-1 row-span-1 bg-white rounded-[32px] p-6 flex flex-col justify-between border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
             <div className="flex justify-between items-start">
               <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                 <FiHome size={20} />
               </div>
             </div>
             <div className="flex flex-col">
               <span className="text-3xl font-black text-neutral-900">{activeListings}</span>
               <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Logements actifs</span>
             </div>
          </div>

          {/* Active Experiences Mini Card */}
          <div className="col-span-1 row-span-1 bg-white rounded-[32px] p-6 flex flex-col justify-between border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
             <div className="flex justify-between items-start">
               <div className="p-3 bg-neutral-100 rounded-2xl text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                 <FiActivity size={20} />
               </div>
             </div>
             <div className="flex flex-col">
               <span className="text-3xl font-black text-neutral-900">{activeExperiences}</span>
               <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Expériences actives</span>
             </div>
          </div>

        </div>

        {/* BOTTOM SECTION - Recent Bookings and Top Rated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Recent Bookings List */}
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">Réservations récentes</h3>
              <Link href="/hosting/reservations" className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Voir tout</Link>
            </div>
            
            {reservations.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-4 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                <FiActivity size={32} className="text-neutral-300" />
                <p className="text-neutral-500 font-bold text-sm">Aucune réservation pour le moment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reservations.slice(0, 4).map((res) => {
                  const imageUrl = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.image : res.listingSnapshot?.image;
                  const title = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.title : res.listingSnapshot?.title;

                  return (
                    <div key={res.id} className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-200 rounded-xl overflow-hidden relative group-hover:shadow-sm transition-shadow">
                           {imageUrl && <Image src={imageUrl} alt="preview" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-[15px] text-neutral-900 line-clamp-1">{title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className={`w-2 h-2 rounded-full ${res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                              <span className="text-xs font-semibold text-neutral-500 capitalize">{res.status.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[16px] text-neutral-900">{formatPriceServer(res.totalPrice, currency)}</p>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
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
          <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">Meilleures notes</h3>
              <div className="w-8 h-1 bg-neutral-200 rounded-full"></div>
            </div>
            
             {allHostItems.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-4 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                <FiStar size={32} className="text-neutral-300" />
                <p className="text-neutral-500 font-bold text-sm">Vous n'avez pas encore d'annonces.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allHostItems
                    .filter(i => i.avgRating > 0)
                    .sort((a, b) => b.avgRating - a.avgRating)
                    .slice(0, 4)
                    .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-neutral-200 rounded-xl overflow-hidden relative">
                         {item.images?.[0] && <Image src={item.images[0]} alt="preview" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold text-[15px] text-neutral-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                            {item.location.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-lg group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                      <FiStar size={13} className="fill-current" />
                      <span className="font-black text-sm tracking-tighter">{(item.avgRating || 0).toFixed(1)}</span>
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
