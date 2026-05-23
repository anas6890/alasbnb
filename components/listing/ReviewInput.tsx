"use client";

import axios from "axios";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { TbStarFilled, TbStar, TbLoader2 } from "react-icons/tb";
import { FiSend, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface ReviewInputProps {
  reservationId: string;
  onCancel?: () => void;
}

const CATEGORIES = [
  { id: "ratingCleanliness", translationKey: "cleanliness" },
  { id: "ratingAccuracy", translationKey: "accuracy" },
  { id: "ratingCheckin", translationKey: "checkin" },
  { id: "ratingCommunication", translationKey: "communication" },
  { id: "ratingLocation", translationKey: "location" },
  { id: "ratingValue", translationKey: "value" },
];

const ReviewInput: React.FC<ReviewInputProps> = ({ reservationId, onCancel }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRatings, setHoverRatings] = useState<Record<string, number>>({});
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;

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
    return parseFloat((total / CATEGORIES.length).toFixed(1));
  }, [formValues]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/reviews", {
        ...data,
        avgRating,
        reservationId,
      })
      .then(() => {
        toast.success(t.review_success || "Avis publié avec succès !");
        router.refresh();
        reset();
        if (onCancel) onCancel();
      })
      .catch(() => {
        toast.error(t.review_error || "Erreur lors de la publication de l'avis");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleStarClick = (categoryId: string, rating: number) => {
    setValue(categoryId, rating);
  };

  return (
    <div className="bg-white border-2 border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{t.review_title || "Comment s'est passé votre séjour ?"}</h3>
          <p className="text-sm text-neutral-500 font-medium">{t.review_subtitle || "Votre avis aide la communauté et l'hôte à s'améliorer."}</p>
        </div>
        {onCancel && (
            <button 
                onClick={onCancel}
                className="p-2 hover:bg-neutral-100 rounded-full transition text-neutral-400 hover:text-neutral-900"
            >
                <FiX size={20} />
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between group">
            <span className="text-[15px] font-medium text-neutral-700 group-hover:text-neutral-900 transition">{t[cat.translationKey] || cat.translationKey}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = formValues[cat.id] || 5;
                const hoverRating = hoverRatings[cat.id];
                const isActive = star <= (hoverRating || currentRating);

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(cat.id, star)}
                    onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [cat.id]: star }))}
                    onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [cat.id]: 0 }))}
                    className="p-0.5 transition-transform hover:scale-125 active:scale-90"
                  >
                    {isActive ? (
                      <TbStarFilled size={18} className="text-neutral-900" />
                    ) : (
                      <TbStar size={18} className="text-neutral-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <label className="text-[15px] font-bold text-neutral-800">{t.review_comment_label || "Votre commentaire"}</label>
            <span className="text-[11px] font-bold px-2 py-1 bg-neutral-900 text-white rounded-md uppercase tracking-wider">{avgRating}/5</span>
        </div>
        <textarea
          {...register("comment", { required: true })}
          placeholder={t.review_comment_placeholder || "Dites-nous en plus sur votre expérience..."}
          className="w-full min-h-[120px] p-4 rounded-xl border-2 border-neutral-200 focus:border-neutral-800 outline-none transition resize-none text-[15px] placeholder:text-neutral-400"
        />
      </div>

      <div className="flex items-center gap-3 w-full pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 border-2 border-neutral-200 rounded-xl font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
          >
            {t.cancel || "Annuler"}
          </button>
        )}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading || !comment.trim()}
          className="flex-[2] bg-neutral-900 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          {isLoading ? <TbLoader2 className="animate-spin" size={20} /> : <FiSend size={18} />}
          {t.review_publish || "Publier mon avis"}
        </button>
      </div>
    </div>
  );
};

export default ReviewInput;
