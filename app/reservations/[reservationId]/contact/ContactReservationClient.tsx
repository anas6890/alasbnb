"use client";

import { SafeUser } from "@/types";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/Container";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContactReservationClientProps {
  reservation: any;
  listing: any;
  currentUser: SafeUser;
}

const ContactReservationClient: React.FC<ContactReservationClientProps> = ({
  reservation,
  listing,
  currentUser,
}) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hostName = listing.user.firstname || "l'hôte";

  // Dynamic formatting
  const checkInDate = reservation.checkIn ? format(new Date(reservation.checkIn), "dd/MM/yyyy") : "N/A";
  const checkOutDate = reservation.checkOut ? format(new Date(reservation.checkOut), "dd/MM/yyyy") : "N/A";

  const onSubmit = async () => {
    if (!message.trim()) return;
    setIsLoading(true);

    try {
      // Pour une réservation existante, on envoie directement le message
      await axios.post(`/api/messages/${reservation.id}`, {
        content: message,
        receiverId: listing.user.id
      });

      toast.success("Message envoyé !");
      router.push(`/messages/${reservation.id}`);
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
                  <h4 className="font-semibold text-[#00a699] mb-1">Accès au logement</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li>L'arrivée dans ce logement commence à {listing.checkInTime}:00 et le départ se fait à {listing.checkOutTime}:00.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#00a699] mb-1">Informations sur le logement et règlement intérieur</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li>{listing.smokingAllowed ? "Fumeur autorisé." : "Non fumeur."}</li>
                    <li>{listing.partiesAllowed ? "Événements autorisés." : "Pas de fête ni de soirée."}</li>
                    <li>{listing.petsAllowed ? "Animaux de compagnie acceptés." : "Pas d'animaux."}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[#00a699] mb-1">Conditions d'annulation</h4>
                  <ul className="list-disc pl-5 text-neutral-600">
                    <li>Votre réservation est soumise à la politique d'annulation <strong>{reservation.cancellationPolicy}</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <hr className="border-neutral-200" />

            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-900">
                Vous avez encore des questions ? Contactez l'hôte
              </h3>
              <div className="relative">
                <textarea
                  disabled={isLoading}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Bonjour ${hostName} ! J'aimerais savoir...`}
                  className="w-full p-5 border border-neutral-300 rounded-[24px] resize-none h-44 focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] outline-none transition-all shadow-sm text-[15px]"
                />
              </div>
              <button
                onClick={onSubmit}
                disabled={isLoading || !message.trim()}
                className="bg-[#00a699] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#008f84] transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start mt-2 shadow-md hover:shadow-lg"
              >
                Envoyer le message
              </button>
            </div>
          </div>

          {/* Right Column - Reservation Summary Card */}
          <div className="w-full md:w-[380px] flex-shrink-0">
            <div className="sticky top-28 bg-white border border-neutral-200 rounded-3xl p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col gap-6">
              
              <div className="flex gap-4 items-start">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="font-bold text-[15px] text-neutral-800 line-clamp-2">
                    {listing.title}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {listing.location?.city || "Logement entier"}
                  </div>
                </div>
                <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image fill src={listing.images[0]} alt="Listing" className="object-cover" />
                </div>
              </div>

              <div className="flex flex-col border border-neutral-200 rounded-[16px] overflow-hidden">
                <div className="flex border-b border-neutral-200 bg-neutral-50">
                  <div className="flex-1 p-4 border-r border-neutral-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Arrivée</div>
                    <div className="text-[15px] font-semibold text-neutral-800 mt-0.5">{checkInDate}</div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Départ</div>
                    <div className="text-[15px] font-semibold text-neutral-800 mt-0.5">{checkOutDate}</div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Voyageurs</div>
                  <div className="text-[15px] font-semibold text-neutral-800 mt-0.5">
                    {reservation.adults} voyageur{reservation.adults > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-neutral-900">Total payé</span>
                <span className="font-bold text-xl text-neutral-900">{reservation.totalPrice} €</span>
              </div>

              <div className="bg-[#00a699]/10 text-[#00a699] font-bold py-3.5 rounded-xl text-center flex items-center justify-center">
                Réservation Confirmée
              </div>

            </div>
          </div>

        </div>
      </div>
    </Container>
  );
}

export default ContactReservationClient;
