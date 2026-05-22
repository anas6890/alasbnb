import { Listing, Reservation, User, ListingAvailability } from "@prisma/client";

export type SafeListingAvailability = Omit<ListingAvailability, "date"> & {
  date: string;
};

export type safeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  availabilities?: SafeListingAvailability[];
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "checkIn" | "checkOut" | "listing"
> & {
  createdAt: string;
  checkIn: string | null;
  checkOut: string | null;
  listing: safeListing | null;
  user?: SafeUser | null;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};
