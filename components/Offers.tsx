"use client";

import { motion } from "framer-motion";
import { TbPool, TbWifi, TbCar, TbToolsKitchen2, TbTv, TbPaw } from "react-icons/tb";
import { PiWashingMachine } from "react-icons/pi";
import { MdOutlineSecurity, MdOutlineFireExtinguisher, MdOutlineSensors } from "react-icons/md";
import React, { useState } from "react";

type Props = {
  amenities?: string[];
};

const amenityIconMap: Record<string, any> = {
  "Cuisine": TbToolsKitchen2,
  "Wifi": TbWifi,
  "Stationnement gratuit sur place": TbCar,
  "Piscine": TbPool,
  "Animaux acceptés": TbPaw,
  "Télévision": TbTv,
  "Lave-linge": PiWashingMachine,
  "Détecteur de monoxyde de carbone": MdOutlineSensors,
  "Détecteur de fumée": MdOutlineFireExtinguisher,
  "Caméras de surveillance extérieures présentes sur place": MdOutlineSecurity
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

function Offers({ amenities = [] }: Props) {
  const listToRender = amenities && amenities.length > 0 ? amenities : DEFAULT_AMENITIES;
  const [showAll, setShowAll] = useState(false);

  const visibleAmenities = showAll ? listToRender : listToRender.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold text-neutral-800">Ce que propose ce logement</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
        {visibleAmenities.map((label, index) => {
          const IconComponent = amenityIconMap[label] || TbWifi;
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
              <span className="text-[15px]">{label}</span>
            </motion.div>
          );
        })}
      </div>

      {listToRender.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 border border-neutral-800 hover:bg-neutral-50 active:scale-98 transition duration-200 text-neutral-800 font-semibold px-6 py-3 rounded-xl text-sm w-fit shadow-sm"
        >
          {showAll ? "Afficher moins d'équipements" : `Afficher les ${listToRender.length} équipements`}
        </button>
      )}
    </div>
  );
}

export default Offers;
