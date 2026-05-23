"use client";

import useRentModal from "@/hook/useRentModal";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import useLanguage from "@/hook/useLanguage";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Heading from "../Heading";
import CategoryInput from "../inputs/CategoryInput";
import Counter from "../inputs/Counter";
import CitySelect from "../inputs/CitySelect";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import Calendar from "../inputs/Calendar";
import { categories } from "../navbar/Categories";
import Modal from "./Modal";
import { TbPool, TbWifi, TbCar, TbToolsKitchen2, TbPaw } from "react-icons/tb";
import { MdOutlineSecurity, MdOutlineFireExtinguisher, MdOutlineSensors, MdTv, MdOutlineLocalLaundryService } from "react-icons/md";

const AMENITIES_LIST = [
  { label: "Cuisine", translationKey: "amenity_kitchen", icon: TbToolsKitchen2 },
  { label: "Wifi", translationKey: "amenity_wifi", icon: TbWifi },
  { label: "Stationnement gratuit sur place", translationKey: "amenity_parking", icon: TbCar },
  { label: "Piscine", translationKey: "amenity_pool", icon: TbPool },
  { label: "Animaux acceptés", translationKey: "amenity_pets", icon: TbPaw },
  { label: "Télévision", translationKey: "amenity_tv", icon: MdTv },
  { label: "Lave-linge", translationKey: "amenity_washer", icon: MdOutlineLocalLaundryService },
  { label: "Détecteur de monoxyde de carbone", translationKey: "amenity_co", icon: MdOutlineSensors },
  { label: "Détecteur de fumée", translationKey: "amenity_smoke", icon: MdOutlineFireExtinguisher },
  { label: "Caméras de surveillance extérieures présentes sur place", translationKey: "amenity_cameras", icon: MdOutlineSecurity }
];

type Props = {};

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  AMENITIES = 3,
  IMAGES = 4,
  DESCRIPTION = 5,
  AVAILABILITY = 6,
  PRICE = 7,
}

function RentModal({ }: Props) {
  const router = useRouter();
  const rentModel = useRentModal();
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      location: null,
      city: "",
      address: "",
      guestCount: 1,
      roomCount: 1,
      bedCount: 1,
      bathroomCount: 1,
      amenities: [],
      imageSrc: "",
      images: [],
      dateRange: {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
      price: 1,
      title: "",
      description: "",
    },
  });

  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bedCount = watch("bedCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");
  const images = watch("images");
  const dateRange = watch("dateRange");
  const amenities = watch("amenities") || [];

  const toggleAmenity = (label: string) => {
    if (amenities.includes(label)) {
      setCustomValue("amenities", amenities.filter((item: string) => item !== label));
    } else {
      setCustomValue("amenities", [...amenities, label]);
    }
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
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

    axios
      .post("/api/listings", data)
      .then(() => {
        toast.success(t.listing_success || "Listing Created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModel.onClose();
      })
      .catch(() => {
        toast.error(t.error_occurred || "Something Went Wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return t.publish || "Create";
    }

    return t.next || "Next";
  }, [step, t]);

  const secondActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return t.back || "Back";
  }, [step, t]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title={t.category_listing_title || "Which of these best describes your place?"}
        subtitle={t.category_subtitle || "Pick a category"}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FF5A5F]">
        {categories.map((item, index) => (
          <div key={index} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title={t.location_listing_title || "Where is your place located?"}
          subtitle={t.location_rent_subtitle || "Help guests find you!"}
        />
        <CitySelect
          value={location}
          onChange={(value) => {
            setCustomValue("location", value);
            if (value) {
              const cityName = value.cityName || value.label.split(",")[0];
              setCustomValue("city", cityName);
            } else {
              setCustomValue("city", "");
            }
          }}
        />
        <Input
          id="address"
          label={t.address_precise || "Address"}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <Map center={location?.latlng} className="h-[180px] rounded-2xl w-full border border-neutral-100 shadow-sm" />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title={t.details_listing_title || "Share some basics about your place"}
          subtitle={t.details_listing_subtitle || "What amenities do you have?"}
        />
        <Counter
          title={t.guest_capacity || "Guests"}
          subtitle={t.guest_capacity_subtitle || "How many guests do you allow?"}
          value={guestCount}
          onChange={(value) => setCustomValue("guestCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title={t.bedrooms || "Bedrooms"}
          subtitle={t.bedrooms_subtitle || "How many bedrooms do you have?"}
          value={roomCount}
          onChange={(value) => setCustomValue("roomCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title={t.beds || "Beds"}
          subtitle={t.beds_subtitle || "How many beds do you have?"}
          value={bedCount}
          onChange={(value) => setCustomValue("bedCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title={t.bathrooms_count || "Bathrooms"}
          subtitle={t.bathrooms_subtitle || "How many bathrooms do you have?"}
          value={bathroomCount}
          onChange={(value) => setCustomValue("bathroomCount", value)}
        />
      </div>
    );
  }

  if (step === STEPS.AMENITIES) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title={t.amenities_title || "What amenities does your place offer?"}
          subtitle={t.amenities_subtitle || "Select all that apply."}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[40vh] overflow-y-auto p-1">
          {AMENITIES_LIST.map((item) => {
            const isSelected = amenities.includes(item.label);
            const Icon = item.icon || TbWifi;
            return (
              <div
                key={item.label}
                onClick={() => toggleAmenity(item.label)}
                className={`flex flex-col gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:border-teal-500 transition-all duration-200 select-none ${
                  isSelected ? "border-teal-500 bg-teal-50/20" : "border-neutral-200"
                }`}
              >
                <Icon size={26} className={isSelected ? "text-teal-600" : "text-neutral-500"} />
                <div className={`text-xs font-semibold ${isSelected ? "text-teal-900" : "text-neutral-700"}`}>
                  {t[item.translationKey] || item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={t.images_listing_title || "Add photos of your place"}
          subtitle={t.images_subtitle || "Show guests what your place looks like!"}
        />
        <ImageUpload
          onChange={(value) => {
            setCustomValue("images", value);
            setCustomValue("imageSrc", value[0] || "");
          }}
          value={images || []}
        />
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={t.desc_title || "How would you describe your place?"}
          subtitle={t.desc_subtitle || "Short and sweet works best!"}
        />
        <Input
          id="title"
          label={t.title_label || "Title"}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
        <hr />
        <Input
          id="description"
          label={t.description_label || "Description"}
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  if (step === STEPS.AVAILABILITY) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title={t.availability_title || "When is your place available?"}
          subtitle={t.availability_subtitle || "Select the range of dates when guests can start booking your place."}
        />
        <div className="flex items-center justify-center p-4 border border-neutral-100 rounded-2xl bg-neutral-50/30">
          <Calendar
            value={dateRange}
            onChange={(value) => setCustomValue("dateRange", value.selection)}
          />
        </div>
      </div>
    );
  }

  if (step == STEPS.PRICE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={t.price_title || "Now, set your price"}
          subtitle={t.price_listing_subtitle || "How much do you charge per night?"}
        />
        <Input
          id="price"
          label={t.price_label || "Price"}
          formatPrice
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={rentModel.isOpen}
      title={t.rent_title || "Airbnb your home!"}
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModel.onClose}
      body={bodyContent}
    />
  );
}

export default RentModal;
