"use client";

import { SafeUser } from "@/types";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/Container";

interface ContactHostClientProps {
  listing: any;
  currentUser: SafeUser;
}

const ContactHostClient: React.FC<ContactHostClientProps> = ({
  listing,
  currentUser,
}) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hostName = listing.user.firstname || "l'hôte";

  const onSubmit = async () => {
    if (!message.trim()) return;
    setIsLoading(true);

    try {
      const response = await axios.post("/api/contact", {
        listingId: listing.id,
        hostId: listing.hostId,
        content: message,
      });

      toast.success("Message envoyé !");
      router.push(`/messages/${response.data.id}`);
    } catch (error) {
      toast.error("Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="max-w-6xl mx-auto pt-24 pb-20">
        <div className="flex flex-col md:flex-row gap-16">
          
          {/* Left Column - Contact Form */}
          <div className="flex-1 flex flex-col gap-10">
            <div>
              <h1 className="text-[32px] font-bold text-neutral-900 tracking-tight">
                Contactez {hostName}.
              </h1>
              <p className="text-[15px] text-neutral-500 mt-2">
                L'hôte répond généralement dans l'heure
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold text-neutral-900">
                La plupart des voyageurs posent des questions concernant :
              </h3>
              
              <div className="flex flex-col gap-6 text-[15px] text-neutral-800">
                <div>
                  <h4 className="font-semibold mb-1">Accès au logement</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li>L'arrivée dans ce logement commence à {listing.checkInTime}:00 et le départ se fait à {listing.checkOutTime}:00.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Informations sur le logement et règlement intérieur</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    {!listing.smokingAllowed && <li>Non fumeur.</li>}
                    {!listing.partiesAllowed && <li>Pas de fête ni de soirée.</li>}
                    {!listing.petsAllowed && <li>Pas d'animaux.</li>}
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-900">
                Vous avez encore des questions ? Contactez l'hôte
              </h3>
              <textarea
                disabled={isLoading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Bonjour ${hostName} ! Je serai de passage à...`}
                className="w-full p-4 border border-neutral-300 rounded-xl resize-none h-40 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-[15px]"
              />
              <button
                onClick={onSubmit}
                disabled={isLoading || !message.trim()}
                className="bg-neutral-900 text-white font-bold py-3.5 px-8 rounded-lg hover:bg-black transition-all disabled:opacity-50 self-start mt-2"
              >
                Envoyer le message
              </button>
            </div>
          </div>

          {/* Right Column - Listing Summary Card */}
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div className="sticky top-28 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              
              <div className="flex gap-4 items-start">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="font-bold text-xl">
                    {listing.pricePerNight} € <span className="text-sm font-normal text-neutral-500">par nuit</span>
                  </div>
                  <div className="text-sm font-medium text-neutral-800 line-clamp-2">
                    {listing.title}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {listing.type}
                  </div>
                </div>
                <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image fill src={listing.images[0]} alt="Listing" className="object-cover" />
                </div>
              </div>

              <div className="flex flex-col border border-neutral-300 rounded-xl p-4 bg-neutral-50 gap-2">
                <div className="text-sm text-neutral-800 font-medium">Vous contactez l'hôte pour obtenir des informations sur ce logement.</div>
                <div className="text-xs text-neutral-500">Aucune réservation ne sera effectuée à cette étape.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Container>
  );
}

export default ContactHostClient;
