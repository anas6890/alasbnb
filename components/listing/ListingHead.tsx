"use client";

import { SafeUser } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiShare2, FiHeart, FiX } from "react-icons/fi";
import { TbGrid3X3 } from "react-icons/tb";
import HeartButton from "../HeartButton";

type Props = {
  title: string;
  city: string;
  country: string;
  imageSrc: string;
  images?: string[];
  id: string;
  currentUser?: SafeUser | null;
};

function ListingHead({
  title,
  city,
  country,
  imageSrc,
  images = [],
  id,
  currentUser,
}: Props) {
  const photoList = images && images.length > 0 ? images : [imageSrc];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photoList.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  // Render 5-photo grid if we have at least 5 photos
  const renderPhotos = () => {
    if (photoList.length >= 5) {
      return (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[45vh] md:h-[55vh] w-full rounded-3xl overflow-hidden relative group">
          {/* Left Large Photo */}
          <div
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative overflow-hidden h-full cursor-pointer"
          >
            <Image
              src={photoList[0]}
              alt="Cover Image"
              fill
              priority
              className="object-cover hover:scale-102 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          {/* Top-Middle Photo */}
          <div
            onClick={() => openLightbox(1)}
            className="col-span-1 row-span-1 relative overflow-hidden h-full cursor-pointer"
          >
            <Image
              src={photoList[1]}
              alt="Photo 2"
              fill
              className="object-cover hover:scale-105 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          {/* Top-Right Photo */}
          <div
            onClick={() => openLightbox(2)}
            className="col-span-1 row-span-1 relative overflow-hidden h-full cursor-pointer"
          >
            <Image
              src={photoList[2]}
              alt="Photo 3"
              fill
              className="object-cover hover:scale-105 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          {/* Bottom-Middle Photo */}
          <div
            onClick={() => openLightbox(3)}
            className="col-span-1 row-span-1 relative overflow-hidden h-full cursor-pointer"
          >
            <Image
              src={photoList[3]}
              alt="Photo 4"
              fill
              className="object-cover hover:scale-105 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          {/* Bottom-Right Photo */}
          <div
            onClick={() => openLightbox(4)}
            className="col-span-1 row-span-1 relative overflow-hidden h-full cursor-pointer"
          >
            <Image
              src={photoList[4]}
              alt="Photo 5"
              fill
              className="object-cover hover:scale-105 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>

          {/* Floating Show All Photos Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(0);
            }}
            className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/95 hover:bg-white text-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition hover:scale-102 border border-neutral-200 z-10 select-none"
          >
            <TbGrid3X3 size={16} />
            <span>Afficher toutes les photos</span>
          </button>
        </div>
      );
    }

    if (photoList.length >= 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-[45vh] md:h-[55vh] w-full rounded-3xl overflow-hidden relative">
          <div onClick={() => openLightbox(0)} className="relative overflow-hidden h-full cursor-pointer">
            <Image
              src={photoList[0]}
              alt="Photo 1"
              fill
              className="object-cover hover:scale-102 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          <div onClick={() => openLightbox(1)} className="relative overflow-hidden h-full cursor-pointer">
            <Image
              src={photoList[1]}
              alt="Photo 2"
              fill
              className="object-cover hover:scale-102 hover:brightness-90 transition-all duration-300 ease-out"
            />
          </div>
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/95 hover:bg-white text-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition hover:scale-102 border border-neutral-200 z-10"
          >
            <TbGrid3X3 size={16} />
            <span>Afficher les {photoList.length} photos</span>
          </button>
        </div>
      );
    }

    return (
      <div
        onClick={() => openLightbox(0)}
        className="w-full h-[45vh] md:h-[55vh] overflow-hidden rounded-3xl relative cursor-pointer"
      >
        <Image
          src={imageSrc || photoList[0]}
          alt="image"
          fill
          className="object-cover w-full hover:scale-102 transition-transform duration-500 ease-out"
        />
      </div>
    );
  };

  return (
    <>
      {/* Title & Share/Save Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-end w-full">
          <h1 className="text-xl md:text-2xl font-semibold text-neutral-800 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-neutral-600 select-none">
            <button className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg transition">
              <FiShare2 size={15} />
              <span className="underline">Partager</span>
            </button>
            <button className="flex items-center gap-2 hover:bg-neutral-100 px-3 py-2 rounded-lg transition">
              <FiHeart size={15} />
              <span className="underline">Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photos layout */}
      <div className="relative mt-4">
        {renderPhotos()}
      </div>

      {/* Lightbox / Slideshow Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col justify-between p-4 md:p-8 select-none">
            {/* Header */}
            <div className="flex flex-row justify-between items-center w-full text-white z-50">
              <div className="text-sm font-semibold tracking-wider bg-white/10 px-4 py-1.5 rounded-full">
                {currentIndex + 1} / {photoList.length}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition shadow-sm"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Slideshow Display */}
            <div className="relative flex-grow flex items-center justify-center my-4">
              {/* Prev Button */}
              {photoList.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-2 md:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white transition shadow-md z-50"
                >
                  <FiChevronLeft size={28} />
                </button>
              )}

              {/* Main Image */}
              <div className="relative w-full max-w-[85vw] h-[65vh] md:h-[75vh] rounded-2xl overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={photoList[currentIndex]}
                      alt={`Photo ${currentIndex + 1}`}
                      fill
                      priority
                      className="object-contain w-full h-full"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              {photoList.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white transition shadow-md z-50"
                >
                  <FiChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Footer indicators */}
            <div className="flex justify-center items-center gap-1.5 pb-2">
              {photoList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ListingHead;
