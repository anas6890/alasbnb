"use client";

import useLoginModal from "@/hook/useLoginModal";
import { SafeUser } from "@/types";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-toastify";
import React from "react";
import Link from "next/link";

import Container from "../Container";
import ListingHead from "../listing/ListingHead";
import ListingReviews from "../listing/ListingReviews";
import Button from "../Button";
import Calendar from "../inputs/Calendar";
import Counter from "../inputs/Counter";
import { BiTimeFive, BiGroup, BiCommentDetail, BiWorld, BiCheckCircle, BiMessageDetail, BiUserCircle } from "react-icons/bi";
import dynamic from "next/dynamic";
import { usePrice } from "@/hook/usePrice";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

type Props = {
  experience: any;
  currentUser?: SafeUser | null;
  reviews?: any[];
};

function ExperienceClient({ experience, currentUser, reviews = [] }: Props) {
  const router = useRouter();
  const loginModal = useLoginModal();

  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [isLoading, setIsLoading] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [guests, setGuests] = useState(1);

  const dynamicStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { 
        avgRating: 0, 
        totalReviews: 0,
      };
    }

    const count = reviews.length;
    const total = reviews.reduce((acc, r) => acc + (r.avgRating || 0), 0);

    return {
      avgRating: parseFloat((total / count).toFixed(2)),
      totalReviews: count,
    };
  }, [reviews]);

  const experienceWithDynamicStats = useMemo(() => ({
    ...experience,
    ...dynamicStats
  }), [experience, dynamicStats]);

  const { formattedPrice: pricePerPersonFormatted } = usePrice(experience.pricePerPerson);
  const { formattedPrice: totalPriceFormatted } = usePrice(experience.pricePerPerson * guests);

  const coordinates = useMemo(() => {
    const lat = experience.location?.lat;
    const lng = experience.location?.lng;
    return lat && lng ? [lat, lng] : undefined;
  }, [experience]);

  const onContactHost = useCallback(async () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    setIsContactLoading(true);
    try {
      const response = await axios.post("/api/contact", {
        experienceId: experience.id,
        hostId: experience.hostId,
        content: "Bonjour ! Je suis intéressé par votre expérience."
      });
      router.push(`/messages?selected=${response.data.id}`);
    } catch (error) {
      toast.error("Impossible d'ouvrir la messagerie");
    } finally {
      setIsContactLoading(false);
    }
  }, [currentUser, experience.id, experience.hostId, loginModal, router]);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    setIsLoading(true);

    axios
      .post("/api/reservations", {
        experienceId: experience.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        totalPrice: experience.pricePerPerson * guests,
        adults: guests,
        type: "EXPERIENCE",
      })
      .then((response) => {
        toast.success("Réservation créée ! Redirection vers le paiement...");
        return axios.post("/api/stripe/checkout", {
          reservationId: response.data.id
        });
      })
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch((err) => {
        toast.error("Une erreur s'est produite lors de la réservation.");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUser, dateRange, experience, loginModal, guests]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto pt-6 pb-12">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={experience.title}
            imageSrc={experience.images?.[0] || ""}
            images={experience.images}
            city={experience.location.city}
            country={experience.location.country}
            id={experience.id}
            currentUser={currentUser}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            {/* Left Info Column */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
              
              {/* Host Introduction Enhanced */}
              <div className="flex items-center justify-between pb-8 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                    <Link href={`/users/${experience.hostId}`} className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200 hover:opacity-90 transition">
                    {experience.user?.image ? (
                        <Image
                        src={experience.user.image}
                        alt={experience.user?.firstname || "Host"}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-xl">
                        {experience.user?.firstname?.[0]?.toUpperCase() || "H"}
                        </div>
                    )}
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-neutral-800">
                            {t.hosted_by || "Proposé par"} {experience.user?.firstname}
                        </h1>
                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <span>{experience.category}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                <span className="text-amber-500">★</span>
                                {dynamicStats.totalReviews > 0 ? dynamicStats.avgRating.toFixed(1) : t.new || "Nouveau"}
                                {dynamicStats.totalReviews > 0 && ` (${dynamicStats.totalReviews})`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={onContactHost}
                        disabled={isContactLoading}
                        className="p-3 border-2 border-neutral-200 rounded-xl hover:border-neutral-800 hover:bg-neutral-50 transition shadow-sm group"
                        title={t.contact_host || "Contacter l'hôte"}
                    >
                        <BiMessageDetail size={24} className="text-neutral-600 group-hover:text-neutral-800" />
                    </button>
                    <Link 
                        href={`/users/${experience.hostId}`}
                        className="p-3 border-2 border-neutral-200 rounded-xl hover:border-neutral-800 hover:bg-neutral-50 transition shadow-sm group"
                        title={t.click_to_view_profile || "Voir le profil"}
                    >
                        <BiUserCircle size={24} className="text-neutral-600 group-hover:text-neutral-800" />
                    </Link>
                </div>
              </div>

              {/* Highlights widgets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 transition hover:bg-white hover:shadow-sm">
                  <BiTimeFive size={28} className="text-neutral-800" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.duration_label || "Durée"}</span>
                    <span className="text-[15px] font-bold text-neutral-800">{experience.durationMinutes} {t.duration_min || "min"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 transition hover:bg-white hover:shadow-sm">
                  <BiGroup size={28} className="text-neutral-800" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.group_label || "Groupe"}</span>
                    <span className="text-[15px] font-bold text-neutral-800">{t.up_to || "Jusqu'à"} {experience.maxGroupSize} {t.pers_short || "pers."}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 col-span-2 transition hover:bg-white hover:shadow-sm">
                  <BiWorld size={28} className="text-neutral-800" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t.languages_label || "Langues"}</span>
                    <span className="text-[15px] font-bold text-neutral-800">
                      {experience.languages?.join(", ") || t.french_default || "Français"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-4 py-4">
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic">{t.what_you_will_do || "Ce que vous allez faire"}</h2>
                <p className="text-neutral-600 text-[16px] leading-relaxed font-medium">
                  {experience.description}
                </p>
              </div>

              {/* What is included */}
              {experience.included && experience.included.length > 0 && (
                <div className="flex flex-col gap-5 py-6 border-y border-neutral-100">
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic">{t.what_is_included || "Ce qui est inclus"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experience.included.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="p-1 bg-white rounded-full shadow-sm">
                            <BiCheckCircle size={20} className="text-teal-600" />
                        </div>
                        <span className="font-bold text-neutral-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map where we'll be */}
              <div className="flex flex-col gap-6 py-6">
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight italic">{t.activity_location || "Le lieu de l'activité"}</h2>
                <div className="rounded-2xl overflow-hidden border-2 border-neutral-100 shadow-sm h-[300px]">
                    <Map center={coordinates} />
                </div>
              </div>

              {/* Reviews */}
              <div className="pt-8 border-t border-neutral-100">
                <ListingReviews reviews={reviews} listing={experienceWithDynamicStats} />
              </div>

            </div>

            {/* Right Booking Widget Column */}
            <div className="col-span-1 md:col-span-3 order-first md:order-last mb-10">
              <div className="bg-white rounded-[32px] border border-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sticky top-28 z-10 overflow-hidden">
                <div className="p-8 pb-4">
                    <div className="flex flex-row items-baseline gap-1.5 mb-6">
                        <span className="text-3xl font-black text-neutral-900">{pricePerPersonFormatted}</span>
                        <span className="font-bold text-neutral-400 text-sm tracking-wide uppercase">/ {t.person || "personne"}</span>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden mb-6">
                        <Calendar
                            value={dateRange}
                            onChange={(value) => setDateRange(value.selection)}
                        />
                    </div>

                    <div className="mb-8">
                        <Counter
                            title={t.participants_label || "Participants"}
                            subtitle={`${t.max_persons || "Maximum"} ${experience.maxGroupSize} ${t.person || "personnes"}`}
                            value={guests}
                            onChange={(val) => {
                            if (val >= 1 && val <= experience.maxGroupSize) {
                                setGuests(val);
                            }
                            }}
                        />
                    </div>

                    <button 
                        disabled={isLoading}
                        onClick={onCreateReservation}
                        className="w-full py-4 bg-neutral-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg uppercase tracking-wider"
                    >
                        {t.reserve_spot || "Réserver ma place"}
                    </button>
                    
                    <p className="text-center text-[12px] font-bold text-neutral-400 mt-4 uppercase tracking-widest">
                        {t.no_charge_yet || "Aucun montant ne sera prélevé pour le moment"}
                    </p>
                </div>

                <div className="bg-neutral-50 p-8 border-t border-neutral-100 flex flex-row items-center justify-between">
                  <span className="font-black text-neutral-900 text-xl italic underline decoration-amber-500 decoration-4 underline-offset-4">{t.total || "Total"}</span>
                  <span className="font-black text-neutral-900 text-2xl tracking-tighter">{totalPriceFormatted}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Container>
  );
}

export default ExperienceClient;
