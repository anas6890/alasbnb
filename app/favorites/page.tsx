import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import React from "react";
import getCurrentUser from "../actions/getCurrentUser";
import getFavoriteListings from "../actions/getFavoriteListings";
import FavoritesClient from "./FavoritesClient";

type Props = {};

const FavoritePage = async (props: { searchParams: Promise<{ type?: string }> }) => {
  const searchParams = await props.searchParams;
  const [currentUser, favoritesObj] = await Promise.all([
    getCurrentUser(),
    getFavoriteListings()
  ]);
  const viewType = searchParams?.type === "EXPERIENCE" ? "EXPERIENCE" : "LISTING";
  const { listings, experiences } = favoritesObj as any;

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState title="Unauthorized" subtitle="Please login" />
      </ClientOnly>
    );
  }

  if (viewType === "LISTING" && listings.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="Aucun favori"
          subtitle="Vous n'avez pas encore de logements favoris."
        />
      </ClientOnly>
    );
  }

  if (viewType === "EXPERIENCE" && experiences.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="Aucun favori"
          subtitle="Vous n'avez pas encore d'expériences favorites."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <FavoritesClient 
        listings={viewType === "EXPERIENCE" ? experiences : listings} 
        currentUser={currentUser} 
        viewType={viewType}
      />
    </ClientOnly>
  );
};

export default FavoritePage;
