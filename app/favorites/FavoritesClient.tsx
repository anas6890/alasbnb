import Container from "@/components/Container";
import Heading from "@/components/Heading";
import ListingCard from "@/components/listing/ListingCard";
import { SafeUser, safeListing } from "@/types";

type Props = {
  listings: any[];
  currentUser?: SafeUser | null;
  viewType?: "LISTING" | "EXPERIENCE";
};

function FavoritesClient({ listings, currentUser, viewType = "LISTING" }: Props) {
  return (
    <Container>
      <div className="pt-4 pb-12">
        <Heading 
          title={viewType === "EXPERIENCE" ? "Vos Expériences Favorites" : "Vos Logements Favoris"} 
          subtitle={viewType === "EXPERIENCE" ? "La liste des expériences que vous avez aimées !" : "La liste des logements que vous avez aimés !"} 
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
