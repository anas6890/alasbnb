"use client";

import useLoginModel from "@/hook/useLoginModal";
import { SafeUser } from "@/types";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-toastify";
import React from "react";

import Container from "../Container";
import ListingHead from "../listing/ListingHead";
import ListingReviews from "../listing/ListingReviews";
import Button from "../Button";
import Calendar from "../inputs/Calendar";
import Counter from "../inputs/Counter";
import { BiTimeFive, BiGroup, BiCommentDetail, BiWorld, BiCheckCircle } from "react-icons/bi";
import dynamic from "next/dynamic";

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
  const loginModal = useLoginModel();

  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [guests, setGuests] = useState(1);

  const coordinates = useMemo(() => {
    const lat = experience.location?.lat;
    const lng = experience.location?.lng;
    return lat && lng ? [lat, lng] : undefined;
  }, [experience]);

  const total = reviews.reduce((sum, review) => sum + Number(review.avgRating || 5), 0);
  const averageRating = reviews.length ? (total / reviews.length).toFixed(1) : (experience.avgRating || 0);

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
  }, [currentUser, dateRange, experience, loginModal, router]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto pt-28 pb-12">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={experience.title}
            imageSrc={experience.images?.[0] || ""}
            city={experience.location.city}
            country={experience.location.country}
            id={experience.id}
            currentUser={currentUser}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            {/* Left Info Column */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
              
              {/* Host Introduction */}
              <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl font-bold text-neutral-800">
                    Activité proposée par {experience.user?.firstname}
                  </h1>
                  <p className="text-neutral-500 font-light text-sm">
                    {experience.category} · Expérience d&apos;exception
                  </p>
                </div>
                <div className="ml-auto w-12 h-12 rounded-full overflow-hidden bg-neutral-200 relative">
                  {experience.user?.image ? (
                    <Image
                      src={experience.user.image}
                      alt={experience.user?.firstname || "Host"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-sm">
                      {experience.user?.firstname?.[0]?.toUpperCase() || "H"}
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights widgets */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <BiTimeFive size={28} className="text-brand-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Durée</span>
                    <span className="text-[14px] font-bold text-neutral-700">{experience.durationMinutes} min</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <BiGroup size={28} className="text-brand-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Groupe</span>
                    <span className="text-[14px] font-bold text-neutral-700">Jusqu&apos;à {experience.maxGroupSize} pers.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 col-span-2">
                  <BiWorld size={28} className="text-brand-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Langues</span>
                    <span className="text-[14px] font-bold text-neutral-700">
                      {experience.languages?.join(", ") || "Français"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-neutral-800">À propos de cette expérience</h2>
                <p className="text-neutral-500 font-light leading-relaxed text-sm">
                  {experience.description}
                </p>
              </div>

              {/* What is included */}
              {experience.included && experience.included.length > 0 && (
                <div className="flex flex-col gap-3 pb-6 border-b border-neutral-100">
                  <h2 className="text-lg font-bold text-neutral-800">Ce qui est inclus</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.included.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
                        <BiCheckCircle size={20} className="text-brand-500 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map where we'll be */}
              <div className="flex flex-col gap-4 pb-6 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-800">Où se déroule l&apos;activité</h2>
                <Map center={coordinates} />
              </div>

              {/* Reviews */}
              <div className="pt-2">
                <ListingReviews reviews={reviews} averageRating={averageRating} />
              </div>

            </div>

            {/* Right Booking Widget Column */}
            <div className="col-span-1 md:col-span-3 order-first md:order-last mb-10">
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                <div className="flex flex-row items-center gap-1 p-6">
                  <span className="text-2xl font-bold text-neutral-900">€{experience.pricePerPerson}</span>
                  <span className="font-normal text-neutral-500 text-sm ml-1">/ person</span>
                </div>
                
                <hr className="border-neutral-100" />
                
                <div className="p-2">
                  <Calendar
                    value={dateRange}
                    onChange={(value) => setDateRange(value.selection)}
                  />
                </div>
                
                <hr className="border-neutral-100" />
                
                <div className="p-6">
                  <Counter
                    title="Places"
                    subtitle={`Maximum ${experience.maxGroupSize} personnes`}
                    value={guests}
                    onChange={(val) => {
                      if (val >= 1 && val <= experience.maxGroupSize) {
                        setGuests(val);
                      }
                    }}
                  />
                </div>

                <hr className="border-neutral-100" />
                
                <div className="p-6">
                  <Button
                    disabled={isLoading}
                    label="Réserver ma place"
                    onClick={onCreateReservation}
                  />
                </div>

                <hr className="border-neutral-100" />

                <div className="p-6 flex flex-row items-center justify-between font-bold text-lg text-neutral-800">
                  <p>Total</p>
                  <p>€{experience.pricePerPerson * guests}</p>
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
