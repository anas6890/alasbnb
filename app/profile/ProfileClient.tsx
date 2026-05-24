"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { SafeUser } from "@/types";
import Container from "@/components/Container";
import Input from "@/components/inputs/Input";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { TbCheck, TbCameraPlus, TbEdit } from "react-icons/tb";
import { FiUser } from "react-icons/fi";
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
    <div className="bg-[#FAFAFA] min-h-screen pb-24 font-sans">
      
      {/* Clean Brand Header */}
      <div className="bg-white border-b border-neutral-200 pt-6 pb-10">
        <Container>
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-500 w-fit border border-rose-100">
              <FiUser size={16} />
              <span className="text-xs font-bold tracking-wider uppercase">Compte</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
              Profil Personnel
            </h1>
            <p className="text-neutral-500 font-medium max-w-xl text-lg">
              Gérez vos informations, votre photo de profil et vos préférences de compte.
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <div className="pt-12">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Avatar & Quick Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-[2rem] p-8 border border-neutral-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                {/* Decorative subtle gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-50/50 to-transparent pointer-events-none"></div>
                
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 mt-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-white transition-all duration-300 group-hover:shadow-[0_12px_40px_rgba(244,63,94,0.15)] z-10">
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
                        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white"
                      >
                        <TbCameraPlus size={32} className="mb-2" />
                        <span className="text-xs font-bold tracking-wide uppercase">{t.profile_edit_photo || "Modifier"}</span>
                      </div>
                    )}
                  </CldUploadWidget>
                </div>
                
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-1 relative z-10">
                  {currentUser.firstname} {currentUser.lastname}
                </h2>
                <p className="text-neutral-500 font-medium text-sm relative z-10">{currentUser.email}</p>
                
                <div className="w-full h-[1px] bg-neutral-100 my-6 relative z-10"></div>
                
                <div className="w-full flex flex-col gap-3 text-left relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400 font-medium">Inscription</span>
                    <span className="text-neutral-900 font-bold">2026</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400 font-medium">Statut</span>
                    <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Vérifié</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Edit Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-neutral-200 shadow-sm flex flex-col gap-8">
                
                <div className="flex items-center gap-4 mb-2 pb-6 border-b border-neutral-100">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
                    <TbEdit size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{t.profile_info_title || "Vos Informations"}</h3>
                    <p className="text-neutral-500 font-medium text-sm mt-1">{t.profile_info_subtitle || "Mettez à jour vos données personnelles"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 w-full">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="firstname" label={t.profile_firstname || "Prénom"} disabled={isLoading} register={register} errors={errors} required />
                    <Input id="lastname" label={t.profile_lastname || "Nom"} disabled={isLoading} register={register} errors={errors} required />
                  </div>

                  <div className="w-full">
                    <Input id="phone" label={t.profile_phone || "Téléphone (Optionnel)"} disabled={isLoading} register={register} errors={errors} />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-neutral-900 font-bold text-sm tracking-wide ml-1">{t.profile_about_label || "À propos de vous"}</label>
                    <textarea
                      id="bio"
                      disabled={isLoading}
                      {...register("bio")}
                      placeholder={t.profile_about_placeholder || "Décrivez-vous en quelques mots, vos passions, ce que vous aimez en voyage..."}
                      rows={4}
                      className="w-full p-4 font-medium text-neutral-800 bg-white border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed border-neutral-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-50 resize-none hover:border-neutral-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <Input id="preferredLang" label={t.profile_lang || "Langue (ex: fr, en)"} disabled={isLoading} register={register} errors={errors} />
                    <Input id="currency" label={t.profile_currency || "Devise (ex: EUR, USD)"} disabled={isLoading} register={register} errors={errors} />
                  </div>

                  <div className="pt-8 mt-4 flex justify-end">
                    <button 
                      disabled={isLoading}
                      onClick={handleSubmit(onSubmit)}
                      className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 shadow-[0_8px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.35)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <TbCheck size={20} />
                      <span>{t.profile_save || "Enregistrer les modifications"}</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </Container>
      </div>
    </div>
  );
}
