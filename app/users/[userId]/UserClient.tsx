"use client";

import { SafeUser, safeListing } from "@/types";
import Container from "@/components/Container";
import Image from "next/image";
import { TbCheck, TbShieldCheck, TbStarFilled } from "react-icons/tb";
import ListingCard from "@/components/listing/ListingCard";

interface UserClientProps {
  user: SafeUser & {
    listings: safeListing[];
  };
  currentUser?: SafeUser | null;
}

export default function UserClient({ user, currentUser }: UserClientProps) {
  const joinedDate = new Date(user.createdAt).getFullYear();

  return (
    <Container>
      <div className="max-w-6xl mx-auto pt-10 pb-24">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Panel - Host Info Card */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-neutral-100 sticky top-24">
              <div className="relative w-36 h-36 rounded-full overflow-hidden mb-6 shadow-md ring-4 ring-neutral-50">
                <Image
                  src={user.image || "/images/placeholder.jpg"}
                  alt="Profile"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              
              <h1 className="text-3xl font-black text-neutral-900 mb-2">
                {user.firstname}
              </h1>
              
              <div className="flex items-center gap-2 text-neutral-500 font-medium mb-8">
                <span>Hôte depuis {joinedDate}</span>
              </div>

              {user.isVerified && (
                <div className="w-full flex items-center gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 text-left mb-6">
                  <div className="p-3 bg-white rounded-full shadow-sm text-brand-600">
                    <TbShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Identité vérifiée</h3>
                    <p className="text-neutral-500 text-sm">Cet hôte a fourni une pièce d'identité.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Bio & Listings */}
          <div className="md:col-span-8 flex flex-col gap-10">
            
            {/* Bio Section */}
            <div className="bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">À propos de {user.firstname}</h2>
              <p className="text-lg text-neutral-600 leading-relaxed font-light whitespace-pre-line">
                {user.bio || "Cet utilisateur n'a pas encore rédigé de description."}
              </p>
              
              <div className="flex flex-row flex-wrap gap-4 mt-8 pt-8 border-t border-neutral-100">
                {user.preferredLang && (
                  <div className="flex items-center gap-2 text-neutral-700 bg-neutral-50 px-4 py-2 rounded-full font-medium">
                    <span className="text-neutral-400">Parle :</span> {user.preferredLang}
                  </div>
                )}
              </div>
            </div>

            {/* Listings Section */}
            {user.listings.length > 0 && (
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Les logements de {user.firstname}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      data={listing}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </Container>
  );
}
