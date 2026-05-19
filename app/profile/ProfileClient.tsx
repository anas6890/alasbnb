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
import { TbCheck, TbUserExclamation, TbCameraPlus } from "react-icons/tb";

interface ProfileClientProps {
  currentUser: SafeUser;
}

export default function ProfileClient({ currentUser }: ProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(currentUser?.image || "/images/placeholder.jpg");

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
        toast.success("Profil mis à jour avec succès !");
        router.refresh();
      })
      .catch(() => {
        toast.error("Un problème est survenu.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Container>
      <div className="max-w-screen-xl mx-auto pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Section gauche : Avatar et informations */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 group border-4 border-neutral-100 shadow-sm">
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
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                    >
                      <TbCameraPlus size={28} />
                    </div>
                  )}
                </CldUploadWidget>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800">{currentUser.firstname} {currentUser.lastname}</h2>
              <p className="text-neutral-500 mt-1">{currentUser.email}</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-lg text-neutral-800">Vérification de l&apos;identité</span>
              </div>
              {currentUser?.isVerified ? (
                <div className="text-teal-600 flex items-center gap-2 font-medium">
                  <TbCheck size={20} /> Identité vérifiée
                </div>
              ) : (
                <div className="text-rose-500 flex items-center gap-2 font-medium">
                  <TbUserExclamation size={20} /> Non vérifiée
                </div>
              )}
            </div>
          </div>

          {/* Section droite : Formulaire */}
          <div className="md:col-span-2">
            <Heading title="Vos informations" subtitle="Modifiez vos informations personnelles et préférences" />
            <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col gap-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="firstname" label="Prénom" disabled={isLoading} register={register} errors={errors} required />
                <Input id="lastname" label="Nom" disabled={isLoading} register={register} errors={errors} required />
              </div>

              <Input id="phone" label="Téléphone (Optionnel)" disabled={isLoading} register={register} errors={errors} />

              <div className="flex flex-col gap-2">
                <label className="text-neutral-500 font-semibold text-sm pl-2">À propos de vous</label>
                <textarea
                  id="bio"
                  disabled={isLoading}
                  {...register("bio")}
                  placeholder="Parlez-nous un peu de vous..."
                  rows={4}
                  className="w-full p-4 font-light bg-white border-2 rounded-md outline-none transition disabled:opacity-70 disabled:cursor-not-allowed border-neutral-300 focus:border-black resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                <Input id="preferredLang" label="Langue (fr, en...)" disabled={isLoading} register={register} errors={errors} />
                <Input id="currency" label="Devise (EUR, USD...)" disabled={isLoading} register={register} errors={errors} />
              </div>

              <div className="pt-6">
                <Button disabled={isLoading} label="Enregistrer les modifications" onClick={handleSubmit(onSubmit)} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </Container>
  );
}
