"use client";

import { useMemo, useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { categories, experienceCategories } from "@/components/navbar/Categories";

import useLanguage from "@/hook/useLanguage";
import useCurrency from "@/hook/useCurrency";
import { usePrice } from "@/hook/usePrice";
import { translations } from "@/lib/translations";
import Calendar from "@/components/inputs/Calendar";
import CategoryInput from "@/components/inputs/CategoryInput";
import CitySelect from "@/components/inputs/CitySelect";
import Input from "@/components/inputs/Input";
import Counter from "@/components/inputs/Counter";
import ImageUpload from "@/components/inputs/ImageUpload";
import { TbToolsKitchen2, TbWifi, TbCar, TbPool, TbPaw, TbClock, TbCheck, TbArrowRight, TbArrowLeft } from "react-icons/tb";
import { MdTv, MdOutlineLocalLaundryService, MdOutlineSensors, MdOutlineFireExtinguisher, MdOutlineSecurity, MdOutlineHomeWork, MdOutlineMap } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

enum STEPS {
  TYPE = 0,
  CATEGORY = 1,
  LOCATION = 2,
  FLOOR_PLAN = 3,
  AMENITIES = 4,
  IMAGES = 5,
  DESCRIPTION = 6,
  CONDITIONS = 7,
  AVAILABILITY = 8,
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
  { label: "Caméras de surveillance extérieures", icon: MdOutlineSecurity }
];

const CreateListingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type");

  const [step, setStep] = useState(STEPS.TYPE);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const { symbol } = usePrice(0);
  const t = translations[language] || translations.en;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      type: typeParam === "EXPERIENCE" ? "EXPERIENCE" : "LISTING",
      category: "",
      location: null,
      city: "",
      address: "",
      guestCount: 1,
      roomCount: 1,
      bedCount: 1,
      bathroomCount: 1,
      duration: 60,
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
      cancellationPolicy: "FLEXIBLE",
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    },
  });

  useEffect(() => {
    if (typeParam === "EXPERIENCE" || typeParam === "LISTING") {
      setStep(STEPS.CATEGORY);
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
  const cancellationPolicy = watch("cancellationPolicy");
  const dateRange = watch("dateRange");
  const price = watch("price");

  const Map = useMemo(
    () => dynamic(() => import("@/components/Map"), { ssr: false }),
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
    if (creationType === "EXPERIENCE") {
      if (step === STEPS.IMAGES) return setStep(STEPS.FLOOR_PLAN);
      if (step === STEPS.AVAILABILITY) return setStep(STEPS.DESCRIPTION);
    }
    setStep((value) => value - 1);
  };

  const onNext = () => {
    if (creationType === "EXPERIENCE") {
      if (step === STEPS.FLOOR_PLAN) return setStep(STEPS.IMAGES);
      if (step === STEPS.DESCRIPTION) return setStep(STEPS.AVAILABILITY);
    }
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.PRICE) return onNext();

    setIsLoading(true);
    const url = data.type === "LISTING" ? "/api/listings" : "/api/experiences";

    axios.post(url, data)
      .then(() => {
        toast.success(t.listing_success || "Annonce créée !");
        router.push("/hosting/listings");
        router.refresh();
      })
      .catch(() => {
        toast.error(t.error_occurred || "Erreur");
      })
      .finally(() => setIsLoading(false));
  };

  // Content for each step
  const renderStepContent = () => {
    switch (step) {
      case STEPS.TYPE:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-neutral-900">{t.create_type_title}</h1>
              <p className="text-lg text-neutral-500 font-medium">{t.create_type_subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => { setCustomValue("type", "LISTING"); setCustomValue("category", ""); }}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-4 ${creationType === 'LISTING' ? 'border-rose-500 bg-rose-50' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
              >
                  <MdOutlineHomeWork size={40} className={creationType === 'LISTING' ? 'text-rose-500' : 'text-neutral-500'} />
                  <div>
                    <p className="font-bold text-lg text-neutral-900">{t.type_listing}</p>
                    <p className="text-sm text-neutral-500">{t.type_listing_desc}</p>
                  </div>
              </div>
              <div 
                onClick={() => { setCustomValue("type", "EXPERIENCE"); setCustomValue("category", ""); }}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-4 ${creationType === 'EXPERIENCE' ? 'border-orange-500 bg-orange-50' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
              >
                  <MdOutlineMap size={40} className={creationType === 'EXPERIENCE' ? 'text-orange-500' : 'text-neutral-500'} />
                  <div>
                    <p className="font-bold text-lg text-neutral-900">{t.type_experience}</p>
                    <p className="text-sm text-neutral-500">{t.type_experience_desc}</p>
                  </div>
              </div>
            </div>
          </div>
        );

      case STEPS.CATEGORY:
        const currentCats = creationType === "EXPERIENCE" ? experienceCategories : categories;
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-neutral-900">{creationType === "EXPERIENCE" ? t.category_exp_title : t.category_listing_title}</h1>
              <p className="text-lg text-neutral-500 font-medium">{t.create_type_subtitle}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
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

      case STEPS.LOCATION:
        return (
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                 {creationType === "EXPERIENCE" ? t.location_exp_title : t.location_listing_title}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">{t.location_subtitle || "Trouvez l'endroit idéal !"}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="flex flex-col gap-6 w-full order-2 md:order-1">
                    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Ville de destination</label>
                            <CitySelect 
                                value={location} 
                                onChange={(value) => {
                                    setCustomValue('location', value);
                                    setCustomValue('city', value?.label || '');
                                }} 
                            />
                        </div>
                        <hr className="border-neutral-100" />
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Adresse exacte</label>
                            <Input 
                                id="address" 
                                label={t.street_address || "Adresse complète (ex: 123 Rue de la Paix)"} 
                                disabled={isLoading} 
                                register={register} 
                                errors={errors} 
                                required 
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-[250px] md:h-full min-h-[300px] rounded-3xl overflow-hidden border-2 border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] order-1 md:order-2 relative bg-neutral-50">
                    <Map center={location?.latlng} />
                </div>
            </div>
          </div>
        );

      case STEPS.FLOOR_PLAN:
        const isExp = creationType === "EXPERIENCE";
        return (
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                 {isExp 
                    ? (t.basics_exp_title || "Détails de l'expérience") 
                    : (t.basics_title || "Informations de base de votre logement")}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                 {isExp 
                    ? (t.basics_exp_subtitle || "Donnez quelques précisions sur le déroulement.") 
                    : (t.basics_subtitle || "Combien de voyageurs pouvez-vous accueillir ?")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center w-full">
                <div className="md:col-span-3 flex flex-col gap-6 bg-white border border-neutral-200 shadow-sm rounded-3xl p-8">
                  <Counter title={t.guests || "Voyageurs"} subtitle={isExp ? "Nombre maximum de participants" : (t.guests_subtitle || "Capacité d'accueil maximum")} value={guestCount} onChange={(value) => setCustomValue("guestCount", value)} />
                  {!isExp && (
                    <>
                      <hr className="border-neutral-100" />
                      <Counter title={t.rooms || "Chambres"} subtitle={t.rooms_subtitle || "Espaces de couchage séparés"} value={roomCount} onChange={(value) => setCustomValue("roomCount", value)} />
                      <hr className="border-neutral-100" />
                      <Counter title={t.beds || "Lits"} subtitle={t.beds_subtitle || "Nombre total de lits"} value={bedCount} onChange={(value) => setCustomValue("bedCount", value)} />
                      <hr className="border-neutral-100" />
                      <Counter title={t.bathrooms || "Salles de bain"} subtitle={t.bathrooms_subtitle || "Disponibles pour les voyageurs"} value={bathroomCount} onChange={(value) => setCustomValue("bathroomCount", value)} />
                    </>
                  )}
                  {isExp && (
                    <>
                      <hr className="border-neutral-100" />
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-col">
                          <div className="font-bold text-neutral-900 text-lg">{t.duration || "Durée"}</div>
                          <div className="font-light text-neutral-500">{t.duration_subtitle || "Durée approximative de l'expérience"}</div>
                        </div>
                        <div className="flex flex-row items-center gap-4">
                          <input 
                            type="number" 
                            value={duration} 
                            onChange={(e) => setCustomValue("duration", parseInt(e.target.value) || 0)} 
                            className="w-20 p-2 border-2 border-neutral-200 rounded-lg text-center focus:border-rose-500 outline-none"
                          />
                          <span className="font-medium text-neutral-600">min</span>
                        </div>
                      </div>

                      <hr className="border-neutral-100" />
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <div className="font-bold text-neutral-900 text-lg">{t.cancellation_policy || "Conditions d'annulation"}</div>
                          <div className="font-light text-neutral-500">Définissez vos conditions d'annulation.</div>
                        </div>
                        <select className="w-full p-4 border-2 border-neutral-200 rounded-2xl focus:border-rose-500 outline-none bg-white cursor-pointer transition-colors" value={cancellationPolicy} onChange={(e) => setCustomValue("cancellationPolicy", e.target.value)}>
                            <option value="FLEXIBLE">{t.flexible || "Flexible"} - Remboursement intégral 24h avant</option>
                            <option value="MODERATE">{t.moderate || "Modérée"} - Remboursement intégral 5 jours avant</option>
                            <option value="STRICT">{t.strict || "Stricte"} - Remboursement partiel selon règles</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="hidden md:flex md:col-span-2 items-center justify-center p-8 bg-neutral-50 rounded-3xl h-full border border-neutral-100">
                    <div className="text-center">
                        {isExp ? (
                            <>
                                <TbClock size={80} className="text-neutral-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-neutral-400">Le temps, c'est précieux</h3>
                                <p className="text-sm text-neutral-400 mt-2">Précisez bien la durée pour que les voyageurs puissent organiser leur journée autour de votre activité.</p>
                            </>
                        ) : (
                            <>
                                <MdOutlineHomeWork size={80} className="text-neutral-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-neutral-400">Structurez votre espace</h3>
                                <p className="text-sm text-neutral-400 mt-2">Ces informations aideront les voyageurs à savoir si votre logement correspond à leurs besoins.</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
        );

      case STEPS.AMENITIES:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-neutral-900">{t.amenities_title}</h1>
              <p className="text-lg text-neutral-500 font-medium">{t.amenities_subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = amenities.includes(amenity.label);
                return (
                  <div 
                    key={amenity.label}
                    onClick={() => toggleAmenity(amenity.label)}
                    className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-rose-500 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                        <amenity.icon size={24} />
                    </div>
                    <span className={`font-semibold ${isSelected ? 'text-rose-900' : 'text-neutral-700'}`}>{amenity.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case STEPS.IMAGES:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-neutral-900">
                {creationType === "EXPERIENCE" 
                  ? (t.images_exp_title || "Ajoutez des photos de votre activité") 
                  : (t.images_title || "Ajoutez des photos de votre logement")}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                {creationType === "EXPERIENCE" 
                  ? (t.images_exp_subtitle || "Montrez aux voyageurs à quoi ressemble votre expérience !") 
                  : (t.images_subtitle || "Montrez aux voyageurs à quoi ressemble votre logement !")}
              </p>
            </div>
            <ImageUpload 
              value={images} 
              onChange={(value) => setCustomValue("images", value)}
              isExperience={creationType === "EXPERIENCE"}
            />
          </div>
        );

      case STEPS.DESCRIPTION:
        return (
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                 {creationType === "EXPERIENCE" 
                    ? (t.description_exp_title || "Comment décririez-vous votre expérience ?")
                    : (t.description_title || "Comment décririez-vous votre logement ?")}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                 {t.description_subtitle || "Faites court et efficace !"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch w-full">
                <div className="md:col-span-3 flex flex-col gap-6 bg-white border border-neutral-200 shadow-sm rounded-3xl p-8">
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Titre de l'annonce</label>
                        <Input 
                            id="title" 
                            label={t.title_label || (creationType === "EXPERIENCE" ? "Ex: Visite guidée de la médina" : "Ex: Magnifique appartement vue mer")} 
                            disabled={isLoading} 
                            register={register} 
                            errors={errors} 
                            required 
                        />
                    </div>
                    <hr className="border-neutral-100" />
                    <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Description détaillée</label>
                        <Input 
                            id="description" 
                            label={t.desc_label || "Racontez ce qui rend votre espace unique..."} 
                            disabled={isLoading} 
                            register={register} 
                            errors={errors} 
                            required 
                        />
                    </div>
                </div>
                
                <div className="hidden md:flex md:col-span-2 items-center justify-center p-8 bg-rose-50/50 rounded-3xl border border-rose-100">
                    <div className="text-center">
                        <svg className="w-20 h-20 text-rose-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h3 className="text-xl font-bold text-rose-900">Racontez votre histoire</h3>
                        <p className="text-sm text-rose-700/80 mt-3 leading-relaxed">
                            {creationType === "EXPERIENCE"
                                ? "Partagez ce qui rend votre activité spéciale. N'hésitez pas à mentionner le programme, l'ambiance, ou les petites attentions qui feront la différence."
                                : "Partagez ce qui rend votre logement spécial. N'hésitez pas à mentionner la décoration, l'ambiance du quartier, ou les petites attentions qui feront la différence pour les voyageurs."}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        );

      case STEPS.CONDITIONS:
        const isExpCond = creationType === "EXPERIENCE";
        return (
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                {isExpCond ? (t.conditions_exp_title || "Conditions de l'expérience") : (t.conditions_title || "Règles et conditions du logement")}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                {isExpCond ? (t.conditions_exp_subtitle || "Définissez vos conditions d'annulation.") : (t.conditions_subtitle || "Définissez ce qui est autorisé pour les voyageurs.")}
              </p>
            </div>
            
            <div className={`grid grid-cols-1 ${isExpCond ? 'max-w-2xl mx-auto' : 'md:grid-cols-2 gap-6'} w-full`}>
                {/* Left Column: House Rules (Only for Listings) */}
                {!isExpCond && (
                    <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                      <h3 className="font-bold text-neutral-900 text-xl">Règles de la maison</h3>
                      <div className="flex flex-col gap-2">
                          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 cursor-pointer transition-all">
                            <div>
                              <div className="font-bold text-neutral-900">{t.pets_allowed || "Animaux acceptés"}</div>
                              <div className="text-sm text-neutral-500">Les voyageurs peuvent-ils venir avec des animaux ?</div>
                            </div>
                            <input type="checkbox" className="w-5 h-5 accent-rose-500 rounded cursor-pointer" checked={petsAllowed} onChange={(e) => setCustomValue("petsAllowed", e.target.checked)} />
                          </label>
                          
                          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 cursor-pointer transition-all">
                            <div>
                              <div className="font-bold text-neutral-900">{t.smoking_allowed || "Fumeurs autorisés"}</div>
                              <div className="text-sm text-neutral-500">Est-il permis de fumer à l'intérieur ?</div>
                            </div>
                            <input type="checkbox" className="w-5 h-5 accent-rose-500 rounded cursor-pointer" checked={smokingAllowed} onChange={(e) => setCustomValue("smokingAllowed", e.target.checked)} />
                          </label>
                          
                          <label className="flex items-center justify-between p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 cursor-pointer transition-all">
                            <div>
                              <div className="font-bold text-neutral-900">{t.parties_allowed || "Événements autorisés"}</div>
                              <div className="text-sm text-neutral-500">Les fêtes ou événements sont-ils permis ?</div>
                            </div>
                            <input type="checkbox" className="w-5 h-5 accent-rose-500 rounded cursor-pointer" checked={partiesAllowed} onChange={(e) => setCustomValue("partiesAllowed", e.target.checked)} />
                          </label>
                      </div>
                    </div>
                )}

                {/* Right Column: Timings & Policy */}
                <div className="flex flex-col gap-6">
                    {!isExpCond && (
                        <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                            <h3 className="font-bold text-neutral-900 text-xl">Horaires de séjour</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">{t.checkin_time || "Arrivée (à partir de)"}</label>
                                    <div className="relative">
                                        <input type="number" min="0" max="23" className="w-full p-4 border-2 border-neutral-200 rounded-2xl focus:border-rose-500 outline-none transition-colors" value={checkInTime} onChange={(e) => setCustomValue("checkInTime", parseInt(e.target.value))} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium pointer-events-none">h00</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">{t.checkout_time || "Départ (avant)"}</label>
                                    <div className="relative">
                                        <input type="number" min="0" max="23" className="w-full p-4 border-2 border-neutral-200 rounded-2xl focus:border-rose-500 outline-none transition-colors" value={checkOutTime} onChange={(e) => setCustomValue("checkOutTime", parseInt(e.target.value))} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium pointer-events-none">h00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-sm ${isExpCond ? 'mt-8' : ''}`}>
                        <label className="block font-bold text-neutral-900 text-xl mb-4">{t.cancellation_policy || "Conditions d'annulation"}</label>
                        <select className="w-full p-4 border-2 border-neutral-200 rounded-2xl focus:border-rose-500 outline-none bg-white cursor-pointer transition-colors" value={cancellationPolicy} onChange={(e) => setCustomValue("cancellationPolicy", e.target.value)}>
                            <option value="FLEXIBLE">{t.flexible || "Flexible"} - Remboursement intégral 24h avant</option>
                            <option value="MODERATE">{t.moderate || "Modérée"} - Remboursement intégral 5 jours avant</option>
                            <option value="STRICT">{t.strict || "Stricte"} - Remboursement partiel selon règles</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>
        );

      case STEPS.AVAILABILITY:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-neutral-900">
                {creationType === "EXPERIENCE"
                  ? (t.availability_exp_title || "Quand votre activité est-elle disponible ?")
                  : (t.availability_title || "Quand votre logement est-il disponible ?")}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                {creationType === "EXPERIENCE"
                  ? (t.availability_exp_subtitle || "Sélectionnez les dates de disponibilité pour cette expérience.")
                  : (t.availability_subtitle || "Sélectionnez les dates où les voyageurs peuvent réserver.")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 flex justify-center">
                <Calendar 
                    value={dateRange} 
                    onChange={(value) => setCustomValue("dateRange", value.selection)}
                />
            </div>
          </div>
        );

      case STEPS.PRICE:
        return (
          <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                {t.price_title || "Maintenant, fixez votre prix"}
              </h1>
              <p className="text-lg text-neutral-500 font-medium">
                {creationType === "EXPERIENCE"
                  ? (t.price_exp_subtitle || "Combien facturez-vous par personne ?")
                  : (t.price_subtitle || "Combien facturez-vous par nuit ?")}
              </p>
            </div>
            
            <div className="bg-white p-10 md:p-14 border-2 border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] flex flex-col items-center group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="text-neutral-400 text-sm font-bold mb-8 uppercase tracking-[0.2em]">
                    {creationType === "EXPERIENCE"
                      ? (t.price_exp_label || "Prix par personne")
                      : (t.price_label || "Prix par nuit")} ({currency})
                </div>
                
                <div className="flex items-center justify-center gap-3 w-full">
                    <span className="text-4xl md:text-6xl text-neutral-300 font-medium">{symbol}</span>
                    <input 
                        type="number"
                        min="1"
                        value={price || ""}
                        onChange={(e) => setCustomValue("price", parseInt(e.target.value) || 0)}
                        className="text-7xl md:text-8xl font-light text-neutral-800 text-center outline-none w-[180px] md:w-[250px] placeholder-neutral-200 transition-colors bg-transparent focus:text-rose-500"
                        placeholder="0"
                    />
                </div>
                
                <hr className="w-16 border-[3px] border-neutral-200 rounded-full mt-6 mb-10 group-focus-within:w-32 group-focus-within:border-rose-500 transition-all duration-500" />
                
                <div className="p-5 bg-neutral-50/50 border border-neutral-100 text-neutral-500 rounded-2xl text-center w-full text-sm font-medium flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Vous pourrez ajuster ce prix à tout moment.</span>
                </div>
            </div>
          </div>
        );
    }
  };

  const isExpMode = creationType === "EXPERIENCE";
  const totalVisualSteps = isExpMode ? (Object.keys(STEPS).length / 2) - 2 : Object.keys(STEPS).length / 2;
  
  let currentVisualStep = step + 1;
  if (isExpMode) {
      if (step > STEPS.AMENITIES) currentVisualStep -= 1;
      if (step > STEPS.CONDITIONS) currentVisualStep -= 1;
  }
  
  const progress = (currentVisualStep / totalVisualSteps) * 100;

  return (
    <div className="relative flex flex-col max-h-[calc(100vh-100px)] bg-white border border-neutral-200 rounded-[2rem] overflow-hidden m-4 lg:m-6 shadow-sm font-sans">
        
        {/* Top Progress Bar */}
        <div className="w-full h-[70px] bg-white border-b border-neutral-100 flex items-center justify-between px-8 shrink-0 relative z-20">
            <div className="font-bold text-neutral-400 uppercase tracking-widest text-xs hidden sm:block">
                Assistant de création
            </div>
            <div className="font-bold text-neutral-800 bg-neutral-100 px-4 py-1.5 rounded-full text-sm">
                Étape {currentVisualStep} sur {totalVisualSteps}
            </div>
            <button className="text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors" onClick={() => router.push('/hosting/listings')}>
                Annuler
            </button>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-neutral-50 shrink-0 relative z-20">
            <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 md:p-10 bg-[#FAFAFA] relative z-10 flex flex-col">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-4xl mx-auto flex flex-col justify-center py-4"
                >
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="bg-white border-t border-neutral-100 p-5 px-8 flex items-center justify-between shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-20">
            {step === STEPS.TYPE ? (
                <div></div>
            ) : (
                <button 
                    onClick={onBack}
                    className="font-bold text-neutral-900 underline px-6 py-3 hover:bg-neutral-50 rounded-xl transition-all"
                >
                    Retour
                </button>
            )}
            
            <button 
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="px-10 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_8px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_30px_rgba(244,63,94,0.35)] hover:-translate-y-0.5 active:scale-95"
            >
                {step === STEPS.PRICE ? (
                    <>
                        <span>Publier</span>
                        <TbCheck size={20} />
                    </>
                ) : (
                    <>
                        <span>Suivant</span>
                        <TbArrowRight size={20} />
                    </>
                )}
            </button>
        </div>
    </div>
  );
};

export default CreateListingPage;
