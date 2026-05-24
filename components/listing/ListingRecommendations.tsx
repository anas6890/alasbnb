"use client";

import { safeListing, SafeUser } from "@/types";
import ListingCard from "./ListingCard";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface ListingRecommendationsProps {
  listings: safeListing[];
  currentUser?: SafeUser | null;
}

const ListingRecommendations: React.FC<ListingRecommendationsProps> = ({
  listings,
  currentUser,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  if (!listings || listings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 py-10 border-t border-neutral-100">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
          Les voyageurs ont aussi aimé
        </h2>
        <p className="text-neutral-500 font-medium">
          D'autres logements susceptibles de vous intéresser.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            data={listing}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingRecommendations;
