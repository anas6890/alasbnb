"use client";

import { Experience } from "@prisma/client";
import { SafeUser } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  data: Experience;
  currentUser?: SafeUser | null;
};

export default function ExperienceCard({ data, currentUser }: Props) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      onClick={() => router.push(`/experiences/${data.id}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-xl">
          <Image
            fill
            className="object-cover h-full w-full group-hover:scale-110 transition"
            src={data.images?.[0] || ""}
            alt="experience"
          />
        </div>
        <div className="font-semibold text-lg">
          {data.city}, {data.country}
        </div>
        <div className="font-light text-neutral-500">
          {data.title}
        </div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">
            From ${data.pricePerPerson}
          </div>
          <div className="font-light"> / person</div>
        </div>
      </div>
    </motion.div>
  );
}
