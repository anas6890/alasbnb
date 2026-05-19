"use client";

import { useMemo, useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { categories, experienceCategories } from "@/components/navbar/Categories";

import Heading from "@/components/Heading";
import CategoryInput from "@/components/inputs/CategoryInput";
import CitySelect from "@/components/inputs/CitySelect";
import Input from "@/components/inputs/Input";
import Counter from "@/components/inputs/Counter";
import ImageUpload from "@/components/inputs/ImageUpload";
import Button from "@/components/Button";
import { TbToolsKitchen2, TbWifi, TbCar, TbPool, TbPaw, TbClock } from "react-icons/tb";
import { MdTv, MdOutlineLocalLaundryService, MdOutlineSensors, MdOutlineFireExtinguisher, MdOutlineSecurity, MdOutlineHomeWork, MdOutlineMap } from "react-icons/md";

enum STEPS {
  TYPE = 0,
  CATEGORY = 1,
  LOCATION = 2,
  INFO = 3,
  AMENITIES = 4,
  IMAGES = 5,
  DESCRIPTION = 6,
  PRICE = 7,
}

const AMENITIES_LIST = [
  { label: "Cuisine", icon: TbToolsKitchen2 },
  { label: "Wifi", icon: TbWifi },
  { label: "Stationnement gratuit sur place", icon: TbCar },
  { label: "Piscine", icon: TbPool },
  { label: "Animaux acceptés", icon: TbPaw },
  { label: "Télévision", icon: MdTv },
  { label: "Lave-linge", icon: MdOutlineLocalLaundryService },
  { label: "Détecteur de monoxyde de carbone", icon: MdOutlineSensors },
  { label: "Détecteur de fumée", icon: MdOutlineFireExtinguisher },
  { label: "Caméras de surveillance extérieures présentes sur place", icon: MdOutlineSecurity }
];

const CreateListingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type");

  const [step, setStep] = useState(STEPS.TYPE);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      type: typeParam === "EXPERIENCE" ? "EXPERIENCE" : "LISTING", // Initialize based on URL
      category: "",
      location: null,
      city: "",
      address: "",
      guestCount: 1,
      roomCount: 1,
      bedCount: 1,
      bathroomCount: 1,
      duration: 60, // for experience
      amenities: [],
      images: [],
      price: 1,
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (typeParam === "EXPERIENCE" || typeParam === "LISTING") {
      setStep(STEPS.CATEGORY); // Skip the first step if type is pre-selected
    }
  }, [typeParam]);

  const creationType = watch("type");
  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bedCount = watch("bedCount");
  const bathroomCount = watch("bathroomCount");
  const duration = watch("duration");
  const images = watch("images");
  const amenities = watch("amenities") || [];

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        ssr: false,
      }),
    []
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const toggleAmenity = (label: string) => {
    if (amenities.includes(label)) {
      setCustomValue("amenities", amenities.filter((item: string) => item !== label));
    } else {
      setCustomValue("amenities", [...amenities, label]);
    }
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    setIsLoading(true);

    const url = data.type === "LISTING" ? "/api/listings" : "/api/experiences";

    axios
      .post(url, data)
      .then(() => {
        toast.success("Annonce créée avec succès !");
        router.push("/hosting/listings");
        router.refresh();
      })
      .catch(() => {
        toast.error("Une erreur est survenue.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  let bodyContent = (
    <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
      <Heading
        title="Que souhaitez-vous proposer sur AlasBnB ?"
        subtitle="Choisissez le type d'annonce"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div 
           onClick={() => {
             setCustomValue("type", "LISTING");
             setCustomValue("category", ""); // reset category if changed
           }}
           className={`p-6 border-2 rounded-2xl cursor-pointer hover:border-black transition flex flex-col gap-4 ${creationType === 'LISTING' ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}
         >
            <MdOutlineHomeWork size={40} className="text-brand-500" />
            <div>
               <p className="font-bold text-lg">Un logement</p>
               <p className="text-sm text-neutral-500 text-balance">Appartement, maison, villa, ou tout autre type d'hébergement.</p>
            </div>
         </div>
         <div 
           onClick={() => {
             setCustomValue("type", "EXPERIENCE");
             setCustomValue("category", ""); // reset category if changed
           }}
           className={`p-6 border-2 rounded-2xl cursor-pointer hover:border-black transition flex flex-col gap-4 ${creationType === 'EXPERIENCE' ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}
         >
            <MdOutlineMap size={40} className="text-teal-600" />
            <div>
               <p className="font-bold text-lg">Une expérience</p>
               <p className="text-sm text-neutral-500 text-balance">Une activité guidée, un cours, une excursion ou une aventure unique.</p>
            </div>
         </div>
      </div>
    </div>
  );

  if (step === STEPS.CATEGORY) {
    const currentCats = creationType === "EXPERIENCE" ? experienceCategories : categories;
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title={creationType === "EXPERIENCE" ? "Quelle est la thématique de votre expérience ?" : "Lequel de ces termes décrit le mieux votre logement ?"}
          subtitle="Choisissez une catégorie"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCats.map((item) => (
            <div key={item.label} className="col-span-1">
              <CategoryInput
                onClick={(cat) => setCustomValue("category", cat)}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title={creationType === "EXPERIENCE" ? "Où se déroule votre expérience ?" : "Où se situe votre logement ?"}
          subtitle="Aidez les voyageurs à vous trouver !"
        />
        <CitySelect
          value={location}
          onChange={(value) => {
            setCustomValue("location", value);
            if (value) {
              const cityName = value.label.split(" - ")[0];
              setCustomValue("city", cityName);
            }
          }}
        />
        <Input
          id="address"
          label="Adresse précise"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <div className="rounded-2xl overflow-hidden border border-neutral-200">
           <Map center={location?.latlng} className="h-[350px] w-full" />
        </div>
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-10 max-w-[800px] mx-auto py-10">
        <Heading
          title={creationType === "EXPERIENCE" ? "Détails de votre expérience" : "Quelques informations de base sur votre logement"}
          subtitle={creationType === "EXPERIENCE" ? "Combien de personnes et quelle durée ?" : "Quels sont les équipements disponibles ?"}
        />
        <div className="space-y-6">
          <Counter
            title={creationType === "EXPERIENCE" ? "Nombre max de participants" : "Voyageurs"}
            subtitle={creationType === "EXPERIENCE" ? "Combien de personnes peuvent participer ?" : "Combien de voyageurs pouvez-vous accueillir ?"}
            value={guestCount}
            onChange={(value) => setCustomValue("guestCount", value)}
          />
          <hr />
          {creationType === "LISTING" ? (
            <>
              <Counter
                title="Chambres"
                subtitle="De combien de chambres disposez-vous ?"
                value={roomCount}
                onChange={(value) => setCustomValue("roomCount", value)}
              />
              <hr />
              <Counter
                title="Lits"
                subtitle="De combien de lits disposez-vous ?"
                value={bedCount}
                onChange={(value) => setCustomValue("bedCount", value)}
              />
              <hr />
              <Counter
                title="Salles de bain"
                subtitle="De combien de salles de bain disposez-vous ?"
                value={bathroomCount}
                onChange={(value) => setCustomValue("bathroomCount", value)}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
               <div className="flex flex-row items-center gap-2 font-bold text-neutral-800">
                  <TbClock size={20} />
                  Durée de l'expérience (en minutes)
               </div>
               <input 
                 type="number" 
                 value={duration} 
                 onChange={(e) => setCustomValue("duration", parseInt(e.target.value))}
                 className="p-4 border-2 rounded-xl focus:border-black outline-none transition"
               />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === STEPS.AMENITIES) {
    if (creationType === "EXPERIENCE") {
       // Skip amenities for now or show "Ce qui est inclus"
       onNext();
       return null;
    }
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title="Quels équipements proposez-vous ?"
          subtitle="Sélectionnez tout ce qui s'applique."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AMENITIES_LIST.map((item) => {
            const isSelected = amenities.includes(item.label);
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                onClick={() => toggleAmenity(item.label)}
                className={`flex flex-col gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:border-black transition duration-200 ${
                  isSelected ? "border-black bg-neutral-50" : "border-neutral-200"
                }`}
              >
                <Icon size={30} />
                <div className="font-semibold text-sm">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title={creationType === "EXPERIENCE" ? "Ajoutez des photos de votre expérience" : "Ajoutez des photos de votre logement"}
          subtitle="Montrez aux voyageurs ce qui les attend !"
        />
        <ImageUpload
          onChange={(value) => setCustomValue("images", value)}
          value={images || []}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title="Comment décririez-vous votre annonce ?"
          subtitle="Faites court et efficace !"
        />
        <Input
          id="title"
          label="Titre"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8 max-w-[800px] mx-auto py-10">
        <Heading
          title="Maintenant, fixez votre prix"
          subtitle={creationType === "EXPERIENCE" ? "Combien facturez-vous par personne ?" : "Combien facturez-vous par nuit ?"}
        />
        <div className="flex items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200">
           <div className="w-[300px]">
              <Input
                id="price"
                label="Prix"
                formatPrice
                type="number"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
              />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-10 py-6 border-b flex items-center justify-between">
         <div className="font-bold text-2xl tracking-tighter text-brand-500">AlasBnB.</div>
         <button 
           onClick={() => router.push("/hosting/listings")}
           className="text-sm font-semibold border px-4 py-2 rounded-full hover:bg-neutral-50 transition"
         >
           Quitter
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-10">
        {bodyContent}
      </div>

      {/* Footer / Navigation */}
      <div className="px-10 py-4 border-t flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
           <div 
             className="h-full bg-black transition-all duration-500" 
             style={{ width: `${((step + 1) / (Object.keys(STEPS).length / 2)) * 100}%` }}
           />
        </div>

        <div className="flex items-center justify-between">
          <button
            disabled={step === STEPS.TYPE || (typeParam && step === STEPS.CATEGORY)}
            onClick={onBack}
            className="font-semibold underline disabled:no-underline disabled:text-neutral-300 disabled:cursor-not-allowed"
          >
            Retour
          </button>
          <div className="w-[150px]">
             <Button
               disabled={isLoading || (step === STEPS.CATEGORY && !category)}
               label={step === STEPS.PRICE ? "Publier" : "Suivant"}
               onClick={handleSubmit(onSubmit)}
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
