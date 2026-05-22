"use client";

import axios from "axios";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { TbStarFilled, TbStar, TbLoader2 } from "react-icons/tb";
import { FiSend } from "react-icons/fi";

interface ReviewInputProps {
  reservationId: string;
}

const CATEGORIES = [
  { id: "ratingCleanliness", label: "Propreté" },
  { id: "ratingAccuracy", label: "Précision" },
  { id: "ratingCheckin", label: "Arrivée" },
  { id: "ratingCommunication", label: "Communication" },
  { id: "ratingLocation", label: "Emplacement" },
  { id: "ratingValue", label: "Qualité-prix" },
];

const ReviewInput: React.FC<ReviewInputProps> = ({ reservationId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      ratingCleanliness: 5,
      ratingAccuracy: 5,
      ratingCheckin: 5,
      ratingCommunication: 5,
      ratingLocation: 5,
      ratingValue: 5,
      comment: "",
    },
  });

  const comment = watch("comment");
  const formValues = watch();

  const avgRating = useMemo(() => {
    const total = CATEGORIES.reduce((sum, cat) => sum + (formValues[cat.id] || 5), 0);
    return (total / CATEGORIES.length).toFixed(1);
  }, [formValues]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!data.comment.trim()) {
      toast.error("Veuillez laisser un commentaire.");
      return;
    }

    setIsLoading(true);

    axios
      .post("/api/reviews", {
        reservationId,
        ratingCleanliness: data.ratingCleanliness,
        ratingAccuracy: data.ratingAccuracy,
        ratingCheckin: data.ratingCheckin,
        ratingCommunication: data.ratingCommunication,
        ratingLocation: data.ratingLocation,
        ratingValue: data.ratingValue,
        comment: data.comment,
      })
      .then(() => {
        toast.success("Avis envoyé avec succès !");
        reset();
      })
      .catch(() => {
        toast.error("Une erreur s'est produite.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div 
      className="mt-4 flex flex-col gap-6 bg-white border border-neutral-200 p-6 md:p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)]" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="text-xl font-bold text-neutral-900 tracking-tight">Évaluer votre séjour</h4>
          <p className="text-sm font-medium text-neutral-500 mt-1">
            Partagez votre expérience
          </p>
        </div>
        <div className="bg-neutral-900 text-white px-4 py-2 rounded-xl flex flex-col items-center justify-center self-start sm:self-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">Global</span>
          <span className="text-lg font-bold leading-none">{avgRating}</span>
        </div>
      </div>

      <div className="flex flex-col gap-y-5 border-y border-neutral-100 py-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-2">
            <label className="text-sm font-medium text-neutral-800">{cat.label}</label>
            <div className="flex items-center gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [cat.id]: star }))}
                  onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [cat.id]: 0 }))}
                  onClick={() => setValue(cat.id, star)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  {(hoverRatings[cat.id] || formValues[cat.id] || 5) >= star ? (
                    <TbStarFilled size={24} className="text-neutral-900 drop-shadow-sm transition-colors" />
                  ) : (
                    <TbStar size={24} className="text-neutral-200 transition-colors" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <label className="text-[15px] font-bold text-neutral-900">Votre commentaire</label>
          <span className="text-[12px] font-medium text-neutral-400">{comment?.length || 0} / 500</span>
        </div>
        <textarea
          {...register("comment", { required: true, maxLength: 500 })}
          disabled={isLoading}
          placeholder="Comment s'est passé votre séjour ? Qu'avez-vous particulièrement apprécié ?"
          className={`
            w-full p-5 bg-neutral-50/50 border rounded-[20px] resize-none min-h-[140px] transition-all
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900
            text-[15px] font-medium text-neutral-800 placeholder-neutral-400
            ${errors.comment ? 'border-rose-500 bg-rose-50' : 'border-neutral-200'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading || !comment?.trim()}
        className="mt-2 w-full bg-neutral-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md text-[16px]"
      >
        {isLoading ? (
          <TbLoader2 size={24} className="animate-spin" />
        ) : (
          <>
            <FiSend size={20} /> Envoyer l'avis public
          </>
        )}
      </button>
    </div>
  );
};

export default ReviewInput;
