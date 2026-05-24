import ClientOnly from "@/components/ClientOnly";
import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCarousel from "@/components/listing/ListingCarousel";
import SearchResultsClient from "@/components/listing/SearchResultsClient";
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
  const cityToLocationValue: Record<string, string> = {};

  listing.forEach((list) => {
    const city = list.location?.city || t.elsewhere;
    if (!groupedListings[city]) {
      groupedListings[city] = [];
    }
    groupedListings[city].push(list);
    if (list.location?.country && !cityToLocationValue[city]) {
      cityToLocationValue[city] = `${city} - ${list.location.country}`;
    }
  });

  // Sort cities by popularity (number of listings)
  const cityKeys = Object.keys(groupedListings).sort((a, b) => {
    return groupedListings[b].length - groupedListings[a].length;
  });

  // Limit to top 8 most popular cities on the homepage if no search is active
  const isSearchActive = Object.values(searchParams).some(val => val !== undefined && val !== "");
  const displayCityKeys = isSearchActive ? cityKeys : cityKeys.slice(0, 8);

  if (isSearchActive) {
    return (
      <ClientOnly>
        <SearchResultsClient
          listings={listing}
          currentUser={currentUser}
          locationValue={searchParams.locationValue}
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden rounded-b-[3rem] mb-16 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.5)]">
        {/* Tropical Vibrant Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 hover:scale-110 transition-transform duration-[3000ms] ease-in-out"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop')" }}
        />
        {/* Colorful Gradient Overlay (Pink, Purple, Orange) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/70 via-purple-500/50 to-orange-400/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-80" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-pink-200 tracking-tight drop-shadow-2xl mb-6 max-w-5xl">
            {t.home_hero_title}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {t.home_hero_subtitle}
          </p>
          <div className="mt-2">
            <a href="#explore-section" className="inline-block px-10 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full font-bold text-xl shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300">
              {t.hero_explore_btn}
            </a>
          </div>
        </div>
      </div>

      <Container>
        <div id="explore-section" className="pb-16 overflow-x-hidden flex flex-col gap-8">
          {displayCityKeys.map((city) => (
            <ListingCarousel
              key={city}
              title={`${t.home_explore}${city}`}
              searchQuery={cityToLocationValue[city] || city}
              listings={groupedListings[city].slice(0, 20)}
              currentUser={currentUser}
            />
          ))}
        </div>
      </Container>
    </ClientOnly>
  );
}
