"use client";

import dynamic from "next/dynamic";
import { IListingsParams } from "@/app/actions/getListings";
import Container from "@/components/Container";
import ListingCard from "@/components/listing/ListingCard";
import { BiFilter } from "react-icons/bi";

const MapListings = dynamic(() => import("@/components/MapListings"), { ssr: false });

interface SearchClientProps {
  listings: any[];
  currentUser: any;
  searchParams: IListingsParams;
}

export default function SearchClient({
  listings,
  currentUser,
  searchParams,
}: SearchClientProps) {
  const locationLabel = searchParams.locationValue
    ? searchParams.locationValue.split(" - ")[0]
    : "Toutes les destinations";
  const resultsLabel = listings.length === 1 ? "1 logement" : `${listings.length} logements`;

  return (
    <Container>
      <div className="pt-4 pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
              {locationLabel}
            </h1>
            <p className="text-base text-neutral-500 font-medium">
              {resultsLabel} disponibles · Classement par pertinence
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-neutral-300 text-sm font-bold text-neutral-800 hover:border-neutral-900 hover:shadow-md transition-all bg-white">
            <BiFilter size={20} />
            Plus de filtres
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {listings.map((list) => (
              <ListingCard
                key={list.id}
                data={list}
                currentUser={currentUser}
              />
            ))}
          </div>

          <div className="hidden lg:block sticky top-28">
            <MapListings listings={listings} className="h-[75vh] rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </Container>
  );
}
