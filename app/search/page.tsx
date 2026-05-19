import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/listing/ListingCard";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings, { IListingsParams } from "@/app/actions/getListings";
import dynamic from "next/dynamic";
import { BiFilter } from "react-icons/bi";

interface SearchPageProps {
  searchParams: IListingsParams;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [listing, currentUser] = await Promise.all([
    getListings(searchParams),
    getCurrentUser(),
  ]);

  const MapListings = dynamic(() => import("@/components/MapListings"), { ssr: false });

  const locationLabel = searchParams.locationValue
    ? searchParams.locationValue.split(" - ")[0]
    : "Toutes les destinations";
  const resultsLabel = listing.length === 1 ? "1 logement" : `${listing.length} logements`;

  if (listing.length === 0) {
    return (
      <ClientOnly>
        <EmptyState showReset title="Aucun resultat" subtitle="Aucune annonce ne correspond a votre recherche." />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <Container>
        <div className="pt-28 pb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-neutral-900">{locationLabel} : {resultsLabel}</h1>
              <p className="text-sm text-neutral-500">Classement des resultats</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 text-sm font-semibold text-neutral-800 hover:shadow-md transition">
              <BiFilter size={18} />
              Filtres
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {listing.map((list) => (
                <ListingCard
                  key={list.id}
                  data={list}
                  currentUser={currentUser}
                />
              ))}
            </div>

            <div className="hidden lg:block sticky top-28">
              <MapListings listings={listing} className="h-[75vh] rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </Container>
    </ClientOnly>
  );
}
