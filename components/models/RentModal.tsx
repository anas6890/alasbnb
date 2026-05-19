"use client";

import useRentModal from "@/hook/useRentModal";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { TbPool, TbWifi, TbCar, TbToolsKitchen2, TbTv, TbPaw } from "react-icons/tb";
import { PiWashingMachine } from "react-icons/pi";
import { MdOutlineSecurity, MdOutlineFireExtinguisher, MdOutlineSensors } from "react-icons/md";

const AMENITIES_LIST = [
  { label: "Cuisine", icon: TbToolsKitchen2 },
  { label: "Wifi", icon: TbWifi },
  { label: "Stationnement gratuit sur place", icon: TbCar },
  { label: "Piscine", icon: TbPool },
  { label: "Animaux acceptés", icon: TbPaw },
  { label: "Télévision", icon: TbTv },
  { label: "Lave-linge", icon: PiWashingMachine },
  { label: "Détecteur de monoxyde de carbone", icon: MdOutlineSensors },
  { label: "Détecteur de fumée", icon: MdOutlineFireExtinguisher },
  { label: "Caméras de surveillance extérieures présentes sur place", icon: MdOutlineSecurity }
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
        toast.success("Listing Created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModel.onClose();
      })
      .catch(() => {
        toast.error("Something Went Wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }

    return "Next";
  }, [step]);

  const secondActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
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
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <CitySelect
          value={location}
          onChange={(value) => {
            setCustomValue("location", value);
            if (value) {
              const cityName = value.label.split(" - ")[0];
              setCustomValue("city", cityName);
            } else {
              setCustomValue("city", "");
            }
          }}
        />
        <Input
          id="address"
          label="Address"
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
          title="Share some basics about your place"
          subtitle="What amenities do you have?"
        />
        <Counter
          title="Guests"
          subtitle="How many guests do you allow?"
          value={guestCount}
          onChange={(value) => setCustomValue("guestCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title="Bedrooms"
          subtitle="How many bedrooms do you have?"
          value={roomCount}
          onChange={(value) => setCustomValue("roomCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title="Beds"
          subtitle="How many beds do you have?"
          value={bedCount}
          onChange={(value) => setCustomValue("bedCount", value)}
        />
        <hr className="border-neutral-100" />
        <Counter
          title="Bathrooms"
          subtitle="How many bathrooms do you have?"
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
          title="What amenities does your place offer?"
          subtitle="Select all that apply."
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
                  {item.label}
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
          title="Add photos of your place"
          subtitle="Show guests what your place looks like! You can upload up to 10 photos."
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
          title="How would you describe your place?"
          subtitle="Short and sweet works best!"
        />
        <Input
          id="title"
          label="Title"
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

  if (step === STEPS.AVAILABILITY) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="When is your place available?"
          subtitle="Select the range of dates when guests can start booking your place."
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
          title="Now, set your price"
          subtitle="How much do you charge per night?"
        />
        <Input
          id="price"
          label="Price"
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
      title="Airbnb your home!"
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
