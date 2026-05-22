"use client";

import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { TbMessageCircle } from "react-icons/tb";

import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
};

function ReservationsClient({ reservations, currentUser }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [activeTab, setActiveTab] = useState<"LISTING" | "EXPERIENCE">("LISTING");

  const filteredReservations = reservations.filter(r => r.type === activeTab);

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

  const onConfirm = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      setConfirmingId(id);

      axios
        .patch(`/api/reservations/${id}`, { status: "CONFIRMED" })
        .then(() => {
          toast.success("Réservation confirmée !");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error || "Erreur de confirmation");
        })
        .finally(() => {
          setConfirmingId("");
        });
    },
    [router]
  );

  return (
    <Container>
      <div className="pt-4 pb-12">
        <Heading title="Réservations" subtitle="Gérez les réservations de vos propriétés et expériences" />
        
        <div className="flex flex-row gap-4 mt-8 border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("LISTING")}
            className={`pb-3 font-semibold transition-all ${
              activeTab === "LISTING" 
                ? "border-b-2 border-neutral-900 text-neutral-900" 
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Logements
          </button>
          <button
            onClick={() => setActiveTab("EXPERIENCE")}
            className={`pb-3 font-semibold transition-all ${
              activeTab === "EXPERIENCE" 
                ? "border-b-2 border-neutral-900 text-neutral-900" 
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Expériences
          </button>
        </div>

        {filteredReservations.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 font-medium">
            Aucune réservation trouvée pour cette catégorie.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredReservations.map((reservation) => {
              const isExperience = reservation.type === "EXPERIENCE";
              const data = isExperience ? reservation.session?.experience : reservation.listing;

              return (
                <ListingCard
                  key={reservation.id}
                  data={data as any}
                  reservation={reservation}
                  actionId={reservation.id}
                  onAction={onCancel}
                  disabled={deletingId === reservation.id || confirmingId === reservation.id}
                  actionLabel="Annuler la réservation"
                  currentUser={currentUser}
                  isExperience={isExperience}
                >
                  <div className="flex flex-col gap-2 mt-2 px-1">
                    {reservation.status === "PENDING" && (
                      <button
                        onClick={(e) => onConfirm(e, reservation.id)}
                        disabled={confirmingId === reservation.id || deletingId === reservation.id}
                        className="w-full bg-neutral-900 border border-neutral-900 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 transition"
                      >
                        Confirmer l&apos;offre
                      </button>
                    )}
                    <Link href={`/messages/${reservation.id}`} onClick={(e) => e.stopPropagation()}>
                      <div className="w-full bg-teal-50 border border-teal-500 text-teal-600 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-100 transition">
                        <TbMessageCircle size={20} /> Message au voyageur
                      </div>
                    </Link>
                  </div>
                </ListingCard>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}

export default ReservationsClient;
