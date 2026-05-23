import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeUser, safeListing } from "@/types";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

type Props = {
  listings: any[];
  currentUser?: SafeUser | null;
  viewType?: "LISTING" | "EXPERIENCE";
};

async function FavoritesClient({ listings, currentUser, viewType = "LISTING" }: Props) {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <Container>
      <div className="pt-4 pb-12">
        <Heading 
          title={viewType === "EXPERIENCE" ? `${t.experiences} (${listings.length})` : `${t.logements} (${listings.length})`} 
          subtitle={viewType === "EXPERIENCE" ? t.no_experience_desc : t.no_listing_desc} 
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {listings.map((listing) => (
            <ListingCard
              currentUser={currentUser}
              key={listing.id}
              data={listing}
              isExperience={viewType === "EXPERIENCE"}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}

export default FavoritesClient;
