import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import getReservation from "@/app/actions/getReservations";
import getReviews from "@/app/actions/getReviews";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ListingClient from "@/components/ListingClient";

interface IParams {
  listingId?: string;
}

const ListingPage = async ({ params }: { params: IParams }) => {
  const [listing, reservations, currentUser, reviews] = await Promise.all([
    getListingById(params),
    getReservation(params),
    getCurrentUser(),
    getReviews(params)
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
      />
    </ClientOnly>
  );
};

export default ListingPage;
