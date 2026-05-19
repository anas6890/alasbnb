"use client";

import { Experience } from "@prisma/client";
import { SafeUser } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  data: Experience;
  currentUser?: SafeUser | null;
};

export default function ExperienceCard({ data, currentUser }: Props) {
  return (
    <Link
      href={`/experiences/${data.id}`}
      className="col-span-1"
      prefetch
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        transition={{
          duration: 0.2,
          ease: [0.25, 1, 0.5, 1],
        }}
        className="cursor-pointer group"
      >
        <div className="flex flex-col gap-3 w-full bg-white rounded-2xl p-2 border border-neutral-100 hover:shadow-md transition-shadow duration-200">
          <div className="aspect-square w-full relative overflow-hidden rounded-xl">
            <Image
              fill
              className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-200 ease-out"
              src={data.images?.[0] || ""}
              alt="experience"
            />
            <div className="absolute top-3 left-3 bg-brand-50/95 text-brand-700 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-brand-100">
              Popular
            </div>
          </div>

          <div className="px-1 flex flex-col gap-1">
            <div className="flex flex-row justify-between items-start">
              <div className="font-semibold text-[15px] text-neutral-800 line-clamp-1">
                {data.title}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-neutral-800 font-medium">
                <span className="text-[#f59e0b]">★</span>
                <span>
                  {data.avgRating > 0 ? (
                    <>
                      {data.avgRating.toFixed(1)}
                      <span className="text-neutral-400 font-light text-xs ml-0.5">
                        ({data.totalReviews || 0})
                      </span>
                    </>
                  ) : (
                    "New"
                  )}
                </span>
              </div>
            </div>
            <div className="text-[13px] text-neutral-400 font-medium">
              {data.location.city}, {data.location.country}
            </div>
            <div className="flex flex-row items-center gap-1 mt-1">
              <div className="font-bold text-neutral-900">
                €{data.pricePerPerson}
              </div>
              <div className="font-normal text-neutral-500 text-xs">
                / person
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
