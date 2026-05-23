"use client";

import Image from "next/image";
import { format } from "date-fns";
import { fr, enUS, es, de } from "date-fns/locale";
import React, { useState } from "react";
import { TbMessageCircle, TbSpray, TbCheck, TbKey, TbMessage, TbMap, TbTag, TbChevronRight } from "react-icons/tb";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface ListingReviewsProps {
  reviews: any[];
  listing: any;
}

const getLocale = (lang: string) => {
  if (lang === "en") return enUS;
  if (lang === "es") return es;
  if (lang === "de") return de;
  return fr;
};

const ListingReviews: React.FC<ListingReviewsProps> = ({ reviews, listing }) => {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const dateLocale = getLocale(language);

  if (reviews.length === 0) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
          <TbMessageCircle size={48} className="text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-800 mb-1">{t.no_reviews_yet}</h3>
          <p className="text-neutral-500 font-light text-center max-w-sm text-sm">
            {t.no_reviews_desc}
          </p>
        </div>
      </div>
    );
  }

  const toggleReview = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Dynamic values from database
  const categories = [
    { label: t.cleanliness, score: (listing.avgRatingCleanliness || 5).toFixed(1).replace('.', ','), icon: TbSpray },
    { label: t.accuracy, score: (listing.avgRatingAccuracy || 5).toFixed(1).replace('.', ','), icon: TbCheck },
    { label: t.checkin, score: (listing.avgRatingCheckin || 5).toFixed(1).replace('.', ','), icon: TbKey },
    { label: t.communication, score: (listing.avgRatingCommunication || 5).toFixed(1).replace('.', ','), icon: TbMessage },
    { label: t.location, score: (listing.avgRatingLocation || 5).toFixed(1).replace('.', ','), icon: TbMap },
    { label: t.value, score: (listing.avgRatingValue || 5).toFixed(1).replace('.', ','), icon: TbTag },
  ];

  return (
    <div className="py-12 w-full flex flex-col">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-[22px] md:text-[26px] font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <span className="text-brand-500 pb-1">★</span> 
          <span>
            {reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + (r.avgRating || 0), 0) / reviews.length).toFixed(2).replace('.', ',') 
              : t.new}
            {reviews.length > 0 && ` · ${reviews.length} ${t.reviews_count}`}
          </span>
        </h2>
      </div>

      {/* Ratings Grid - Cleaned up to be purely dynamic */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pb-12 border-b border-neutral-100 w-full">
        {categories.map((cat, i) => (
          <div key={i} className="flex flex-col gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 transition hover:bg-white hover:shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-neutral-800">{cat.label}</span>
              <span className="text-lg font-black text-neutral-900">{cat.score}</span>
            </div>
            <cat.icon size={22} className="text-neutral-900" />
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 mt-12">
        {reviews.slice(0, 6).map((review: any) => {
          const authorDate = review.author?.createdAt ? new Date(review.author.createdAt) : new Date();
          const activeYears = Math.max(1, new Date().getFullYear() - authorDate.getFullYear());
          const yearString = activeYears > 1 ? t.years_plural : t.year_singular;
          const authorDuration = `${activeYears} ${yearString} ${t.years_on_alasbnb}`;
          const isExpanded = expandedReviews[review.id];
          const isLong = review.comment?.length > 150;

          return (
            <div key={review.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-[44px] h-[44px] rounded-full overflow-hidden bg-neutral-200 shadow-sm border border-neutral-100">
                  {review.author?.image ? (
                    <Image
                      src={review.author.image}
                      alt={review.author?.firstname || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-neutral-500 text-base">
                      {review.author?.firstname?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] text-neutral-900">
                    {review.author?.firstname}
                  </span>
                  <span className="text-neutral-400 text-xs font-bold uppercase tracking-tight">
                    {authorDuration}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                <div className="flex items-center text-brand-500 tracking-tighter">
                  {"★".repeat(Math.round(review.avgRating || 5))}
                  <span className="text-neutral-200">{"★".repeat(5 - Math.round(review.avgRating || 5))}</span>
                </div>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-500">{review.createdAt ? format(new Date(review.createdAt), "MMMM yyyy", { locale: dateLocale }) : "Août 2025"}</span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <p className={`text-neutral-700 font-medium text-[15px] leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {review.comment}
                </p>
                
                {isLong && (
                  <button 
                    onClick={() => toggleReview(review.id)}
                    className="text-[14px] font-bold underline text-neutral-900 hover:text-black transition mt-1"
                  >
                    {isExpanded ? t.read_less : t.read_more}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reviews.length > 6 && (
        <div className="mt-12">
          <button className="border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all text-neutral-900 font-black px-8 py-3 rounded-xl text-[14px] uppercase tracking-widest">
            {t.show_all_x_reviews} {reviews.length} {t.reviews_count}
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingReviews;
