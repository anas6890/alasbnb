"use client";

import { SafeReservation, SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useCallback, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { usePrice } from "@/hook/usePrice";
import { FiCheck, FiX, FiMessageSquare, FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import CancelReservationModal from "@/components/models/CancelReservationModal";

interface HostReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const HostReservationsClient: React.FC<HostReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const locale = language === "fr" ? fr : enUS;
  const router = useRouter();
  const [processingId, setProcessingId] = useState("");
  const [cancellingReservation, setCancellingReservation] = useState<SafeReservation | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "CONFIRMED">("ALL");

  const filteredReservations = useMemo(() => {
    const validReservations = reservations;
    if (activeFilter === "ALL") return validReservations;
    return validReservations.filter(r => r.status === activeFilter);
  }, [reservations, activeFilter]);

  const confirmCancel = useCallback(() => {
    if (!cancellingReservation) return;
    setProcessingId(cancellingReservation.id);

    axios.post(`/api/reservations/${cancellingReservation.id}/cancel`, { reason: 'Host cancelled' })
      .then(() => {
        toast.success(t.host_reservations_toast_rejected || "Réservation annulée");
        setCancellingReservation(null);
        router.refresh();
      })
      .catch(() => {
        toast.error(t.host_reservations_toast_error);
      })
      .finally(() => {
        setProcessingId("");
      });
  }, [router, t, cancellingReservation]);

  const onContact = useCallback(async (guestId: string, listingId?: string | null, experienceId?: string | null) => {
    setProcessingId("contact-" + guestId);
    try {
        const response = await axios.post("/api/contact", {
            listingId,
            experienceId,
            hostId: currentUser?.id, 
            guestId, 
            content: t.host_reservations_contact_message
        });
        router.push(`/messages?selected=${response.data.id}`);
    } catch (error) {
        toast.error(t.host_reservations_contact_error);
    } finally {
        setProcessingId("");
    }
  }, [router, currentUser?.id]);

  const COLORS = [
    "#FF385C", // Airbnb red
    "#00A699", // Teal
    "#FFB400", // Yellow
    "#8B5CF6", // Violet
    "#3B82F6", // Blue
    "#F97316", // Orange
    "#10B981", // Emerald
    "#EC4899"  // Pink
  ];

  const listingColors = useMemo(() => {
    const map = new Map<string, { title: string; color: string; dates: Date[] }>();
    let colorIndex = 0;
    
    reservations.forEach((res) => {
      if (res.status === "CONFIRMED") {
        const id = res.type === "LISTING" ? res.listingId : res.sessionId;
        const title = res.type === "LISTING" ? res.listing?.title : res.session?.experience?.title;
        
        if (id && title) {
          if (!map.has(id)) {
            map.set(id, { title, color: COLORS[colorIndex % COLORS.length], dates: [] });
            colorIndex++;
          }
          
          const entry = map.get(id)!;
          
          if (res.type === "LISTING" && res.checkIn && res.checkOut) {
            let current = new Date(res.checkIn);
            while (current < new Date(res.checkOut)) {
              entry.dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
          } else if (res.type === "EXPERIENCE" && res.session?.dateTime) {
            entry.dates.push(new Date(res.session.dateTime));
          }
        }
      }
    });
    
    return Array.from(map.values());
  }, [reservations]);

  const { modifiers, modifiersStyles, allBookedDates } = useMemo(() => {
    const mods: Record<string, Date[]> = {};
    const styles: Record<string, any> = {};
    const allDates: Date[] = [];
    
    listingColors.forEach((lc, i) => {
      const key = `booked_${i}`;
      mods[key] = lc.dates;
      styles[key] = { color: "white", backgroundColor: lc.color, fontWeight: "900", borderRadius: "12px" };
      allDates.push(...lc.dates);
    });
    
    return { modifiers: mods, modifiersStyles: styles, allBookedDates: allDates };
  }, [listingColors]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <CancelReservationModal
        isOpen={!!cancellingReservation}
        reservation={cancellingReservation}
        onClose={() => setCancellingReservation(null)}
        onConfirm={confirmCancel}
        isLoading={processingId === cancellingReservation?.id}
        isHost={true}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2 italic underline decoration-brand-500 decoration-4 underline-offset-4">{t.host_reservations_title}</h1>
          <p className="text-neutral-500 font-medium">{t.host_reservations_subtitle}</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm shadow-neutral-200/50">
                <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${viewMode === 'list' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
                <FiCheckCircle size={18} />
                {t.host_reservations_view_list}
            </button>
            <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${viewMode === 'calendar' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
                <FiCalendar size={18} />
                {t.host_reservations_view_calendar}
            </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {["ALL", "PENDING", "CONFIRMED", "CANCELLED"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter as any)}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border-2 transition-all ${activeFilter === filter ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                    >
                        {filter === 'ALL' ? t.host_reservations_filter_all : filter === 'PENDING' ? t.host_reservations_filter_pending : filter === 'CONFIRMED' ? t.host_reservations_filter_confirmed : "Annulée"}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                {filteredReservations.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center gap-6">
                        <div className="p-6 bg-neutral-50 rounded-full text-neutral-200 border border-neutral-100">
                            <FiClock size={48} />
                        </div>
                        <p className="text-xl font-black text-neutral-900 italic">{t.host_reservations_none_found}</p>
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
                                                {reservation.status === 'PENDING' ? t.status_pending : 
                                                reservation.status === 'CONFIRMED' ? t.status_confirmed : t.status_completed}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isExperience ? 'text-teal-600' : 'text-brand-600'}`}>
                                                        {isExperience ? t.experiences : t.logements}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-neutral-900 line-clamp-1">{title}</h3>
                                                </div>
                                                <div className="bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100">
                                                    <span className="text-xl font-black text-neutral-900 tracking-tighter">
                                                        <PriceDisplay price={reservation.totalPrice} />
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-6 py-6 border-y border-neutral-50 my-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">{t.host_reservations_stay_date}</span>
                                                    <span className="text-[15px] font-black text-neutral-800">
                                                        {isExperience 
                                                            ? format(new Date(reservation.session?.dateTime!), "d MMM yyyy 'à' HH:mm", { locale })
                                                            : `${format(new Date(reservation.checkIn!), "d MMM", { locale })} - ${format(new Date(reservation.checkOut!), "d MMM yyyy", { locale })}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">{t.host_reservations_guest}</span>
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
                                                {t.host_reservations_send_message}
                                            </button>

                                            <div className="flex items-center gap-3">
                                                {reservation.status === 'CONFIRMED' && (
                                                    <button
                                                        disabled={processingId === reservation.id}
                                                        onClick={() => setCancellingReservation(reservation)}
                                                        className="flex items-center gap-2 px-6 py-3 text-rose-500 border-2 border-rose-50 rounded-2xl hover:bg-rose-50 hover:border-rose-100 transition shadow-sm active:scale-95"
                                                    >
                                                        <FiX size={20} />
                                                        <span className="font-black text-sm uppercase tracking-widest">{t.host_reservations_cancel || "Annuler"}</span>
                                                    </button>
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
                    <DayPicker mode="multiple" selected={allBookedDates} locale={locale as any} modifiers={modifiers} modifiersStyles={modifiersStyles} />
                </div>
                <div className="mt-8 flex flex-col gap-3 w-full max-w-[280px]">
                    {listingColors.length === 0 ? (
                        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-100 opacity-50">
                            <div className="w-3 h-3 rounded-full bg-neutral-300" />
                            <span className="text-xs font-black text-neutral-400 uppercase tracking-widest italic">{t.host_reservations_occupied_dates}</span>
                        </div>
                    ) : (
                        listingColors.map((lc, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: lc.color }} />
                                <span className="text-xs font-black text-neutral-600 uppercase tracking-widest italic truncate">{lc.title}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-10">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-neutral-900 italic">{t.host_reservations_occupancy_log}</h3>
                    <p className="text-neutral-400 font-medium">{t.host_reservations_occupancy_desc}</p>
                </div>
                
                <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                    {reservations.filter(res => res.status === "CONFIRMED").length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                            <FiCalendar size={48} />
                            <p className="font-bold uppercase tracking-widest text-xs">{t.host_reservations_no_confirmation}</p>
                        </div>
                    ) : (
                        reservations
                            .filter(res => res.status === "CONFIRMED")
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(res => (
                                <div key={res.id} className="p-6 rounded-[28px] bg-neutral-50 border-2 border-transparent hover:border-neutral-900 hover:bg-white transition-all duration-500 flex justify-between items-center group">
                                    <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black uppercase text-neutral-400 italic">
                                            {res.type === "LISTING" ? t.host_reservations_stay : t.experiences}
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
                                        <span className="font-black text-lg text-neutral-900 tracking-tighter"><PriceDisplay price={res.totalPrice} /></span>
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

const PriceDisplay = ({ price }: { price: number }) => {
  const { formattedPrice } = usePrice(price);
  return <>{formattedPrice}</>;
};

export default HostReservationsClient;
