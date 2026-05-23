"use client";

import useLoginModal from "@/hook/useLoginModal";
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
import ListingReviews from "./listing/ListingReviews";
import { categories } from "./navbar/Categories";
import dynamic from "next/dynamic";
import { usePrice } from "@/hook/usePrice";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

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
  const loginModal = useLoginModal();

  const dynamicStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { 
        avgRating: 0, 
        totalReviews: 0,
        avgRatingCleanliness: 0,
        avgRatingAccuracy: 0,
        avgRatingCheckin: 0,
        avgRatingCommunication: 0,
        avgRatingLocation: 0,
        avgRatingValue: 0
      };
    }

    const count = reviews.length;
    const totals = reviews.reduce((acc, r) => ({
      avgRating: acc.avgRating + (r.avgRating || 0),
      cleanliness: acc.cleanliness + (r.ratingCleanliness || 5),
      accuracy: acc.accuracy + (r.ratingAccuracy || 5),
      checkin: acc.checkin + (r.ratingCheckin || 5),
      communication: acc.communication + (r.ratingCommunication || 5),
      location: acc.location + (r.ratingLocation || 5),
      value: acc.value + (r.ratingValue || 5),
    }), { avgRating: 0, cleanliness: 0, accuracy: 0, checkin: 0, communication: 0, location: 0, value: 0 });

    return {
      avgRating: parseFloat((totals.avgRating / count).toFixed(2)),
      totalReviews: count,
      avgRatingCleanliness: parseFloat((totals.cleanliness / count).toFixed(1)),
      avgRatingAccuracy: parseFloat((totals.accuracy / count).toFixed(1)),
      avgRatingCheckin: parseFloat((totals.checkin / count).toFixed(1)),
      avgRatingCommunication: parseFloat((totals.communication / count).toFixed(1)),
      avgRatingLocation: parseFloat((totals.location / count).toFixed(1)),
      avgRatingValue: parseFloat((totals.value / count).toFixed(1)),
    };
  }, [reviews]);

  const listingWithDynamicStats = useMemo(() => ({
    ...listing,
    ...dynamicStats
  }), [listing, dynamicStats]);

  const disableDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation) => {
      if ((reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && reservation.checkIn && reservation.checkOut) {
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

  const { formattedPrice: formattedPricePerNight } = usePrice(listing.pricePerNight);
  const { formattedPrice: formattedTotalPrice } = usePrice(totalPrice);

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
      .then((response) => {
        const lang = useLanguage.getState().language || "en";
        const t = translations[lang as keyof typeof translations] || translations.en;
        toast.success(t.reservation_created);
        return axios.post("/api/stripe/checkout", {
          reservationId: response.data.id
        });
      })
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch(() => {
        const lang = useLanguage.getState().language || "en";
        const t = translations[lang as keyof typeof translations] || translations.en;
        toast.error(t.error_occurred);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, listing.cancellationPolicy, currentUser, loginModal]);

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
              avgRating={dynamicStats.avgRating}
              totalReviews={dynamicStats.totalReviews}
              amenities={listing.amenities}
              location={listing.location}
              listingId={listing.id}
            />
            <div className="order-first col-span-1 mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.pricePerNight}
                totalPrice={totalPrice}
                formattedPrice={formattedPricePerNight}
                formattedTotalPrice={formattedTotalPrice}
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
          <div className="border-t border-neutral-200 mt-8">
            <ListingReviews reviews={reviews} listing={listingWithDynamicStats} />
          </div>

        </div>
      </div>
    </Container>
  );
}

export default ListingClient;
