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
import ListingReviews from "./listing/ListingReviews";
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
    const total = reviews.reduce((sum, review) => sum + Number(review.avgRating || 5), 0);
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
      .then((response) => {
        toast.success("Réservation créée ! Redirection vers le paiement...");
        return axios.post("/api/stripe/checkout", {
          reservationId: response.data.id
        });
      })
      .then((response) => {
        window.location.href = response.data.url;
      })
      .catch(() => {
        toast.error("Une erreur est survenue");
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
              avgRating={averageRating}
              totalReviews={totalReviews}
              amenities={listing.amenities}
              location={listing.location}
              listingId={listing.id}
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
          <div className="border-t border-neutral-200 mt-8">
            <ListingReviews reviews={reviews} listing={listing} />
          </div>

        </div>
      </div>
    </Container>
  );
}

export default ListingClient;
