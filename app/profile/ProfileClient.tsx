"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { SafeUser } from "@/types";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";
import Button from "@/components/Button";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { TbCheck, TbUserExclamation, TbCameraPlus, TbShieldCheck, TbEdit } from "react-icons/tb";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

interface ProfileClientProps {
  currentUser: SafeUser;
}

export default function ProfileClient({ currentUser }: ProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(currentUser?.image || "/images/placeholder.jpg");
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      firstname: currentUser.firstname || "",
      lastname: currentUser.lastname || "",
      phone: currentUser.phone || "",
      bio: currentUser.bio || "",
      preferredLang: currentUser.preferredLang || "fr",
      currency: currentUser.currency || "EUR",
      image: currentUser.image || "",
    },
  });

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cptcecyi";

  const handleUpload = (result: any) => {
    const newImage = result.info.secure_url;
    setProfileImage(newImage);
    setValue("image", newImage, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios.put("/api/profile", data)
      .then(() => {
        toast.success(t.profile_success || "Profil mis à jour avec succès !");
        router.refresh();
      })
      .catch(() => {
        toast.error(t.profile_error || "Un problème est survenu.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-brand-500/10 to-teal-200/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-rose-500/10 to-orange-200/10 blur-[100px] pointer-events-none"></div>

      <Container>
        <div className="max-w-6xl mx-auto pt-8 pb-24 relative z-10">
          
          {/* Luxury Split Container */}
          <div className="flex flex-col md:flex-row bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-white/50 min-h-[75vh] hover:shadow-[0_30px_100px_rgba(0,0,0,0.08)] transition-shadow duration-700">
            
            {/* Left Panel - Dark & Elegant */}
            <div className="md:w-[35%] bg-neutral-900 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {/* Soft animated glow effect in the background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 via-neutral-900 to-rose-600/20 opacity-60 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-[spin_120s_linear_infinite] pointer-events-none"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 group shadow-2xl ring-4 ring-neutral-800 transition-all duration-500 hover:ring-brand-500">
                <Image
                  src={profileImage || "/images/placeholder.jpg"}
                  alt="Profile"
                  fill
                  style={{ objectFit: "cover" }}
                />

                <CldUploadWidget
                  onUpload={handleUpload}
                  onSuccess={handleUpload}
                  uploadPreset={uploadPreset}
                  options={{ maxFiles: 1 }}
                >
                  {({ open }) => (
                    <div
                      onClick={() => open?.()}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white"
                    >
                      <TbCameraPlus size={36} className="mb-2" />
                      <span className="text-sm font-semibold tracking-wide">{t.profile_edit_photo || "Modifier"}</span>
                    </div>
                  )}
                </CldUploadWidget>
              </div>
              
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                {currentUser.firstname} {currentUser.lastname}
              </h2>
              <p className="text-neutral-400 font-light mb-10">{currentUser.email}</p>
            </div>
          </div>

          {/* Right Panel - Form (Light Mode) */}
          <div className="md:w-[65%] p-10 lg:p-16 flex flex-col justify-center bg-white relative">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-neutral-100 text-neutral-900 rounded-2xl">
                <TbEdit size={28} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{t.profile_info_title || "Vos Informations"}</h3>
                <p className="text-neutral-500 font-medium mt-1">{t.profile_info_subtitle || "Mettez à jour vos données personnelles"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8 w-full max-w-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="firstname" label={t.profile_firstname || "Prénom"} disabled={isLoading} register={register} errors={errors} required />
                <Input id="lastname" label={t.profile_lastname || "Nom"} disabled={isLoading} register={register} errors={errors} required />
              </div>

              <div className="w-full">
                <Input id="phone" label={t.profile_phone || "Téléphone (Optionnel)"} disabled={isLoading} register={register} errors={errors} />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-neutral-900 font-bold text-sm tracking-wide ml-1">{t.profile_about_label || "À propos de vous"}</label>
                <textarea
                  id="bio"
                  disabled={isLoading}
                  {...register("bio")}
                  placeholder={t.profile_about_placeholder || "Décrivez-vous en quelques mots, vos passions, ce que vous aimez en voyage..."}
                  rows={4}
                  className="w-full p-5 font-medium text-neutral-800 bg-neutral-50 border-2 rounded-[20px] outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed border-neutral-100 focus:border-neutral-900 focus:bg-white resize-none hover:bg-neutral-100/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <Input id="preferredLang" label={t.profile_lang || "Langue (ex: fr, en)"} disabled={isLoading} register={register} errors={errors} />
                <Input id="currency" label={t.profile_currency || "Devise (ex: EUR, USD)"} disabled={isLoading} register={register} errors={errors} />
              </div>

              <div className="pt-8 mt-4 flex justify-end border-t border-neutral-100">
                <div className="w-full md:w-auto">
                  <button 
                    disabled={isLoading}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full md:w-auto px-10 py-4 bg-neutral-900 hover:bg-black text-white font-bold rounded-full transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 active:scale-95 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-out"></span>
                    <TbCheck size={22} className="relative z-10" />
                    <span className="relative z-10">{t.profile_save || "Enregistrer les modifications"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </Container>
    </div>
  );
}
