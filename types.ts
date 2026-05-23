import {
  Listing,
  Reservation,
  User,
  ListingAvailability,
  Conversation,
  Message,
  ExperienceSession,
} from "@prisma/client";

export type SafeListingAvailability = Omit<ListingAvailability, "date"> & {
  date: string;
};

export type safeListing = Omit<Listing, "createdAt" | "updatedAt" | "deletedAt"> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  availabilities?: SafeListingAvailability[];
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified" | "deletedAt"
> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  emailVerified: string | null;
};

export type SafeMessage = Omit<Message, "createdAt" | "readAt"> & {
  createdAt: string;
  readAt: string | null;
  sender?: SafeUser;
  receiver?: SafeUser;
};

export type SafeConversation = Omit<Conversation, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  guest?: SafeUser;
  host?: SafeUser;
  listing?: safeListing | null;
  messages?: SafeMessage[];
};

export type SafeExperienceSession = Omit<ExperienceSession, "dateTime"> & {
  dateTime: string;
  experience?: any; // Replace with safeExperience if possible
};

export type SafeReservation = Omit<
  Reservation,
  | "createdAt"
  | "updatedAt"
  | "checkIn"
  | "checkOut"
  | "cancelledAt"
  | "listing"
  | "listingSnapshot"
  | "experienceSnapshot"
  | "hostSnapshot"
  | "payment"
> & {
  createdAt: string;
  updatedAt: string;
  checkIn: string | null;
  checkOut: string | null;
  cancelledAt: string | null;
  listing?: safeListing | null;
  user?: SafeUser | null;
  listingSnapshot?: any | null; // Replace any with accurate type if possible
  experienceSnapshot?: any | null;
  hostSnapshot?: any | null;
  payment?: any | null;
  session?: SafeExperienceSession | null;
};

