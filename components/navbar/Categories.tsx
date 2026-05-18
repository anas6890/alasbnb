"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { GiBoatFishing, GiWoodCabin, GiTreehouse } from "react-icons/gi";
import { MdOutlineVilla, MdOutlineApartment } from "react-icons/md";
import { TbHome } from "react-icons/tb";
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

type Props = {};

function Categories({}: Props) {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  const isMainPage = pathname === "/";

  if (!isMainPage) {
    return null;
  }

  return (
    <Container>
      <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
        {categories.map((items, index) => (
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
