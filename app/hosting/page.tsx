import Container from "@/components/Container";
import Heading from "@/components/Heading";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";
import getReservations from "../actions/getReservations";
import getExperiences from "../actions/getExperiences";
import { FiHome, FiDollarSign, FiCalendar, FiStar, FiActivity } from "react-icons/fi";
import Image from "next/image";

export default async function HostingPage() {
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
    { label: "Revenus totaux", value: `€${totalEarnings}`, icon: FiDollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Annonces actives", value: activeListings, icon: FiHome, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Expériences actives", value: activeExperiences, icon: FiActivity, color: "text-teal-600", bg: "bg-teal-100" },
  ];

  return (
    <Container>
      <div className="pt-8 pb-20">
        <Heading
          title={`Bienvenue, ${currentUser?.firstname}`}
          subtitle="Voici un aperçu global de votre activité d&apos;hôte."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[24px] border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className="text-[11px] text-neutral-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-neutral-900 tracking-tighter">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Recent Bookings */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black mb-8 text-neutral-900 italic flex items-center gap-3">
              <div className="w-8 h-1 bg-brand-500 rounded-full"></div>
              Réservations récentes
            </h3>
            {reservations.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-4 bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aucune réservation pour le moment</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reservations.slice(0, 5).map((res) => {
                  const imageUrl = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.image : res.listingSnapshot?.image;
                  const title = res.type === 'EXPERIENCE' ? res.experienceSnapshot?.title : res.listingSnapshot?.title;

                  return (
                    <div key={res.id} className="flex items-center justify-between p-5 rounded-[24px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-500 group">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-neutral-200 rounded-[18px] overflow-hidden relative shadow-sm group-hover:rotate-2 transition-transform">
                           {imageUrl && <Image src={imageUrl} alt="preview" fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-black text-[15px] text-neutral-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{title}</p>
                          <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${res.type === 'EXPERIENCE' ? 'bg-teal-500 text-white' : 'bg-brand-500 text-white'}`}>
                                {res.type === 'EXPERIENCE' ? 'Exp' : 'Log'}
                              </span>
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                {new Date(res.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-black text-lg text-neutral-900 tracking-tighter">€{res.totalPrice}</p>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm ${
                            res.status === 'CONFIRMED' ? 'bg-teal-500 text-white' : 
                            res.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-neutral-300 text-white'
                        }`}>
                          {res.status === 'CONFIRMED' ? 'Payé' : res.status === 'PENDING' ? 'Attente' : res.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-black mb-8 text-neutral-900 italic flex items-center gap-3">
              <div className="w-8 h-1 bg-amber-500 rounded-full"></div>
              Meilleures notes
            </h3>
             {allHostItems.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-4 bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Vous n&apos;avez pas encore d&apos;annonces</p>
              </div>
            ) : (
              <div className="space-y-5">
                {allHostItems
                    .filter(i => i.avgRating > 0)
                    .sort((a, b) => b.avgRating - a.avgRating)
                    .slice(0, 5)
                    .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 rounded-[24px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-500 group">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-neutral-200 rounded-[18px] overflow-hidden relative shadow-sm group-hover:-rotate-2 transition-transform">
                         {item.images?.[0] && <Image src={item.images[0]} alt="preview" fill className="object-cover" />}
                      </div>
                      <div>
                        <p className="font-black text-[15px] text-neutral-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{item.title}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                            {item.location.city}, {item.location.country}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-neutral-100 group-hover:scale-105 transition-transform">
                      <FiStar size={18} className="fill-amber-500 text-amber-500" />
                      <span className="font-black text-lg text-neutral-900 tracking-tighter">{(item.avgRating || 0).toFixed(1)}</span>
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
