"use client";

import React, { useState } from "react";
import Container from "@/components/Container";
import ListingCard from "@/components/listing/ListingCard";
import { SafeUser } from "@/types";
import { translations } from "@/lib/translations";
import useLanguage from "@/hook/useLanguage";
import { FiHeart, FiHome, FiCompass, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

type Props = {
  listings: any[];
  experiences: any[];
  currentUser?: SafeUser | null;
  initialViewType?: "LISTING" | "EXPERIENCE";
};

const FavoritesClient: React.FC<Props> = ({ listings, experiences, currentUser, initialViewType = "LISTING" }) => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const [activeTab, setActiveTab] = useState<"LISTING" | "EXPERIENCE">(initialViewType);

  const currentItems = activeTab === "LISTING" ? listings : experiences;
  
  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 font-sans">
      
      {/* Clean Header */}
      <div className="bg-white border-b border-neutral-200 pt-6 pb-10">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-500 w-fit border border-rose-100">
                <FiHeart size={14} className="fill-rose-500" />
                <span className="text-xs font-bold tracking-wider uppercase">Coups de cœur</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
                {t.favorites || 'Mes Favoris'}
              </h1>
              <p className="text-neutral-500 font-medium max-w-xl text-lg">
                {t.favorites_subtitle || 'Retrouvez tous les hébergements et expériences qui vous ont fait rêver, réunis au même endroit.'}
              </p>
            </div>

            {/* Brand-themed Tabs */}
            <div className="flex items-center gap-2 bg-neutral-100/50 p-1.5 rounded-2xl border border-neutral-200">
              <button
                onClick={() => setActiveTab("LISTING")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "LISTING" 
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200" 
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <FiHome size={18} />
                <span>{t.logements || 'Logements'}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${activeTab === "LISTING" ? "bg-white/20" : "bg-neutral-200 text-neutral-500"}`}>
                  {listings.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab("EXPERIENCE")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === "EXPERIENCE" 
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200" 
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                }`}
              >
                <FiCompass size={18} />
                <span>{t.experiences || 'Expériences'}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${activeTab === "EXPERIENCE" ? "bg-white/20" : "bg-neutral-200 text-neutral-500"}`}>
                  {experiences.length}
                </span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <div className="pt-12">
        <Container>
          {currentItems.length === 0 ? (
            /* Clean Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-neutral-200 shadow-sm animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
              <div className="w-24 h-24 mb-6 rounded-full bg-rose-50 flex items-center justify-center shadow-inner relative border border-rose-100">
                <FiHeart size={40} className="text-rose-500 fill-rose-50" />
                <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-rose-200">
                  <span className="text-rose-500 font-bold text-xs">0</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3 text-center">
                {activeTab === "LISTING" ? (t.no_favorites_title || 'Aucun logement favori') : (t.no_fav_exp_title || 'Aucune expérience favorite')}
              </h3>
              <p className="text-neutral-500 text-center max-w-md mb-8 font-medium">
                {activeTab === "LISTING" 
                  ? (t.no_listing_desc || "Vous n'avez pas encore sauvegardé de logements. Explorez nos destinations et ajoutez vos coups de cœur.") 
                  : (t.no_experience_desc || "Vous n'avez pas encore sauvegardé d'expériences. Découvrez des activités uniques.")}
              </p>
              
              <Link href={activeTab === "LISTING" ? "/" : "/experiences"} className="group flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_8px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.35)] hover:-translate-y-1 transition-all duration-300">
                <span>{t.explore_button || 'Explorer maintenant'}</span>
                <FiArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            /* Listings Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {currentItems.map((listing) => (
                <div key={listing.id} className="group cursor-pointer">
                  <ListingCard
                    currentUser={currentUser}
                    data={listing}
                    isExperience={activeTab === "EXPERIENCE"}
                  />
                </div>
              ))}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default FavoritesClient;
