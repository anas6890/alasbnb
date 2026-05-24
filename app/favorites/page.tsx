import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import React from "react";
import getCurrentUser from "../actions/getCurrentUser";
import getFavoriteListings from "../actions/getFavoriteListings";
import FavoritesClient from "./FavoritesClient";

const FavoritePage = async (props: { searchParams: Promise<{ type?: string }> }) => {
  const searchParams = await props.searchParams;
  const [currentUser, favoritesObj] = await Promise.all([
    getCurrentUser(),
    getFavoriteListings()
  ]);
  const initialViewType = searchParams?.type === "EXPERIENCE" ? "EXPERIENCE" : "LISTING";
  const { listings, experiences } = favoritesObj as any;

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Non autorisé" subtitle="Veuillez vous connecter" />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <FavoritesClient 
        listings={listings} 
        experiences={experiences}
        currentUser={currentUser} 
        initialViewType={initialViewType}
      />
    </ClientOnly>
  );
};

export default FavoritePage;
