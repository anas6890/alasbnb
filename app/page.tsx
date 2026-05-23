import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCarousel from "@/components/listing/ListingCarousel";
import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IListingsParams } from "./actions/getListings";
import { safeListing } from "@/types";
import { cookies } from "next/headers";
import { translations } from "@/lib/translations";

interface HomeProps {
  searchParams: IListingsParams;
}

export default async function Home(props: { searchParams: Promise<IListingsParams> }) {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";
  const t = translations[language as keyof typeof translations] || translations.en;

  const searchParams = await props.searchParams;
  const [listing, currentUser] = await Promise.all([
    getListings(searchParams),
    getCurrentUser()
  ]);

  if (listing.length === 0) {
    return (
      <ClientOnly>
        <EmptyState title={t.no_listing} subtitle={t.no_listing_desc} showReset />
      </ClientOnly>
    );
  }

  // Group listings by city
  const groupedListings: Record<string, safeListing[]> = {};
  listing.forEach((list) => {
    const city = list.location?.city || t.elsewhere;
    if (!groupedListings[city]) {
      groupedListings[city] = [];
    }
    groupedListings[city].push(list);
  });

  const cityKeys = Object.keys(groupedListings).sort();

  return (
    <ClientOnly>
      <div className="relative w-full h-[25vh] min-h-[220px] max-h-[300px] overflow-hidden bg-neutral-900 mb-12">
        {/* Luxury Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-4">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-2 max-w-4xl">
            {t.home_hero_title}
          </h1>
          <p className="text-sm md:text-lg text-neutral-200 font-light max-w-2xl drop-shadow-md">
            {t.home_hero_subtitle}
          </p>
        </div>
      </div>

      <Container>
        <div className="pb-16 overflow-x-hidden flex flex-col gap-8">
          {cityKeys.map((city) => (
            <ListingCarousel
              key={city}
              title={`${t.home_explore}${city}`}
              listings={groupedListings[city]}
              currentUser={currentUser}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
