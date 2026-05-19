import Container from "@/components/Container";
import Heading from "@/components/Heading";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";
import getReservations from "../actions/getReservations";
import { FiHome, FiDollarSign, FiCalendar, FiStar } from "react-icons/fi";

export default async function HostingPage() {
  const currentUser = await getCurrentUser();
  const listings = await getListings({ userId: currentUser?.id });
  const reservations = await getReservations({ authorId: currentUser?.id }); // Reservations of host listings

  const totalEarnings = reservations.reduce((acc, res) => acc + (res.totalPrice || 0), 0);
  const activeListings = listings.filter(l => l.status === "PUBLISHED").length;

  const stats = [
    { label: "Revenus totaux", value: `€${totalEarnings}`, icon: FiDollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Annonces actives", value: activeListings, icon: FiHome, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Réservations", value: reservations.length, icon: FiCalendar, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Note moyenne", value: "4.9", icon: FiStar, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <Container>
      <div className="pt-8">
        <Heading
          title={`Bienvenue, ${currentUser?.firstname}`}
          subtitle="Voici un aperçu de votre activité d'hôte."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-neutral-800">Réservations récentes</h3>
            {reservations.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">Aucune réservation pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {reservations.slice(0, 5).map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                         {res.listing?.images?.[0] && <img src={res.listing.images[0]} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-800">{res.listing?.title}</p>
                        <p className="text-xs text-neutral-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-neutral-900">€{res.totalPrice}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {res.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 text-neutral-800">Vos annonces performantes</h3>
             {listings.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">Vous n'avez pas encore d'annonces.</p>
            ) : (
              <div className="space-y-4">
                {listings.slice(0, 5).map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                         {list.images?.[0] && <img src={list.images[0]} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-800">{list.title}</p>
                        <p className="text-xs text-neutral-500">{list.location.city}, {list.location.country}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1 text-amber-600">
                      <FiStar size={14} />
                      <span className="font-bold text-sm">{(list.avgRating || 0).toFixed(1)}</span>
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
