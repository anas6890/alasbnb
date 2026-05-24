import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservation from "@/app/actions/getReservations";
import getReviews from "@/app/actions/getReviews";
import getRecommendations from "@/app/actions/getRecommendations";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ListingClient from "@/components/ListingClient";

interface IParams {
  listingId?: string;
}

const ListingPage = async (props: { params: Promise<IParams> }) => {
  const params = await props.params;
  const [listing, reservations, currentUser, reviews, recommendations] = await Promise.all([
    getListingById(params),
    getReservation(params),
    getCurrentUser(),
    getReviews(params),
    getRecommendations({ listingId: params.listingId as string })
  ]);

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ListingClient
        listing={listing}
        currentUser={currentUser}
        reservations={reservations}
        reviews={reviews}
        recommendations={recommendations}
      />
    </ClientOnly>
  );
};

export default ListingPage;
