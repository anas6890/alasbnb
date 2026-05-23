"use client";

import { safeListing, SafeUser } from "@/types";
import { useRef, useState, useEffect } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import ListingCard from "./ListingCard";

import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

interface ListingCarouselProps {
  title: string;
  searchQuery?: string;
  listings: safeListing[];
  currentUser?: SafeUser | null;
}

const ListingCarousel: React.FC<ListingCarouselProps> = ({ title, searchQuery, listings, currentUser }) => {
  const router = useRouter();
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
  }, [listings]);

  if (listings.length === 0) return null;

  return (
    <div className="relative group">
      <div className="flex flex-row items-center justify-between mb-3 px-2">
        <div 
          onClick={() => searchQuery && router.push(`/?locationValue=${encodeURIComponent(searchQuery)}`)}
          className={`flex flex-row items-center gap-3 w-max ${searchQuery ? 'cursor-pointer group' : ''}`}
        >
          <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          {searchQuery && (
             <div className="p-1.5 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition text-neutral-900 mt-1">
                <FiArrowRight size={18} />
             </div>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          {/* Pagination dots or additional UI could go here */}
        </div>
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
        {listings.map((listing) => (
          <div key={listing.id} className="snap-start shrink-0 w-[85vw] sm:w-[calc(100%/2-12px)] md:w-[calc(100%/4-16px)] lg:w-[calc(100%/6-20px)]">
            <ListingCard data={listing} currentUser={currentUser} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingCarousel;
