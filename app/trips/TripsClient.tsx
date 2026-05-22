"use client";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import ReviewInput from "@/components/listing/ReviewInput";
import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { TbMessageCircle, TbCheck, TbMapSearch, TbClock } from "react-icons/tb";
import { FiX, FiStar } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/EmptyState";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
  isSuccess?: boolean;
  viewType?: "LISTING" | "EXPERIENCE";
};

function TripsClient({ reservations, currentUser, isSuccess, viewType = "LISTING" }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [showBanner, setShowBanner] = useState(isSuccess);
  const [reviewingId, setReviewingId] = useState("");

  const getIsPast = (r: any) => {
    if (r.status === "PENDING" && !r.checkIn) return false; // Inquiries stay in upcoming
    if (r.type === "EXPERIENCE" && r.session) {
      return new Date(r.session.dateTime) < new Date();
    }
    return r.checkOut && new Date(r.checkOut) < new Date();
  };

  const filteredReservations = reservations.filter((r) => r.type === viewType);
  const upcomingTrips = filteredReservations.filter((r) => !getIsPast(r));
  const pastTrips = filteredReservations.filter((r) => getIsPast(r));

  if (filteredReservations.length === 0) {
    return (
      <EmptyState
        title={`Aucune réservation (${viewType === "EXPERIENCE" ? "Expériences" : "Logements"})`}
        subtitle="Il semble que vous n'ayez réservé aucun voyage de ce type."
      />
    );
  }

  const onCancel = useCallback(
    (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/reservations/${id}`)
        .then(() => {
          toast.info("Reservation cancelled");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error);
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

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
                  <h3 className="text-lg font-bold text-teal-900">Réservation confirmée !</h3>
                  <p className="text-teal-800/80 font-medium text-sm">
                    Votre paiement a bien été reçu et votre voyage est confirmé. Préparez vos valises, l'aventure vous attend !
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

        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            {viewType === "EXPERIENCE" ? "Mes Expériences" : "Mes Réservations"}
          </h1>
          <p className="text-neutral-500 font-medium">Gérez vos aventures à venir et gardez une trace de vos souvenirs.</p>
        </div>

        {/* Voyages à venir */}
        {upcomingTrips.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <TbMapSearch className="text-brand-500" />
              À venir
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {upcomingTrips.map((reservation) => {
                const isExperience = reservation.type === "EXPERIENCE";
                const itemData = isExperience ? reservation.session?.experience : reservation.listing;

                const renderPolicy = (policy?: string) => {
                  switch (policy) {
                    case "MODERATE":
                      return "Remboursement complet (jusqu'à 5 jours avant).";
                    case "STRICT":
                      return "Remboursement de 50% (jusqu'à 7 jours avant).";
                    case "NON_REFUNDABLE":
                      return "Non remboursable.";
                    default:
                      return "Annulation gratuite.";
                  }
                };

                return (
                  <ListingCard
                    key={reservation.id}
                    data={itemData as any}
                    reservation={reservation}
                    disabled={deletingId === reservation.id}
                    currentUser={currentUser}
                    isExperience={isExperience}
                  >
                    {reservation.status === "PENDING" && !reservation.checkIn ? (
                      <div className="flex flex-col gap-2 mt-3 z-10 relative">
                        <div className="text-[11px] text-neutral-500 bg-teal-50 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between">
                          <span className="font-semibold text-teal-700">Demande d'informations</span>
                        </div>
                        <div className="flex flex-row gap-2 w-full mt-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/messages/${reservation.id}`);
                            }}
                            className="flex-1 bg-white border border-neutral-200 text-neutral-800 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:border-neutral-800 transition-all text-sm shadow-sm"
                          >
                            <TbMessageCircle size={18} /> Voir la discussion
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div className="flex flex-col gap-2 mt-3 z-10 relative">
                      <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">Politique d'annulation</span>
                        <span className="truncate max-w-[150px]" title={renderPolicy(reservation.cancellationPolicy)}>
                          {renderPolicy(reservation.cancellationPolicy)}
                        </span>
                      </div>
                      
                      <div className="flex flex-row gap-2 w-full mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/reservations/${reservation.id}/contact`);
                          }}
                          className="flex-1 bg-white border border-neutral-200 text-neutral-800 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:border-neutral-800 transition-all text-sm shadow-sm"
                        >
                          <TbMessageCircle size={18} /> Contacter
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!deletingId) onCancel(reservation.id);
                          }}
                          disabled={deletingId === reservation.id}
                          className="flex-[0.5] bg-white border border-rose-200 text-rose-600 font-semibold py-2.5 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 active:scale-95 disabled:opacity-50 transition-all text-sm shadow-sm"
                        >
                          {deletingId === reservation.id ? "..." : "Annuler"}
                        </button>
                      </div>
                    </div>
                    )}
                  </ListingCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Voyages passés */}
        {pastTrips.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2 pt-6 border-t border-neutral-100">
              <TbClock className="text-neutral-400" />
              Passés
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 opacity-90 hover:opacity-100 transition-opacity">
              {pastTrips.map((reservation) => {
                const isReviewing = reviewingId === reservation.id;
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
                    <div className="flex flex-col gap-2 mt-3 z-10 relative">
                      <div className="flex flex-row gap-2 w-full mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/reservations/${reservation.id}/contact`);
                          }}
                          className="flex-[0.5] bg-white border border-neutral-200 text-neutral-700 font-bold py-2.5 rounded-xl flex items-center justify-center hover:bg-neutral-50 transition-all text-sm"
                        >
                          <TbMessageCircle size={18} />
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewingId(isReviewing ? "" : reservation.id);
                          }}
                          className={`flex-1 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-sm border ${
                            isReviewing 
                              ? 'bg-neutral-800 text-white border-neutral-800' 
                              : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-800'
                          }`}
                        >
                          <FiStar className={isReviewing ? "text-[#f59e0b] fill-[#f59e0b]" : ""} size={16} /> 
                          {isReviewing ? "Fermer l'avis" : "Évaluer mon séjour"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isReviewing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full overflow-hidden"
                          >
                            <ReviewInput reservationId={reservation.id} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ListingCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default TripsClient;
