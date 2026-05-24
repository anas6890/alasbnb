"use client";

import { safeListing, SafeUser } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiEye, FiCheckCircle, FiClock, FiGrid, FiList } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import useLanguage from "@/hook/useLanguage";
import { usePrice } from "@/hook/usePrice";
import { translations } from "@/lib/translations";

interface HostListingsClientProps {
  listings: safeListing[];
  experiences: any[];
  currentUser?: SafeUser | null;
}

const HostListingsClient: React.FC<HostListingsClientProps> = ({
  listings,
  experiences,
  currentUser,
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "experiences">("listings");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState("");

  const items = activeTab === "listings" ? listings : experiences;

  const onDelete = (id: string) => {
    setDeletingId(id);
    const endpoint = activeTab === "listings" ? `/api/listings/${id}` : `/api/experiences/${id}`;

    axios.delete(endpoint)
      .then(() => {
        toast.success(t.host_listings_toast_deleted);
        router.refresh();
      })
      .catch(() => {
        toast.error(t.host_listings_toast_error);
      })
      .finally(() => {
        setDeletingId("");
      });
  };

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight mb-3">{t.host_listings_title}</h1>
          <p className="text-lg text-neutral-500 font-medium">{t.host_listings_subtitle}</p>
        </div>
        <button
          onClick={() => router.push(`/hosting/create?type=${activeTab === 'listings' ? 'LISTING' : 'EXPERIENCE'}`)}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-6 py-3.5 rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
        >
          <FiPlus size={20} />
          {t.host_listings_create}
        </button>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-full border border-neutral-200 shadow-sm">
        <div className="flex gap-2 w-full md:w-auto relative">
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 z-10 ${activeTab === 'listings' ? 'text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.logements || "Logements"} ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("experiences")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 z-10 ${activeTab === 'experiences' ? 'text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.experiences || "Expériences"} ({experiences.length})
          </button>
          
          {/* Animated Tab Background */}
          <div 
            className={`absolute top-0 bottom-0 w-1/2 bg-neutral-900 rounded-full transition-transform duration-300 ease-out`}
            style={{ transform: activeTab === 'listings' ? 'translateX(0%)' : 'translateX(100%)' }}
          ></div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-neutral-100 p-1.5 rounded-full mr-1">
            <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
                <FiGrid size={18} />
            </button>
            <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
                <FiList size={18} />
            </button>
        </div>
      </div>

      {/* Content Area */}
      {items.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-neutral-100 shadow-sm flex flex-col items-center gap-6">
          <div className="p-8 bg-neutral-50 rounded-full text-neutral-300 border border-neutral-100">
            <FiList size={56} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-black text-neutral-900 tracking-tight">{t.host_listings_none_found || "Aucune annonce"}</p>
            <p className="text-neutral-500 font-medium">{t.host_listings_none_desc || "Vous n'avez pas encore créé d'annonce."}</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-6"}>
          {items.map((item) => {
            const isListing = activeTab === 'listings';
            const locationString = item.location?.city === item.location?.country 
              ? item.location?.city 
              : `${item.location?.city || ''}${item.location?.city && item.location?.country ? ', ' : ''}${item.location?.country || ''}`;

            return (
              <div 
                  key={item.id}
                  className={`
                      bg-white transition-all duration-500 group relative overflow-hidden
                      ${viewMode === 'grid' 
                          ? 'rounded-3xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-neutral-200 hover:border-transparent flex flex-col' 
                          : 'rounded-3xl p-4 flex flex-row items-center gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-neutral-200'}
                  `}
              >
                {/* Image Section */}
                <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'w-32 h-32 flex-none rounded-2xl shadow-sm'}`}>
                  <Image
                    src={item.images?.[0] || "/images/placeholder.jpg"}
                    alt="listing"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                      {item.status === "PUBLISHED" ? (
                          <><FiCheckCircle className="text-teal-500" size={14} /><span className="text-[11px] font-black text-neutral-800 uppercase tracking-wider">{t.host_listings_status_active || "Actif"}</span></>
                      ) : (
                          <><FiClock className="text-amber-500" size={14} /><span className="text-[11px] font-black text-neutral-800 uppercase tracking-wider">{t.host_listings_status_draft || "Brouillon"}</span></>
                      )}
                  </div>
                  
                  {/* Floating Action Buttons on Image (Grid View only) */}
                  {viewMode === 'grid' && (
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <button 
                              onClick={() => router.push(isListing ? `/listings/${item.id}` : `/experiences/${item.id}`)}
                              className="p-2.5 bg-white/90 backdrop-blur-md text-neutral-700 rounded-full hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                              title={t.host_listings_view_listing || "Voir l'annonce"}
                          >
                              <FiEye size={16} />
                          </button>
                          <button 
                              onClick={() => router.push(`/hosting/create?type=${isListing ? 'LISTING' : 'EXPERIENCE'}&editId=${item.id}`)}
                              className="p-2.5 bg-white/90 backdrop-blur-md text-neutral-700 rounded-full hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                              title={t.host_listings_edit || "Modifier"}
                          >
                              <FiEdit2 size={16} />
                          </button>
                          <button 
                              disabled={deletingId === item.id}
                              onClick={() => onDelete(item.id)}
                              className="p-2.5 bg-white/90 backdrop-blur-md text-rose-500 rounded-full hover:bg-rose-600 hover:text-white transition-colors shadow-sm"
                              title={t.host_listings_delete || "Supprimer"}
                          >
                              <FiTrash2 size={16} />
                          </button>
                      </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`flex-1 flex flex-col ${viewMode === 'grid' ? 'p-6' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-black text-neutral-900 group-hover:text-rose-500 transition-colors truncate">
                          {item.title}
                      </h3>
                      <div className="md:hidden">
                           <FiMoreHorizontal size={20} className="text-neutral-400" />
                      </div>
                  </div>
                  
                  <p className="text-sm font-medium text-neutral-500 mb-4 line-clamp-1 truncate" title={locationString}>
                      {locationString}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                      <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-neutral-900">
                            <PriceDisplay price={isListing ? item.pricePerNight : item.pricePerPerson} />
                          </span>
                          <span className="text-xs text-neutral-500 font-medium ml-1">
                              / {isListing ? (t.host_listings_per_night || "nuit") : (t.host_listings_per_person || "pers.")}
                          </span>
                      </div>

                      {/* Action Buttons for List View */}
                      {viewMode === 'list' && (
                          <div className="flex items-center gap-2">
                              <button 
                                  onClick={() => router.push(isListing ? `/listings/${item.id}` : `/experiences/${item.id}`)}
                                  className="p-2 bg-neutral-50 text-neutral-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                  <FiEye size={18} />
                              </button>
                              <button 
                                  onClick={() => router.push(`/hosting/create?type=${isListing ? 'LISTING' : 'EXPERIENCE'}&editId=${item.id}`)}
                                  className="p-2 bg-neutral-50 text-neutral-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                  <FiEdit2 size={18} />
                              </button>
                              <button 
                                  disabled={deletingId === item.id}
                                  onClick={() => onDelete(item.id)}
                                  className="p-2 bg-neutral-50 text-rose-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                  <FiTrash2 size={18} />
                              </button>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PriceDisplay = ({ price }: { price: number }) => {
  const { formattedPrice } = usePrice(price);
  return <>{formattedPrice}</>;
};

export default HostListingsClient;
