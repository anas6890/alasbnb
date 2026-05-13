import { Listing, Reservation, User } from "@prisma/client";

export type safeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "checkIn" | "checkOut" | "listing"
> & {
  createdAt: string;
  checkIn: string;
  checkOut: string;
  listing: safeListing;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified" | "birthdate"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  birthdate: string;
};
