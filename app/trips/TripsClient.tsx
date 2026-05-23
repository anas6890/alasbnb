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
import { FiX, FiStar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/EmptyState";

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
  const [viewType, setViewType] = useState<"LISTING" | "EXPERIENCE">("LISTING");

  const getIsPast = (r: any) => {
    // Si la réservation est explicitement marquée comme terminée, elle va dans l'historique
    if (r.status === "COMPLETED") return true;

    // Si elle est en attente ou confirmée, elle reste dans "À venir / En cours" 
    // même si la date de début est passée (car le séjour n'est pas encore "fini" administrativement)
    if (r.status === "PENDING" || r.status === "CONFIRMED") return false;

    // Pour les autres cas (ex: r.status est undefined ou autre), on vérifie la date
    if (r.type === "EXPERIENCE" && r.session) {
      return new Date(r.session.dateTime) < new Date();
    }
    return r.checkOut && new Date(r.checkOut) < new Date();
  };

  const filteredReservations = reservations.filter((r) => r.type === viewType && r.status !== "CANCELLED");
  const upcomingTrips = filteredReservations.filter((r) => !getIsPast(r));
  const pastTrips = filteredReservations.filter((r) => getIsPast(r));

  const [isLoading, setIsLoading] = useState(false);

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
           const lang = useLanguage.getState().language || "en";
           const t = translations[lang as keyof typeof translations] || translations.en;
           toast.info(t.reservation_cancelled);
          router.refresh();
        })
        .catch((error) => {
          const lang = useLanguage.getState().language || "en";
          const t = translations[lang as keyof typeof translations] || translations.en;
          toast.error(error?.response?.data?.error || t.error_occurred);
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  const onContact = useCallback(async (id: string, type: string, hostId: string) => {
    setIsLoading(true);
    try {
        const response = await axios.post("/api/contact", {
            listingId: type === "LISTING" ? id : null,
            experienceId: type === "EXPERIENCE" ? id : null,
            hostId: hostId,
            content: "Bonjour ! Je vous contacte concernant ma réservation."
        });

        const conversationId = response.data.id;
        router.push(`/messages?selected=${conversationId}`);
    } catch (error) {
        toast.error("Impossible d'ouvrir la messagerie");
    } finally {
        setIsLoading(false);
    }
  }, [router]);

  return (
    <Container>
      <div className="pt-4 pb-20 max-w-6xl mx-auto">
        
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
                  <h3 className="text-lg font-bold text-teal-900">{t.reservation_confirmed_banner}</h3>
                  <p className="text-teal-800/80 font-medium text-sm">
                    {t.trips_subtitle}
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

        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {t.trips_title}
          </h1>
          <p className="text-neutral-500 font-medium">{t.trips_subtitle}</p>
        </div>

        {/* Tabs for Stays / Experiences */}
        <div className="flex gap-4 mb-10 border-b border-neutral-200">
            <button
                className={`pb-4 px-6 text-lg font-bold transition border-b-4 ${viewType === "LISTING" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                onClick={() => setViewType("LISTING")}
            >
                {t.logements}
            </button>
            <button
                className={`pb-4 px-6 text-lg font-bold transition border-b-4 ${viewType === "EXPERIENCE" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                onClick={() => setViewType("EXPERIENCE")}
            >
                {t.experiences}
            </button>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="py-20">
            <EmptyState
                title={viewType === "LISTING" ? t.no_listing : t.no_experience}
                subtitle={viewType === "LISTING" ? t.no_listing_desc : t.no_experience_desc}
            />
          </div>
        ) : (
            <>
                {/* 1. Réservations en cours / À venir */}
                <div className="mb-20">
                    <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-neutral-900 rounded-lg">
                            <TbMapSearch className="text-white" size={24} />
                        </div>
                        {t.trips_upcoming_header}
                    </h2>
                    
                    {upcomingTrips.length === 0 ? (
                        <p className="text-neutral-500 font-medium bg-neutral-50 p-8 rounded-2xl border border-dashed border-neutral-200 text-center">
                            {t.trips_no_upcoming}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {upcomingTrips.map((reservation) => {
                            const isExperience = reservation.type === "EXPERIENCE";
                            const itemData = isExperience ? reservation.session?.experience : reservation.listing;

                            return (
                            <ListingCard
                                key={reservation.id}
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
                                            onClick={() => onContact(itemData?.id || "", reservation.type, (itemData as any)?.hostId || (itemData as any)?.user?.id)}
                                            className="flex-1 bg-neutral-900 text-white rounded-xl py-3 font-bold text-sm text-center hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                        >
                                            <TbMessageCircle size={20} />
                                            {t.host_reservations_send_message}
                                        </button>
                                        <button
                                            className="p-3 bg-white text-rose-500 border-2 border-rose-100 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50"
                                            onClick={() => onCancel(reservation.id)}
                                            disabled={deletingId === reservation.id}
                                            title={t.cancel}
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-center font-bold text-neutral-400 uppercase tracking-widest">
                                        {t.reservation_label} {t[`status_${reservation.status.toLowerCase()}` as string]}
                                    </div>
                                </div>
                            </ListingCard>
                            );
                        })}
                        </div>
                    )}
                </div>

                {/* 2. Historique des voyages */}
                <div className="pt-12 border-t-2 border-neutral-100">
                    <h2 className="text-2xl font-black text-neutral-900 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 rounded-lg text-neutral-600">
                            <TbClock size={24} />
                        </div>
                        {t.trips_history}
                    </h2>
                    
                    {pastTrips.length === 0 ? (
                        <p className="text-neutral-500 font-medium bg-neutral-50 p-8 rounded-2xl border border-dashed border-neutral-200 text-center">
                            {t.trips_history_empty}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {pastTrips.map((reservation) => {
                            const isExperience = reservation.type === "EXPERIENCE";
                            const itemData = isExperience ? reservation.session?.experience : reservation.listing;
                            const isReviewing = reviewingId === reservation.id;

                            return (
                            <div key={reservation.id} className="flex flex-col gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none rounded-2xl transition group-hover:bg-transparent" />
                                    <ListingCard
                                        data={itemData as any}
                                        reservation={reservation}
                                        currentUser={currentUser}
                                        isExperience={isExperience}
                                    />
                                </div>
                                
                                <div className="z-20">
                                    {isReviewing ? (
                                        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                                            <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200">
                                                <ReviewInput 
                                                    reservationId={reservation.id}
                                                    onCancel={() => setReviewingId("")} 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setReviewingId(reservation.id)}
                                            className="w-full bg-white text-neutral-900 border-2 border-neutral-900 rounded-xl py-3 font-bold text-sm hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm group"
                                        >
                                            <FiStar className="text-amber-500 group-hover:fill-amber-500" size={18} />
                                            {t.leave_review}
                                        </button>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </Container>
  );
}

export default TripsClient;
