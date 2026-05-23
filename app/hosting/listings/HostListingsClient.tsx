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
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">{t.host_listings_title}</h1>
          <p className="text-neutral-500 font-medium">{t.host_listings_subtitle}</p>
        </div>
        <button
          onClick={() => router.push(`/hosting/create?type=${activeTab === 'listings' ? 'LISTING' : 'EXPERIENCE'}`)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition shadow-lg active:scale-95"
        >
          <FiPlus size={20} />
          {t.host_listings_create}
        </button>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-[24px] border border-neutral-100 shadow-sm text-black">
        <div className="flex gap-2 w-full md:w-auto text-black">
            <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'listings' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.logements} ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("experiences")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'experiences' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.experiences} ({experiences.length})
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
                <FiGrid size={18} />
            </button>
            <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
                <FiList size={18} />
            </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border border-neutral-100 shadow-sm flex flex-col items-center gap-6">
          <div className="p-6 bg-neutral-50 rounded-full text-neutral-200 border border-neutral-100">
            <FiList size={48} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-black text-neutral-900 italic">{t.host_listings_none_found}</p>
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">{t.host_listings_none_desc}</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
          {items.map((item) => (
            <div 
                key={item.id}
                className={`
                    bg-white border border-neutral-100 transition-all duration-300 group
                    ${viewMode === 'grid' 
                        ? 'rounded-[32px] overflow-hidden hover:shadow-xl' 
                        : 'rounded-2xl p-4 flex flex-row items-center gap-6 hover:shadow-md'}
                `}
            >
              {/* Image Section */}
              <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'aspect-[4/3]' : 'w-24 h-24 flex-none rounded-xl shadow-sm'}`}>
                <Image
                  src={item.images?.[0] || "/images/placeholder.jpg"}
                  alt="listing"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    {item.status === "PUBLISHED" ? (
                        <><FiCheckCircle className="text-teal-600" size={14} /><span className="text-[10px] font-black text-neutral-800 uppercase tracking-tight">{t.host_listings_status_active}</span></>
                    ) : (
                        <><FiClock className="text-amber-500" size={14} /><span className="text-[10px] font-black text-neutral-800 uppercase tracking-tight">{t.host_listings_status_draft}</span></>
                    )}
                </div>
              </div>

              {/* Content Section */}
              <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-neutral-900 group-hover:text-brand-600 transition-colors truncate">
                        {item.title}
                    </h3>
                    <div className="md:hidden">
                         <FiMoreHorizontal size={20} className="text-neutral-400" />
                    </div>
                </div>
                
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 italic">
                    {item.location.city}, {item.location.country}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-50">
                    <div className="flex items-center gap-1 text-sm font-black text-neutral-900 tracking-tighter">
                        <PriceDisplay price={activeTab === 'listings' ? item.pricePerNight : item.pricePerPerson} />
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight ml-1">
                            / {activeTab === 'listings' ? t.host_listings_per_night : t.host_listings_per_person}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => router.push(activeTab === 'listings' ? `/listings/${item.id}` : `/experiences/${item.id}`)}
                            className="p-2.5 bg-neutral-50 text-neutral-600 rounded-xl hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
                            title={t.host_listings_view_listing}
                        >
                            <FiEye size={16} />
                        </button>
                        <button 
                            className="p-2.5 bg-neutral-50 text-neutral-600 rounded-xl hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
                            title={t.host_listings_edit}
                        >
                            <FiEdit2 size={16} />
                        </button>
                        <button 
                            disabled={deletingId === item.id}
                            onClick={() => onDelete(item.id)}
                            className="p-2.5 bg-neutral-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title={t.host_listings_delete}
                        >
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
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
