"use client";

import Image from "next/image";
import { format } from "date-fns";
import React, { useState } from "react";
import { TbMessageCircle, TbSpray, TbCheck, TbKey, TbMessage, TbMap, TbTag, TbChevronRight } from "react-icons/tb";

interface ListingReviewsProps {
  reviews: any[];
  listing: any;
}

const ListingReviews: React.FC<ListingReviewsProps> = ({ reviews, listing }) => {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  if (reviews.length === 0) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 rounded-2xl border border-neutral-100 border-dashed">
          <TbMessageCircle size={48} className="text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-800 mb-1">Aucun commentaire pour l'instant</h3>
          <p className="text-neutral-500 font-light text-center max-w-sm text-sm">
            Ce logement est nouveau ou n'a pas encore reçu d'avis. Soyez le premier à partager votre expérience !
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
    { label: "Propreté", score: (listing.avgRatingCleanliness || 5).toFixed(1).replace('.', ','), icon: TbSpray },
    { label: "Précision", score: (listing.avgRatingAccuracy || 5).toFixed(1).replace('.', ','), icon: TbCheck },
    { label: "Arrivée", score: (listing.avgRatingCheckin || 5).toFixed(1).replace('.', ','), icon: TbKey },
    { label: "Communication", score: (listing.avgRatingCommunication || 5).toFixed(1).replace('.', ','), icon: TbMessage },
    { label: "Emplacement", score: (listing.avgRatingLocation || 5).toFixed(1).replace('.', ','), icon: TbMap },
    { label: "Qualité-prix", score: (listing.avgRatingValue || 5).toFixed(1).replace('.', ','), icon: TbTag },
  ];

  const tags = ["Propreté", "Se déplacer", "Emplacement", "Hospitalité", "Confort", "Climatisation", "Chauffage", "Arrivée"];

  return (
    <div className="py-12 w-full flex flex-col">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
          <span className="text-[24px] md:text-[28px] pb-1">★</span> <span>{(listing.avgRating || 5).toFixed(2).replace('.', ',')} · {listing.totalReviews || 0} commentaires</span>
        </h2>
        <span className="text-sm font-medium text-neutral-500 underline underline-offset-2 cursor-pointer hover:text-neutral-800 transition">
          Fonctionnement des commentaires
        </span>
      </div>

      {/* Ratings Grid */}
      <div className="flex flex-row flex-wrap lg:flex-nowrap gap-x-4 gap-y-6 pb-10 border-b border-neutral-200 w-full overflow-hidden">
        
        {/* Global Evaluation Bar Chart */}
        <div className="flex flex-col gap-1 w-[160px] pr-6 lg:border-r border-neutral-200">
          <span className="text-[14px] font-medium text-neutral-800 mb-1">Évaluation globale</span>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800 w-2">{rating}</span>
              <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-neutral-800 rounded-full" 
                  style={{ width: rating === 5 ? '90%' : rating === 4 ? '15%' : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        {categories.map((cat, i) => (
          <div key={i} className={`flex flex-col justify-between pl-4 pr-6 ${i !== categories.length - 1 ? 'lg:border-r border-neutral-200' : ''}`}>
            <div className="flex flex-col">
              <span className="text-sm font-light text-neutral-800">{cat.label}</span>
              <span className="text-lg font-semibold text-neutral-900 mt-1">{cat.score}</span>
            </div>
            <cat.icon size={26} className="text-neutral-700 mt-4 stroke-[1.2]" />
          </div>
        ))}
      </div>

      {/* Tags Pill Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto py-8 no-scrollbar relative border-b border-neutral-200">
        {tags.map((tag, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-full whitespace-nowrap text-sm font-semibold text-neutral-800 cursor-pointer hover:border-neutral-900 transition shadow-sm">
            {tag}
          </div>
        ))}
        <div className="sticky right-0 bg-white shadow-[-10px_0_15px_white] pl-2 flex items-center h-full">
          <button className="p-2 border border-neutral-300 rounded-full hover:shadow-md transition">
            <TbChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 mt-10">
        {reviews.slice(0, 6).map((review: any) => {
          const authorDate = review.author?.createdAt ? new Date(review.author.createdAt) : new Date();
          const activeYears = Math.max(1, new Date().getFullYear() - authorDate.getFullYear());
          const authorDuration = `${activeYears} an${activeYears > 1 ? "s" : ""} sur Alasbnb`;
          const isExpanded = expandedReviews[review.id];
          const isLong = review.comment?.length > 150;

          return (
            <div key={review.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-4 mb-1">
                <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-neutral-200 shadow-sm">
                  {review.author?.image ? (
                    <Image
                      src={review.author.image}
                      alt={review.author?.firstname || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-neutral-500 text-lg">
                      {review.author?.firstname?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-base text-neutral-900">
                    {review.author?.firstname}
                  </span>
                  <span className="text-neutral-500 text-sm font-normal">
                    {authorDuration}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-[13px] text-neutral-800 font-medium">
                <div className="flex items-center tracking-tighter text-neutral-800 text-[10px]">
                  ★★★★★
                </div>
                <span className="text-neutral-500 font-black mb-1">·</span>
                <span className="text-neutral-500">{review.createdAt ? format(new Date(review.createdAt), "MMMM yyyy") : "août 2025"}</span>
                {Math.random() > 0.5 && (
                  <>
                    <span className="text-neutral-500 font-black mb-1">·</span>
                    <span className="text-neutral-500">Voyage en groupe</span>
                  </>
                )}
              </div>

              <div className="flex flex-col items-start gap-1">
                <p className={`text-neutral-800 font-normal text-[16px] leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {review.comment}
                </p>
                
                {isLong && !isExpanded && (
                  <button 
                    onClick={() => toggleReview(review.id)}
                    className="text-[15px] font-medium underline text-neutral-900 hover:text-neutral-600 transition mt-1"
                  >
                    Lire la suite
                  </button>
                )}
                {isLong && isExpanded && (
                  <button 
                    onClick={() => toggleReview(review.id)}
                    className="text-[15px] font-medium underline text-neutral-900 hover:text-neutral-600 transition mt-1"
                  >
                    Réduire
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {reviews.length > 6 && (
        <div className="mt-12">
          <button className="border border-neutral-900 hover:bg-neutral-50 active:scale-95 transition-all text-neutral-900 font-bold px-6 py-3 rounded-xl text-[15px] shadow-sm">
            Afficher les {reviews.length} commentaires
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingReviews;
