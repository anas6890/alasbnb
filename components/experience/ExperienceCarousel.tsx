"use client";

import { Experience } from "@prisma/client";
import { SafeUser } from "@/types";
import { useRef, useState, useEffect } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import ExperienceCard from "./ExperienceCard";

interface ExperienceCarouselProps {
  title: string;
  experiences: Experience[];
  currentUser?: SafeUser | null;
}

const ExperienceCarousel: React.FC<ExperienceCarouselProps> = ({ title, experiences, currentUser }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [experiences]);

  if (experiences.length === 0) return null;

  return (
    <div className="relative group mb-10">
      <div className="flex flex-row items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      </div>

      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute top-[50%] -translate-y-[50%] -left-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg border border-neutral-100 hover:scale-105 transition-all text-neutral-600 hover:text-neutral-900 focus:outline-none hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <BiChevronLeft size={24} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute top-[50%] -translate-y-[50%] -right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg border border-neutral-100 hover:scale-105 transition-all text-neutral-600 hover:text-neutral-900 focus:outline-none hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <BiChevronRight size={24} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-2 -mx-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {experiences.map((experience) => (
          <div key={experience.id} className="snap-start shrink-0 w-[85vw] sm:w-[calc(100%/2-12px)] md:w-[calc(100%/3-16px)] lg:w-[calc(100%/4-18px)] xl:w-[calc(100%/5-20px)]">
            <ExperienceCard data={experience} currentUser={currentUser} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCarousel;
