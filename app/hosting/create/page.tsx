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
import { TbToolsKitchen2, TbWifi, TbCar, TbPool, TbPaw, TbClock } from "react-icons/tb";
import { MdTv, MdOutlineLocalLaundryService, MdOutlineSensors, MdOutlineFireExtinguisher, MdOutlineSecurity, MdOutlineHomeWork, MdOutlineMap } from "react-icons/md";

enum STEPS {
  TYPE = 0,
  CATEGORY = 1,
  LOCATION = 2,
  FLOOR_PLAN = 3,
  BATHROOMS = 4,
  AMENITIES = 5,
  IMAGES = 6,
  DESCRIPTION = 7,
  CONDITIONS = 8,
  PRICE = 9,
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
      petsAllowed: false,
      smokingAllowed: false,
      partiesAllowed: false,
      checkInTime: 15,
      checkOutTime: 11,
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
  const petsAllowed = watch("petsAllowed");
  const smokingAllowed = watch("smokingAllowed");
  const partiesAllowed = watch("partiesAllowed");
  const checkInTime = watch("checkInTime");
  const checkOutTime = watch("checkOutTime");

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
    <div className="flex flex-col gap-10 max-w-[640px] mx-auto py-12 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-tight font-bold text-neutral-900">
          Que souhaitez-vous proposer sur AlasBnB ?
        </h1>
        <p className="text-[18px] text-neutral-500 font-light">Choisissez le type d'annonce</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
               <p className="text-sm text-neutral-500 text-balance">Appartement, maison, villa, ou tout autre type d&apos;hébergement.</p>
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
      <div className="flex flex-col gap-10 max-w-[640px] mx-auto py-12 px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] leading-tight font-bold text-neutral-900">
            {creationType === "EXPERIENCE" ? "Quelle est la thématique de votre expérience ?" : "Lequel de ces termes décrit le mieux votre logement ?"}
          </h1>
          <p className="text-[18px] text-neutral-500 font-light">Choisissez une catégorie</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

