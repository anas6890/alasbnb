"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { GiBoatFishing, GiWoodCabin, GiTreehouse, GiCampingTent, GiCookingPot, GiPalette, GiSpottedBug } from "react-icons/gi";
import { MdOutlineVilla, MdOutlineApartment, MdOutlineNaturePeople, MdOutlineSelfImprovement } from "react-icons/md";
import { TbHome, TbMoodSmile } from "react-icons/tb";
import CategoryBox from "../CategoryBox";
import Container from "../Container";

export const categories = [
  {
    label: "apartment",
    icon: MdOutlineApartment,
    description: "Cet hébergement est un appartement confortable !",
  },
  {
    label: "house",
    icon: TbHome,
    description: "Cet hébergement est une charmante maison !",
  },
  {
    label: "villa",
    icon: MdOutlineVilla,
    description: "Cet hébergement est une magnifique villa de luxe !",
  },
  {
    label: "cabin",
    icon: GiWoodCabin,
    description: "Cet hébergement est un chalet chaleureux !",
  },
  {
    label: "boat",
    icon: GiBoatFishing,
    description: "Cet hébergement est un bateau ou une péniche !",
  },
  {
    label: "treehouse",
    icon: GiTreehouse,
    description: "Cet hébergement est une cabane perchée dans les arbres !",
  },
];

export const experienceCategories = [
  {
    label: "cuisine",
    icon: GiCookingPot,
    description: "Découvrez des saveurs locales !",
  },
  {
    label: "art",
    icon: GiPalette,
    description: "Exprimez votre créativité !",
  },
  {
    label: "sport",
    icon: GiCampingTent,
    description: "Bougez et dépassez-vous !",
  },
  {
    label: "nature",
    icon: MdOutlineNaturePeople,
    description: "Reconnectez-vous avec la nature !",
  },
  {
    label: "bien-être",
    icon: MdOutlineSelfImprovement,
    description: "Détendez-vous et prenez soin de vous !",
  },
  {
    label: "culture",
    icon: TbMoodSmile,
    description: "Explorez de nouvelles traditions !",
  },
];

type Props = {};

function Categories({}: Props) {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  const isMainPage = pathname === "/";
  const isExperiencePage = pathname === "/experiences";

  if (!isMainPage && !isExperiencePage) {
    return null;
  }

  const currentCategories = isExperiencePage ? experienceCategories : categories;

  return (
    <Container>
      <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto no-scrollbar">
        {currentCategories.map((items, index) => (
          <CategoryBox
            key={index}
            icon={items.icon}
            label={items.label}
            selected={category === items.label}
          />
        ))}
      </div>
    </Container>
  );
}

export default Categories;
