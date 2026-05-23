"use client";

import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FiCheck, FiX, FiMessageSquare, FiCalendar, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">("ALL");

  const filteredReservations = useMemo(() => {
    if (activeFilter === "ALL") return reservations;
    return reservations.filter(r => r.status === activeFilter);
  }, [reservations, activeFilter]);

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

  const onContact = useCallback(async (guestId: string, listingId?: string | null, experienceId?: string | null) => {
    setProcessingId("contact-" + guestId);
    try {
        const response = await axios.post("/api/contact", {
            listingId,
            experienceId,
            hostId: currentUser?.id, 
            guestId, 
            content: "Bonjour ! Je reviens vers vous concernant votre réservation."
        });
        router.push(`/messages?selected=${response.data.id}`);
    } catch (error) {
        toast.error("Impossible d'ouvrir la messagerie");
    } finally {
        setProcessingId("");
    }
  }, [router, currentUser?.id]);

  const bookedDates = useMemo(() => {
    const dates: Date[] = [];
    reservations.forEach((res) => {
        if (res.status === "CONFIRMED") {
            if (res.type === "LISTING" && res.checkIn && res.checkOut) {
                let current = new Date(res.checkIn);
                while (current < new Date(res.checkOut)) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }
            } else if (res.type === "EXPERIENCE" && res.session?.dateTime) {
                dates.push(new Date(res.session.dateTime));
            }
        }
    });
    return dates;
  }, [reservations]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2 italic underline decoration-brand-500 decoration-4 underline-offset-4">Réservations</h1>
          <p className="text-neutral-500 font-medium">Suivez et gérez l&apos;ensemble de vos demandes entrantes.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm shadow-neutral-200/50">
            <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${viewMode === 'list' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
                <FiCheckCircle size={18} />
                Vue Liste
            </button>
            <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${viewMode === 'calendar' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
                <FiCalendar size={18} />
                Calendrier
            </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {["ALL", "PENDING", "CONFIRMED"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter as any)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${activeFilter === filter ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                    >
                        {filter === 'ALL' ? 'Toutes' : filter === 'PENDING' ? 'En attente' : 'Confirmées'}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                {filteredReservations.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center gap-6">
                        <div className="p-6 bg-neutral-50 rounded-full text-neutral-200 border border-neutral-100">
                            <FiClock size={48} />
                        </div>
                        <p className="text-xl font-black text-neutral-900 italic">Aucune réservation trouvée</p>
                    </div>
                ) : (
                    filteredReservations.map((reservation) => {
                        const isExperience = reservation.type === "EXPERIENCE";
                        const imageUrl = isExperience ? reservation.session?.experience?.images?.[0] : reservation.listing?.images?.[0];
                        const title = isExperience ? reservation.session?.experience?.title : reservation.listing?.title;
                            
                        return (
                            <div key={reservation.id} className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden hover:shadow-xl transition-all duration-500 group">
                                <div className="flex flex-col md:flex-row">
                                    <div className="relative w-full md:w-[350px] h-[250px] md:h-auto overflow-hidden">
                                        <Image src={imageUrl || "/images/placeholder.jpg"} alt="listing" fill className="object-cover group-hover:scale-105 transition duration-700" />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md ${
                                                reservation.status === 'PENDING' ? 'bg-amber-500/90 text-white' : 
                                                reservation.status === 'CONFIRMED' ? 'bg-teal-500/90 text-white' : 'bg-neutral-800/90 text-white'
                                            }`}>
                                                {reservation.status === 'PENDING' ? 'En attente' : 
                                                reservation.status === 'CONFIRMED' ? 'Confirmée' : 'Terminée'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isExperience ? 'text-teal-600' : 'text-brand-600'}`}>
                                                        {isExperience ? 'Expérience' : 'Logement'}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-neutral-900 line-clamp-1">{title}</h3>
                                                </div>
                                                <div className="bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100">
                                                    <span className="text-xl font-black text-neutral-900 tracking-tighter">€{reservation.totalPrice}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-6 py-6 border-y border-neutral-50 my-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Date de séjour</span>
                                                    <span className="text-[15px] font-black text-neutral-800">
                                                        {isExperience 
                                                            ? format(new Date(reservation.session?.dateTime!), "d MMM yyyy 'à' HH:mm", { locale: fr })
                                                            : `${format(new Date(reservation.checkIn!), "d MMM")} - ${format(new Date(reservation.checkOut!), "d MMM yyyy")}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Voyageur</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full overflow-hidden relative border border-neutral-200">
                                                            <Image src={reservation.user?.image || "/images/placeholder.jpg"} fill alt="avatar" className="object-cover" />
                                                        </div>
                                                        <span className="text-[15px] font-black text-neutral-800">{reservation.user?.firstname} {reservation.user?.lastname}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <button 
                                                disabled={processingId === "contact-" + reservation.userId}
                                                onClick={() => onContact(reservation.userId, reservation.listingId, reservation.sessionId)}
                                                className="flex items-center gap-2 text-sm font-black text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-widest group/btn"
                                            >
                                                <FiMessageSquare size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                                Envoyer un message
                                            </button>

                                            <div className="flex items-center gap-3">
                                                {reservation.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            disabled={processingId === reservation.id}
                                                            onClick={() => updateStatus(reservation.id, 'CANCELLED')}
                                                            className="p-3 text-rose-500 border-2 border-rose-50 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition shadow-sm active:scale-90"
                                                        >
                                                            <FiX size={20} />
                                                        </button>
                                                        <button
                                                            disabled={processingId === reservation.id}
                                                            onClick={() => updateStatus(reservation.id, 'CONFIRMED')}
                                                            className="flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition shadow-lg shadow-neutral-200 active:scale-95"
                                                        >
                                                            <FiCheck size={20} />
                                                            Accepter
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
      ) : (
        <div className="bg-white p-10 md:p-16 rounded-[40px] border border-neutral-100 shadow-sm flex flex-col lg:flex-row gap-16 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex-none flex flex-col items-center">
                <div className="p-4 bg-neutral-50 rounded-[32px] border border-neutral-100 shadow-inner">
                    <DayPicker mode="multiple" selected={bookedDates} locale={fr as any} modifiers={{ booked: bookedDates }} modifiersStyles={{ booked: { color: "white", backgroundColor: "#FF385C", fontWeight: "900", borderRadius: "12px" } }} />
                </div>
                <div className="mt-8 flex items-center gap-3 bg-rose-50 px-6 py-2.5 rounded-full border border-rose-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF385C] shadow-[0_0_10px_rgba(255,56,92,0.5)] animate-pulse" />
                    <span className="text-xs font-black text-rose-600 uppercase tracking-widest italic">Dates occupées</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-neutral-900 italic">Journal des occupations</h3>
                    <p className="text-neutral-400 font-medium">Détail des séjours confirmés pour vos annonces.</p>
                </div>
                
                <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                    {reservations.filter(res => res.status === "CONFIRMED").length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                            <FiCalendar size={48} />
                            <p className="font-bold uppercase tracking-widest text-xs">Aucune confirmation</p>
                        </div>
                    ) : (
                        reservations
                            .filter(res => res.status === "CONFIRMED")
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(res => (
                                <div key={res.id} className="p-6 rounded-[28px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-500 flex justify-between items-center group">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase text-neutral-400 italic">
                                            {res.type === "LISTING" ? "Séjour" : "Expérience"}
                                        </span>
                                        <span className="font-black text-neutral-900 line-clamp-1">{res.type === "LISTING" ? res.listing?.title : res.session?.experience?.title}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FiCalendar size={14} className="text-brand-500" />
                                            <span className="text-xs font-bold text-neutral-500">
                                                {res.type === "LISTING" 
                                                    ? `${format(new Date(res.checkIn!), "d MMM")} - ${format(new Date(res.checkOut!), "d MMM")}`
                                                    : format(new Date(res.session?.dateTime!), "d MMM 'à' HH:mm")
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-black text-lg text-neutral-900 tracking-tighter">€{res.totalPrice}</span>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-neutral-100 shadow-sm">
                                            <div className="w-4 h-4 rounded-full relative overflow-hidden flex-none">
                                                <Image src={res.user?.image || "/images/placeholder.jpg"} fill alt="u" className="object-cover" />
                                            </div>
                                            <span className="text-[10px] font-black text-neutral-800 uppercase tracking-tighter">{res.user?.firstname}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HostReservationsClient;
