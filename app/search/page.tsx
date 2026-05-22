import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings, { IListingsParams } from "@/app/actions/getListings";
import SearchClient from "./SearchClient";

export default async function SearchPage(props: { searchParams: Promise<IListingsParams> }) {
  const searchParams = await props.searchParams;
  const [listing, currentUser] = await Promise.all([
    getListings(searchParams),
    getCurrentUser(),
  ]);

  if (listing.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset title="Aucun resultat" subtitle="Aucune annonce ne correspond a votre recherche." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <SearchClient 
        listings={listing} 
        currentUser={currentUser} 
        searchParams={searchParams} 
      />
    </ClientOnly>
  );
}
