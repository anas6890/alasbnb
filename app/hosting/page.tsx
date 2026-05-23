import Container from "@/components/Container";
import Heading from "@/components/Heading";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";
import getReservations from "../actions/getReservations";
import getExperiences from "../actions/getExperiences";
import { FiHome, FiDollarSign, FiStar, FiActivity } from "react-icons/fi";
import Image from "next/image";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

export default async function HostingPage() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  const currentUser = await getCurrentUser();
  const [listings, experiences, reservations] = await Promise.all([
    getListings({ userId: currentUser?.id }),
    getExperiences({ userId: currentUser?.id }),
    getReservations({ authorId: currentUser?.id })
  ]);

  const totalEarnings = reservations.reduce((acc, res) => acc + (res.totalPrice || 0), 0);
  const activeListings = listings.filter(l => l.status === "PUBLISHED").length;
  const activeExperiences = experiences.filter((e: any) => e.status === "PUBLISHED").length;

  const allHostItems = [...listings, ...experiences];

  const stats = [
    { label: t.host_dashboard_total_earnings, value: `€${totalEarnings}`, icon: FiDollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: t.host_dashboard_active_listings, value: activeListings, icon: FiHome, color: "text-blue-600", bg: "bg-blue-100" },
    { label: t.host_dashboard_active_experiences, value: activeExperiences, icon: FiActivity, color: "text-teal-600", bg: "bg-teal-100" },
  ];

  return (
    <Container>
      <div className="pt-10 pb-24 flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <Heading
            title={`${t.host_dashboard_welcome}${currentUser?.firstname}`}
            subtitle={t.host_dashboard_subtitle}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2 bg-neutral-900 text-white p-8 md:p-10 rounded-[36px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="flex flex-col justify-between h-full relative z-10 gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <FiDollarSign size={24} className="text-white" />
                </div>
                <p className="text-xs text-neutral-300 font-black uppercase tracking-[0.2em]">{t.host_dashboard_total_earnings}</p>
              </div>
              <div>
                <p className="text-5xl md:text-7xl font-black tracking-tighter">€{totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[36px] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 border border-blue-100">
                <FiHome size={24} />
              </div>
              <p className="text-xs text-neutral-400 font-black uppercase tracking-[0.2em]">{t.host_dashboard_active_listings}</p>
            </div>
            <p className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter">{activeListings}</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[36px] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border border-teal-100">
                <FiActivity size={24} />
              </div>
              <p className="text-xs text-neutral-400 font-black uppercase tracking-[0.2em]">{t.host_dashboard_active_experiences}</p>
            </div>
            <p className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter">{activeExperiences}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white p-8 md:p-10 rounded-[36px] border border-neutral-100 shadow-sm flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-neutral-900 italic tracking-tight">{t.host_dashboard_recent_reservations}</h3>
              <div className="w-10 h-1 bg-brand-500 rounded-full"></div>
            </div>
            
            {reservations.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-4 opacity-50">
                <FiActivity size={48} className="text-neutral-300" />
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">{t.host_dashboard_no_reservations}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reservations.slice(0, 5).map((res) => {
                  const imageUrl = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.image : res.listingSnapshot?.image;
                  const title = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.title : res.listingSnapshot?.title;

                  return (
                    <div key={res.id} className="flex items-center justify-between p-4 rounded-[24px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-300 group">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-200 rounded-[18px] overflow-hidden relative shadow-sm group-hover:scale-105 transition-transform duration-300">
                           {imageUrl && <Image src={imageUrl} alt="preview" fill className="object-cover" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="font-black text-[15px] text-neutral-900 line-clamp-1">{title}</p>
                          <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${res.type === 'EXPERIENCE' ? 'bg-teal-100 text-teal-700' : 'bg-brand-100 text-brand-700'}`}>
                                {res.type === 'EXPERIENCE' ? t.host_dashboard_listing_type_exp : t.host_dashboard_listing_type_log}
                              </span>
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                {new Date(res.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                              </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-black text-lg text-neutral-900 tracking-tighter">€{res.totalPrice}</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${res.status === 'CONFIRMED' ? 'bg-teal-500' : 'bg-amber-500'}`}></div>
                          <span className="text-[10px] font-bold uppercase text-neutral-500">
                            {res.status === 'CONFIRMED' ? t.host_dashboard_paid : res.status === 'PENDING' ? t.host_dashboard_awaiting : res.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="bg-white p-8 md:p-10 rounded-[36px] border border-neutral-100 shadow-sm flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-neutral-900 italic tracking-tight">Meilleures notes</h3>
              <div className="w-10 h-1 bg-amber-500 rounded-full"></div>
            </div>
            
             {allHostItems.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-4 opacity-50">
                <FiStar size={48} className="text-neutral-300" />
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">{t.host_dashboard_no_listings}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allHostItems
                    .filter(i => i.avgRating > 0)
                    .sort((a, b) => b.avgRating - a.avgRating)
                    .slice(0, 5)
                    .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-[24px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-200 rounded-[18px] overflow-hidden relative shadow-sm group-hover:scale-105 transition-transform duration-300">
                         {item.images?.[0] && <Image src={item.images[0]} alt="preview" fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-black text-[15px] text-neutral-900 line-clamp-1">{item.title}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {item.location.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-neutral-100 group-hover:bg-neutral-900 group-hover:border-neutral-900 transition-colors">
                      <FiStar size={14} className="fill-amber-500 text-amber-500" />
                      <span className="font-black text-sm text-neutral-900 group-hover:text-white tracking-tighter">{(item.avgRating || 0).toFixed(1)}</span>
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
