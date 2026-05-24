"use client";

import Container from "@/components/Container";
import ListingCard from "@/components/listing/ListingCard";
import ReviewInput from "@/components/listing/ReviewInput";
import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import Link from "next/link";
import { TbMessageCircle, TbCheck, TbMapSearch, TbClock } from "react-icons/tb";
import { FiX, FiStar, FiHome, FiCompass, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CancelReservationModal from "@/components/models/CancelReservationModal";
import { IoIosAirplane } from "react-icons/io";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
  isSuccess?: boolean;
};

function TripsClient({ reservations, currentUser, isSuccess }: Props) {
  const router = useRouter();
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;
  const [deletingId, setDeletingId] = useState("");
  const [showBanner, setShowBanner] = useState(isSuccess);
  const [reviewingId, setReviewingId] = useState("");
  const [cancellingReservation, setCancellingReservation] = useState<SafeReservation | null>(null);
  const [activeTab, setActiveTab] = useState<"LISTING" | "EXPERIENCE">("LISTING");

  const getIsPast = (r: any) => {
    if (r.status === "COMPLETED") return true;
    if (r.status === "PENDING" || r.status === "CONFIRMED") return false;
    if (r.type === "EXPERIENCE" && r.session) {
      return new Date(r.session.dateTime) < new Date();
    }
    return r.checkOut && new Date(r.checkOut) < new Date();
  };

  const filteredReservations = reservations.filter((r) => r.type === activeTab && r.status !== "CANCELLED");
  const upcomingTrips = filteredReservations.filter((r) => !getIsPast(r));
  const pastTrips = filteredReservations.filter((r) => getIsPast(r));

  const [isLoading, setIsLoading] = useState(false);

  const confirmCancel = useCallback(() => {
    if (!cancellingReservation) return;
    setDeletingId(cancellingReservation.id);
    axios
      .post(`/api/reservations/${cancellingReservation.id}/cancel`, { reason: 'Guest cancelled' })
      .then(() => {
        toast.info(t.reservation_cancelled || "Réservation annulée.");
        setCancellingReservation(null);
        router.refresh();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || t.error_occurred || "Une erreur est survenue.");
      })
      .finally(() => setDeletingId(""));
  }, [router, cancellingReservation, t]);

  const onContact = useCallback(async (id: string, type: string, hostId: string) => {
    setIsLoading(true);
    try {
        const response = await axios.post("/api/contact", {
            listingId: type === "LISTING" ? id : null,
            experienceId: type === "EXPERIENCE" ? id : null,
            hostId: hostId,
            content: "Bonjour ! Je vous contacte concernant ma réservation."
        });
        router.push(`/messages?selected=${response.data.id}`);
    } catch (error) {
        toast.error("Impossible d'ouvrir la messagerie");
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 font-sans">
      <CancelReservationModal
        isOpen={!!cancellingReservation}
        reservation={cancellingReservation}
        onClose={() => setCancellingReservation(null)}
        onConfirm={confirmCancel}
        isLoading={deletingId === cancellingReservation?.id}
      />

      {/* Clean Brand Header (Matches FavoritesClient) */}
      <div className="bg-white border-b border-neutral-200 pt-6 pb-10">
        <Container>
          <AnimatePresence>
            {showBanner && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm relative">
                  <div className="bg-teal-500 rounded-full p-2 flex-shrink-0 mt-0.5">
                    <TbCheck className="text-white text-xl" />
                  </div>
                  <div className="flex flex-col gap-1 pr-8">
                    <h3 className="text-lg font-bold text-teal-900">{t.reservation_confirmed_banner || 'Réservation confirmée'}</h3>
                    <p className="text-teal-800/80 font-medium text-sm">
                      {t.trips_subtitle || "Suivez vos voyages en cours et retrouvez vos souvenirs passés."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowBanner(false)}
                    className="absolute top-4 right-4 text-teal-500 hover:bg-teal-100 p-1.5 rounded-full transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-500 w-fit border border-rose-100">
                <IoIosAirplane size={16} />
                <span className="text-xs font-bold tracking-wider uppercase">Voyages</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
                {t.trips_title || 'Mes Réservations'}
              </h1>
              <p className="text-neutral-500 font-medium max-w-xl text-lg">
                {t.trips_subtitle || 'Suivez vos voyages en cours et retrouvez vos souvenirs passés.'}
              </p>
            </div>

            {/* Brand-themed Tabs */}
            <div className="flex items-center gap-2 bg-neutral-100/50 p-1.5 rounded-2xl border border-neutral-200">
              <button
                onClick={() => setActiveTab("LISTING")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "LISTING" 
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200" 
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <FiHome size={18} />
                <span>{t.logements || 'Logements'}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("EXPERIENCE")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "EXPERIENCE" 
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200" 
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <FiCompass size={18} />
                <span>{t.experiences || 'Expériences'}</span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <div className="pt-12">
        <Container>
          {filteredReservations.length === 0 ? (
            /* Clean Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-neutral-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
              <div className="w-24 h-24 mb-6 rounded-full bg-rose-50 flex items-center justify-center shadow-inner relative border border-rose-100">
                <IoIosAirplane size={40} className="text-rose-500" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3 text-center">
                {t.trips_empty_title || "Aucun voyage prévu"}
              </h3>
              <p className="text-neutral-500 text-center max-w-md mb-8 font-medium">
                {t.trips_empty_subtitle || "Vous n'avez effectué aucune réservation pour le moment. Trouvez l'inspiration pour votre prochain séjour !"}
              </p>
              
              <Link href={activeTab === "LISTING" ? "/" : "/experiences"} className="group flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_8px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.35)] hover:-translate-y-1 transition-all duration-300">
                <span>{t.explore_button || 'Explorer maintenant'}</span>
                <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-16">
              {/* 1. Upcoming Trips (Always Visible) */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-neutral-100 rounded-xl border border-neutral-200">
                        <TbMapSearch className="text-neutral-600" size={24} />
                    </div>
                    {t.trips_upcoming_header || 'En cours et à venir'}
                </h2>
                
                {upcomingTrips.length === 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 text-center text-neutral-500 font-medium">
                        {t.trips_no_upcoming || "Vous n'avez aucun voyage prévu pour le moment."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                      {upcomingTrips.map((reservation) => {
                          const isExperience = reservation.type === "EXPERIENCE";
                          const itemData = isExperience ? reservation.session?.experience : reservation.listing;

                          return (
                          <div key={reservation.id} className="group">
                            <ListingCard
                                data={itemData as any}
                                reservation={reservation}
                                disabled={deletingId === reservation.id}
                                currentUser={currentUser}
                                isExperience={isExperience}
                            >
                                <div className="flex flex-col gap-3 mt-4">
                                    <div className="flex items-center gap-2 w-full">
                                        <button
                                            disabled={isLoading}
                                            onClick={(e) => {
                                                e.stopPropagation(); e.preventDefault();
                                                onContact(itemData?.id || "", reservation.type, (itemData as any)?.hostId || (itemData as any)?.user?.id);
                                            }}
                                            className="flex-1 bg-neutral-900 text-white rounded-xl py-2.5 font-bold text-sm text-center hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                        >
                                            <TbMessageCircle size={18} />
                                            Message
                                        </button>
                                        <button
                                            className="p-2.5 bg-white text-rose-500 border border-rose-200 rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50"
                                            onClick={(e) => {
                                                e.stopPropagation(); e.preventDefault();
                                                setCancellingReservation(reservation);
                                            }}
                                            disabled={deletingId === reservation.id}
                                            title={t.cancel || "Annuler"}
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-center font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 py-1.5 rounded-lg border border-neutral-200">
                                        {t.reservation_label || "Réservation"} {t[`status_${reservation.status.toLowerCase()}` as string] || reservation.status}
                                    </div>
                                </div>
                            </ListingCard>
                          </div>
                          );
                      })}
                    </div>
                )}
              </div>

              {/* 2. Past Trips (Always Visible) */}
              <div className="pt-12 border-t border-neutral-200">
                  <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 text-neutral-600">
                          <TbClock size={24} />
                      </div>
                      {t.trips_history || 'Historique'}
                  </h2>
                  
                  {pastTrips.length === 0 ? (
                      <div className="bg-white border border-neutral-200 rounded-[2rem] p-8 text-center text-neutral-500 font-medium">
                          {t.trips_history_empty || "Vous n'avez pas encore d'historique de voyage."}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                      {pastTrips.map((reservation) => {
                          const isExperience = reservation.type === "EXPERIENCE";
                          const itemData = isExperience ? reservation.session?.experience : reservation.listing;
                          const isReviewing = reviewingId === reservation.id;

                          return (
                          <div key={reservation.id} className="flex flex-col gap-4 group">
                              <div className="relative">
                                  <div className="absolute inset-0 bg-white/20 z-10 pointer-events-none rounded-[2rem] transition group-hover:bg-transparent" />
                                  <ListingCard
                                      data={itemData as any}
                                      reservation={reservation}
                                      currentUser={currentUser}
                                      isExperience={isExperience}
                                  />
                              </div>
                              
                              <div className="z-20 mt-2">
                                  {isReviewing ? (
                                      <div className="fixed inset-0 bg-neutral-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                                          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200 shadow-2xl">
                                              <ReviewInput 
                                                  reservationId={reservation.id}
                                                  onCancel={() => setReviewingId("")} 
                                              />
                                          </div>
                                      </div>
                                  ) : (
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation(); e.preventDefault();
                                              setReviewingId(reservation.id);
                                          }}
                                          className="w-full bg-white text-neutral-900 border border-neutral-300 rounded-xl py-2.5 font-bold text-sm hover:border-neutral-900 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                      >
                                          <FiStar className="text-amber-500 fill-amber-500" size={16} />
                                          {t.leave_review || 'Laisser un avis'}
                                      </button>
                                  )}
                              </div>
                          </div>
                          );
                      })}
                    </div>
                  )}
              </div>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default TripsClient;
