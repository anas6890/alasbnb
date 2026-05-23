"use client";

import { motion } from "framer-motion";
import { TbPool, TbWifi, TbCar, TbToolsKitchen2, TbPaw } from "react-icons/tb";
import { MdOutlineSecurity, MdOutlineFireExtinguisher, MdOutlineSensors, MdTv, MdOutlineLocalLaundryService } from "react-icons/md";
import React, { useState } from "react";

import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

type Props = {
  amenities?: string[];
};

const amenityIconMap: Record<string, any> = {
  "Cuisine": TbToolsKitchen2,
  "Kitchen": TbToolsKitchen2,
  "Wifi": TbWifi,
  "Stationnement gratuit sur place": TbCar,
  "Parking": TbCar,
  "Piscine": TbPool,
  "Pool": TbPool,
  "Animaux acceptés": TbPaw,
  "Télévision": MdTv,
  "TV": MdTv,
  "Lave-linge": MdOutlineLocalLaundryService,
  "Détecteur de monoxyde de carbone": MdOutlineSensors,
  "Détecteur de fumée": MdOutlineFireExtinguisher,
  "Caméras de surveillance extérieures présentes sur place": MdOutlineSecurity,
  "AC": MdOutlineSensors,
  "Breakfast": TbToolsKitchen2,
};

const DEFAULT_AMENITIES = [
  "Cuisine",
  "Wifi",
  "Stationnement gratuit sur place",
  "Piscine",
  "Télévision",
  "Lave-linge",
  "Détecteur de fumée"
];

// Helper to map DB string to translation key
const mapToKey = (str: string) => {
  const lower = str.toLowerCase();
  if (lower.includes("wifi")) return "amenity_wifi";
  if (lower.includes("cuisine") || lower.includes("kitchen")) return "amenity_kitchen";
  if (lower.includes("piscine") || lower.includes("pool")) return "amenity_pool";
  if (lower.includes("stationnement") || lower.includes("parking")) return "amenity_parking";
  if (lower.includes("animaux") || lower.includes("pet")) return "amenity_pets";
  if (lower.includes("télévision") || lower.includes("tv")) return "amenity_tv";
  if (lower.includes("lave-linge") || lower.includes("washer")) return "amenity_washer";
  if (lower.includes("fumée") || lower.includes("smoke")) return "amenity_smoke";
  if (lower.includes("ac") || lower.includes("air")) return "amenity_ac";
  if (lower.includes("gym") || lower.includes("sport")) return "amenity_gym";
  return null;
};

function Offers({ amenities = [] }: Props) {
  const listToRender = amenities && amenities.length > 0 ? amenities : DEFAULT_AMENITIES;
  const [showAll, setShowAll] = useState(false);
  
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const visibleAmenities = showAll ? listToRender : listToRender.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold text-neutral-800">{t.what_this_place_offers}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
        {visibleAmenities.map((label, index) => {
          const IconComponent = amenityIconMap[label] || TbWifi;
          const transKey = mapToKey(label);
          const displayLabel = transKey && t[transKey] ? t[transKey] : label;
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              key={label}
              className="flex items-center gap-4 py-1 text-neutral-700 font-light"
            >
              <IconComponent size={24} className="text-neutral-600" />
              <span className="text-[15px]">{displayLabel}</span>
            </motion.div>
          );
        })}
      </div>

      {listToRender.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 border border-neutral-800 hover:bg-neutral-50 active:scale-98 transition duration-200 text-neutral-800 font-semibold px-6 py-3 rounded-xl text-sm w-fit shadow-sm"
        >
          {showAll ? t.show_less_amenities : `${t.show_all_amenities} ${listToRender.length} ${t.amenities_count}`}
        </button>
      )}
    </div>
  );
}

export default Offers;
