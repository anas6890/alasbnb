"use client";

import { motion } from "framer-motion";
import { IoBedOutline } from "react-icons/io5";
import Image from "next/image";
import React from "react";

type Props = {
  bedrooms: number;
};

const BEDROOM_IMAGES = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80"
];

function Sleep({ bedrooms = 1 }: Props) {
  const roomCount = Math.max(1, bedrooms);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-semibold text-neutral-800">Où vous dormirez</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
        {Array.from({ length: Math.min(3, roomCount) }).map((_, index) => {
          const bedType = index === 0 ? "2 lits simples" : index === 1 ? "1 lit king size" : "1 lit double";
          const imageUrl = BEDROOM_IMAGES[index % BEDROOM_IMAGES.length];
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              key={index}
              className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer bg-white group"
            >
              <div className="relative h-40 w-full overflow-hidden bg-neutral-100">
                <Image
                  src={imageUrl}
                  alt={`Chambre ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col gap-1">
                <div className="text-[15px] font-semibold text-neutral-800">Chambre {index + 1}</div>
                <div className="text-xs text-neutral-500 font-light flex items-center gap-1.5 mt-0.5">
                  <IoBedOutline size={14} className="text-neutral-600" />
                  <span>{bedType}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Sleep;
