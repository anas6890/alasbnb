"use client";

import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FiCheck, FiX, FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

import Container from "@/components/Container";
import Heading from "@/components/Heading";

interface HostReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const HostReservationsClient: React.FC<HostReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState("");

  const updateStatus = useCallback((id: string, status: string) => {
    setProcessingId(id);

    axios.patch(`/api/reservations/${id}`, { status })
      .then(() => {
        toast.success(`Réservation ${status === 'CONFIRMED' ? 'confirmée' : 'refusée'}`);
        router.refresh();
      })
      .catch(() => {
        toast.error("Une erreur est survenue");
      })
      .finally(() => {
        setProcessingId("");
      });
  }, [router]);

  return (
    <Container>
      <div className="pt-8">
        <Heading
          title="Réservations reçues"
          subtitle="Gérez les demandes de réservation pour vos annonces."
        />
        
        <div className="mt-10 flex flex-col gap-6">
          {reservations.map((reservation) => (
            <div 
              key={reservation.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative w-full md:w-[300px] h-[200px] md:h-auto overflow-hidden">
                  <Image
                    src={reservation.listing?.images?.[0] || ""}
                    alt="listing"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`
                      text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm
                      ${reservation.status === 'PENDING' ? 'bg-amber-500 text-white' : ''}
                      ${reservation.status === 'CONFIRMED' ? 'bg-teal-500 text-white' : ''}
                      ${reservation.status === 'CANCELLED' ? 'bg-rose-500 text-white' : ''}
                    `}>
                      {reservation.status === 'PENDING' ? 'En attente' : 
                       reservation.status === 'CONFIRMED' ? 'Confirmée' : 'Refusée/Annulée'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-neutral-800 line-clamp-1">
                        {reservation.listing?.title}
                      </h3>
                      <div className="text-lg font-bold text-teal-600">
                        €{reservation.totalPrice}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-sm text-neutral-500 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-800">Dates :</span>
                        {reservation.checkIn && reservation.checkOut && (
                          <span>
                            {format(new Date(reservation.checkIn), "d MMM yyyy", { locale: fr })} - {format(new Date(reservation.checkOut), "d MMM yyyy", { locale: fr })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-800">Voyageur :</span>
                        <span>{reservation.user?.firstname} {reservation.user?.lastname}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-4">
                       <Link 
                         href={`/messages/${reservation.id}`}
                         className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-teal-600 transition"
                       >
                         <FiMessageSquare size={18} />
                         Contacter
                       </Link>
                    </div>

                    <div className="flex items-center gap-3">
                      {reservation.status === 'PENDING' && (
                        <>
                          <button
                            disabled={processingId === reservation.id}
                            onClick={() => updateStatus(reservation.id, 'CANCELLED')}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-500 border border-rose-500 rounded-xl hover:bg-rose-50 transition disabled:opacity-50"
                          >
                            <FiX size={18} />
                            Refuser
                          </button>
                          <button
                            disabled={processingId === reservation.id}
                            onClick={() => updateStatus(reservation.id, 'CONFIRMED')}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-teal-500 rounded-xl hover:bg-teal-600 transition shadow-sm disabled:opacity-50"
                          >
                            <FiCheck size={18} />
                            Accepter
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default HostReservationsClient;
