"use client";

import { safeListing, SafeUser } from "@/types";
import ListingCard from "./ListingCard";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface SearchResultsClientProps {
  listings: safeListing[];
  currentUser?: SafeUser | null;
  locationValue?: string | null;
}

const SearchResultsClient: React.FC<SearchResultsClientProps> = ({
  listings,
  currentUser,
  locationValue,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        ssr: false,
      }),
    []
  );

  const title = locationValue
    ? `${locationValue.split(" - ")[0]} : Plus de ${listings.length} logements`
    : `Plus de ${listings.length} logements trouvés`;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left side: Listings Grid */}
      <div className="flex-[0.6] xl:flex-[0.55] p-6 pt-10 pb-20 overflow-y-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h1>
        <p className="text-sm text-neutral-500 mb-8">Classement des résultats basés sur la pertinence et les avis.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              data={listing}
              currentUser={currentUser}
            />
          ))}
        </div>
      </div>

      {/* Right side: Map */}
      <div className="flex-[0.4] xl:flex-[0.45] hidden lg:block sticky top-0 h-screen">
        <Map
          className="h-full w-full"
          listings={listings}
        />
      </div>
    </div>
  );
};

export default SearchResultsClient;
