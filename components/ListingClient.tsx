"use client";

import useLoginModel from "@/hook/useLoginModal";
import { SafeReservation, SafeUser, safeListing } from "@/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval, format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { toast } from "react-toastify";
import React from "react";

import Container from "./Container";
import ListingHead from "./listing/ListingHead";
import ListingInfo from "./listing/ListingInfo";
import ListingReservation from "./listing/ListingReservation";
import { categories } from "./navbar/Categories";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

type Props = {
  reservations?: SafeReservation[];
  reviews?: any[];
  listing: safeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
};

function ListingClient({ reservations = [], reviews = [], listing, currentUser }: Props) {
  const router = useRouter();
  const loginModal = useLoginModel();

  const { averageRating, totalReviews } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 5.0, totalReviews: 0 };
    }
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 5), 0);
    const avg = total / reviews.length;
    return { averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length };
  }, [reviews]);

  const disableDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation) => {
      if (reservation.checkIn && reservation.checkOut) {
        const range = eachDayOfInterval({
          start: new Date(reservation.checkIn),
          end: new Date(reservation.checkOut),
        });

        dates = [...dates, ...range];
      }
    });

    return dates;
  }, [reservations]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.pricePerNight);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    setIsLoading(true);

    axios
      .post("/api/reservations", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
        cancellationPolicy: listing.cancellationPolicy,
      })
      .then(() => {
        toast.success("Success!");
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error("Something Went Wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInCalendarDays(
        dateRange.endDate,
        dateRange.startDate
      );

      if (dayCount && listing.pricePerNight) {
        setTotalPrice(dayCount * listing.pricePerNight);
      } else {
        setTotalPrice(listing.pricePerNight);
      }
    }
  }, [dateRange, listing.pricePerNight]);

  const category = useMemo(() => {
    return categories.find((item) => item.label === listing.type);
  }, [listing.type]);

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.images?.[0] || ""}
            images={listing.images}
            city={listing.location.city}
            country={listing.location.country}
            id={listing.id}
            currentUser={currentUser}
          />
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              category={category}
              description={listing.description}
              bedrooms={listing.bedrooms}
              maxGuests={listing.maxGuests}
              beds={listing.beds}
              bathrooms={listing.bathrooms}
              lat={listing.location.lat}
              lng={listing.location.lng}
              locationValue={listing.location.country}
              avgRating={averageRating}
              totalReviews={totalReviews}
              amenities={listing.amenities}
              location={listing.location}
            />
            <div className="order-first col-span-1 mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.pricePerNight}
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading}
                disabledDates={disableDates}
                cancellationPolicy={listing.cancellationPolicy}
              />
            </div>
          </div>

          {/* Reviews / Comments Section */}
          <div className="border-t border-neutral-200 pt-8 mt-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-neutral-800">
              <span className="text-neutral-800">★</span>
              <span>
                {totalReviews > 0 ? (
                  <>
                    {averageRating.toFixed(1)} · {totalReviews} {totalReviews > 1 ? "commentaires" : "commentaire"}
                  </>
                ) : (
                  "Aucun commentaire"
                )}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="text-neutral-500 font-light text-sm py-4">
                Aucun commentaire pour le moment. Soyez le premier à laisser un avis après votre séjour !
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mt-2">
                  {reviews.slice(0, 6).map((review: any) => {
                    const authorDate = review.author?.createdAt ? new Date(review.author.createdAt) : new Date();
                    const activeYears = Math.max(1, new Date().getFullYear() - authorDate.getFullYear());
                    const authorDuration = `${activeYears} ${activeYears > 1 ? "ans" : "an"} sur Alasbnb`;

                    // Human readable relative dates matching screenshot exactly
                    const relativeTime = (() => {
                      if (!review.createdAt) return "quelques jours";
                      const diffTime = Math.abs(new Date().getTime() - new Date(review.createdAt).getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays <= 2) return "2 jours";
                      if (diffDays <= 7) return "1 semaine";
                      if (diffDays <= 14) return "2 semaines";
                      if (diffDays <= 21) return "3 semaines";
                      if (diffDays <= 30) return "1 mois";
                      return format(new Date(review.createdAt), "MMMM yyyy");
                    })();

                    return (
                      <div key={review.id} className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
                            {review.author?.image ? (
                              <Image
                                src={review.author.image}
                                alt={review.author?.firstname || "User"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-sm">
                                {review.author?.firstname?.[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-neutral-800 leading-tight">
                              {review.author?.firstname}
                            </span>
                            <span className="text-neutral-500 text-[11px] font-light">
                              {authorDuration}
                            </span>
                          </div>
                        </div>
                        
                        {/* Bulleted rating, date, and stay text */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-light select-none">
                          <span className="text-[10px] text-neutral-800 tracking-tighter">
                            {"★".repeat(Math.round(review.rating || 5))}
                          </span>
                          <span>•</span>
                          <span>il y a {relativeTime}</span>
                          <span>•</span>
                          <span>Séjour de quelques nuits</span>
                        </div>

                        <p className="text-neutral-700 font-light text-[14px] leading-relaxed line-clamp-3">
                          {review.comment}
                        </p>
                        <span className="text-xs font-semibold underline text-neutral-800 cursor-pointer w-fit hover:text-neutral-500 transition">
                          Lire la suite
                        </span>
                      </div>
                    );
                  })}
                </div>

                {reviews.length > 6 && (
                  <button className="mt-4 border border-neutral-800 hover:bg-neutral-50 active:scale-98 transition duration-200 text-neutral-800 font-semibold px-6 py-3.5 rounded-xl text-sm w-fit shadow-sm">
                    Afficher les {reviews.length} commentaires
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </Container>
  );
}

export default ListingClient;
