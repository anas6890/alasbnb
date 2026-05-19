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
import { TbMessageCircle } from "react-icons/tb";

type Props = {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
};

function TripsClient({ reservations, currentUser }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState("");

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
      <div className="pt-24 pb-12">
        <Heading
          title="Vos voyages"
          subtitle="Où vous êtes allé et où vous irez"
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {reservations.map((reservation) => {
            const isPast = reservation.checkOut && new Date(reservation.checkOut) < new Date();

            // Logic to display cancellation policy string
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
                data={reservation.listing as any}
                reservation={reservation}
                actionId={reservation.id}
                onAction={onCancel}
                disabled={deletingId === reservation.id}
                actionLabel="Annuler la réservation"
                currentUser={currentUser}
              >
                <div className="flex flex-col gap-2 mt-2 px-1">
                  {!isPast && (
                    <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-md border border-neutral-100 italic">
                      <span className="font-semibold not-italic">Politique : </span>
                      {renderPolicy(reservation.cancellationPolicy)}
                    </div>
                  )}
                  <Link href={`/messages/${reservation.id}`} onClick={(e) => e.stopPropagation()}>
                    <div className="w-full bg-teal-50 border border-teal-500 text-teal-600 font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-100 transition">
                      <TbMessageCircle size={20} /> Contacter l&apos;hôte
                    </div>
                  </Link>
                  {isPast && <ReviewInput reservationId={reservation.id} />}
                </div>
              </ListingCard>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

export default TripsClient;