  if (step === STEPS.FLOOR_PLAN) {
    bodyContent = (
      <div className="flex flex-col gap-10 max-w-[800px] mx-auto py-10">
        <Heading
          title={creationType === "EXPERIENCE" ? "Détails de votre expérience" : "Quelques informations de base"}
          subtitle={creationType === "EXPERIENCE" ? "Combien de personnes et quelle durée ?" : "De combien d'espace disposez-vous ?"}
        />
        <div className="space-y-6">
          <Counter
            title={creationType === "EXPERIENCE" ? "Nombre max de participants" : "Voyageurs"}
            subtitle={creationType === "EXPERIENCE" ? "Combien de personnes peuvent participer ?" : "Capacité d'accueil maximale"}
            value={guestCount}
            onChange={(value) => setCustomValue("guestCount", value)}
          />
          <hr />
          {creationType === "LISTING" ? (
            <>
              <Counter
                title="Chambres"
                subtitle="Nombre de chambres disponibles"
                value={roomCount}
                onChange={(value) => setCustomValue("roomCount", value)}
              />
              <hr />
              <Counter
                title="Lits"
                subtitle="Nombre total de lits"
                value={bedCount}
                onChange={(value) => setCustomValue("bedCount", value)}
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
               <div className="flex flex-row items-center gap-2 font-bold text-neutral-800">
                  <TbClock size={20} />
                  Durée de l&apos;expérience (en minutes)
               </div>
               <input 
                 type="number" 
                 value={duration} 
                 onChange={(e) => setCustomValue("duration", parseInt(e.target.value))}
                 className="p-4 border-2 rounded-xl focus:border-black outline-none transition w-full max-w-[200px]"
               />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === STEPS.BATHROOMS) {
    if (creationType === "EXPERIENCE") {
      onNext();
      return null;
    }
    bodyContent = (
      <div className="flex flex-col gap-10 max-w-[800px] mx-auto py-10">
        <Heading
          title="Parlez-nous des salles de bain"
          subtitle="Combien de salles de bain sont à la disposition des voyageurs ?"
        />
        <div className="space-y-6">
          <Counter
            title="Salles de bain"
            subtitle="Complètes ou demi-salles de bain"
            value={bathroomCount}
            onChange={(value) => setCustomValue("bathroomCount", value)}
          />
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

  if (step === STEPS.CONDITIONS) {
    if (creationType === "EXPERIENCE") {
      onNext();
      return null;
    }
    bodyContent = (
      <div className="flex flex-col gap-10 max-w-[800px] mx-auto py-10">
        <Heading
          title="Définissez vos règles et horaires"
          subtitle="Que doivent savoir les voyageurs avant de réserver ?"
        />
        
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-xl text-neutral-900">Règlement intérieur</h3>
            
            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-black transition">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Animaux de compagnie</span>
                <span className="text-neutral-500">Acceptez-vous les animaux ?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={petsAllowed} onChange={(e) => setCustomValue("petsAllowed", e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-black transition">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Fumeurs</span>
                <span className="text-neutral-500">Est-il autorisé de fumer à l'intérieur ?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={smokingAllowed} onChange={(e) => setCustomValue("smokingAllowed", e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-black transition">
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Fêtes et événements</span>
                <span className="text-neutral-500">Acceptez-vous les soirées ?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={partiesAllowed} onChange={(e) => setCustomValue("partiesAllowed", e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>

          <hr className="border-neutral-200" />

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-xl text-neutral-900">Horaires</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Arrivée à partir de :</label>
                <select 
                  value={checkInTime} 
                  onChange={(e) => setCustomValue("checkInTime", parseInt(e.target.value))}
                  className="p-4 border border-neutral-200 rounded-xl focus:border-black outline-none bg-white font-medium"
                >
                  {[12,13,14,15,16,17,18,19,20].map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold">Départ avant :</label>
                <select 
                  value={checkOutTime} 
                  onChange={(e) => setCustomValue("checkOutTime", parseInt(e.target.value))}
                  className="p-4 border border-neutral-200 rounded-xl focus:border-black outline-none bg-white font-medium"
                >
                  {[9,10,11,12,13].map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-10 max-w-[800px] mx-auto py-10">
        <Heading
          title="Maintenant, fixez votre prix"
          subtitle={creationType === "EXPERIENCE" ? "Combien facturez-vous par personne ?" : "Combien facturez-vous par nuit ?"}
        />
        
        <div className="flex flex-col gap-8">
          {/* Price Input Section */}
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border-2 border-neutral-200 shadow-sm transition">
            <div className="flex items-center justify-center bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
               <span className="text-[64px] font-bold text-neutral-900">€</span>
               <input
                 id="price"
                 type="number"
                 min="1"
                 disabled={isLoading}
                 {...register("price", { required: true, valueAsNumber: true })}
                 className="text-[80px] font-bold text-neutral-900 bg-transparent outline-none w-[200px] ml-4 placeholder-neutral-200 appearance-none"
                 placeholder="00"
               />
            </div>
            <div className="text-neutral-500 text-lg font-medium mt-6">
              par {creationType === "EXPERIENCE" ? "personne" : "nuit"}
            </div>
          </div>

          {/* Discounts Section (UI Only for now) */}
          {creationType === "LISTING" && (
            <div className="flex flex-col gap-6 mt-4">
              <h3 className="text-xl font-bold text-neutral-900">Offrez des réductions</h3>
              
              <div className="flex items-start justify-between p-6 border-2 border-neutral-200 rounded-[24px] hover:border-black transition cursor-pointer">
                <div className="flex flex-col gap-1 pr-6">
                  <span className="font-bold text-[18px]">Promotion "Nouveau logement"</span>
                  <span className="text-neutral-500 text-[15px]">Offrez 20 % de réduction à vos 3 premiers voyageurs pour obtenir vos premiers commentaires plus vite.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="flex items-start justify-between p-6 border-2 border-neutral-200 rounded-[24px] hover:border-black transition cursor-pointer">
                <div className="flex flex-col gap-1 pr-6">
                  <span className="font-bold text-[18px]">Réduction à la semaine</span>
                  <span className="text-neutral-500 text-[15px]">Pour les séjours de 7 nuits ou plus. Recommandée : 10 %.</span>
                </div>
                <div className="text-xl font-bold text-neutral-400 bg-neutral-100 px-4 py-2 rounded-xl flex-shrink-0">
                  10 %
                </div>
              </div>

              <div className="flex items-start justify-between p-6 border-2 border-neutral-200 rounded-[24px] hover:border-black transition cursor-pointer">
                <div className="flex flex-col gap-1 pr-6">
                  <span className="font-bold text-[18px]">Réduction au mois</span>
                  <span className="text-neutral-500 text-[15px]">Pour les séjours de 28 nuits ou plus. Recommandée : 20 %.</span>
                </div>
                <div className="text-xl font-bold text-neutral-400 bg-neutral-100 px-4 py-2 rounded-xl flex-shrink-0">
                  20 %
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-10 pb-32">
        {bodyContent}
      </div>

      {/* Footer / Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-6 md:px-10 py-4 z-50">
        <div className="flex flex-col gap-4 max-w-[1200px] mx-auto">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-neutral-200 rounded-full overflow-hidden">
             <div 
               className="h-full bg-neutral-900 transition-all duration-500" 
               style={{ width: `${((step + 1) / (Object.keys(STEPS).length / 2)) * 100}%` }}
             />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/hosting/listings")}
                className="font-bold text-[16px] text-neutral-500 hover:text-neutral-900 transition"
              >
                Quitter
              </button>
              <button
                disabled={!!(step === STEPS.TYPE || (typeParam && step === STEPS.CATEGORY))}
                onClick={onBack}
                className="font-bold text-[16px] underline hover:bg-neutral-100 px-4 py-2 rounded-lg transition disabled:opacity-0 disabled:pointer-events-none"
              >
                Retour
              </button>
            </div>
            <button
              disabled={isLoading || (step === STEPS.CATEGORY && !category)}
              onClick={handleSubmit(onSubmit)}
              className="bg-neutral-900 hover:bg-black text-white font-semibold text-[16px] px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === STEPS.PRICE ? "Publier" : "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;
