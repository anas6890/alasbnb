import { SafeUser } from "@/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import useLoginModal from "./useLoginModal";

type Props = {
  listingId: string;
  currentUser?: SafeUser | null;
  isExperience?: boolean;
};

function useFavorite({ listingId, currentUser, isExperience }: Props) {
  const router = useRouter();
  const loginModal = useLoginModal();

  const hasFavorited = useMemo(() => {
    const list = isExperience 
      ? currentUser?.savedExperienceIds || [] 
      : currentUser?.savedListingIds || [];

    return list.includes(listingId);
  }, [currentUser, listingId, isExperience]);

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!currentUser) {
        return loginModal.onOpen();
      }

      try {
        let request;

        const url = `/api/favorites/${listingId}${isExperience ? "?type=EXPERIENCE" : ""}`;

        if (hasFavorited) {
          request = () => axios.delete(url);
        } else {
          request = () => axios.post(url);
        }

        await request();
        router.refresh();
        toast.success(hasFavorited ? "Retiré des favoris" : "Ajouté aux favoris");
      } catch (error: any) {
        toast.error("Une erreur est survenue");
      }
    },
    [currentUser, hasFavorited, listingId, loginModal, isExperience, router]
  );

  return {
    hasFavorited,
    toggleFavorite,
  };
}

export default useFavorite;
