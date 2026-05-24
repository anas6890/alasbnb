"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useCallback, useRef } from "react";
import { TbPhotoPlus, TbTrash } from "react-icons/tb";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

declare global {
  var cloudinary: any;
}

type Props = {
  onChange: (value: string[]) => void;
  value: string[];
  isExperience?: boolean;
};

const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cptcecyi";

function ImageUpload({ onChange, value = [], isExperience }: Props) {
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;
  // Ensure value is always an array
  const imageList = Array.isArray(value) ? value : value ? [value] : [];

  // Use a ref to store the latest imageList so the callback reference NEVER changes.
  // This prevents stale closures in Cloudinary's once-initialized iframe.
  const listRef = useRef<string[]>(imageList);
  listRef.current = imageList;

  const handleUpload = useCallback(
    (result: any) => {
      const newUrl = result.info.secure_url;
      if (newUrl) {
        onChange([...listRef.current, newUrl]);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(
    (urlToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation(); // prevent opening the widget
      const updatedList = listRef.current.filter((url) => url !== urlToRemove);
      onChange(updatedList);
    },
    [onChange]
  );

  const handleClose = useCallback(() => {
    document.body.style.overflow = "unset";
  }, []);

  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="space-y-6 w-full">
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {imageList.map((url, index) => (
            <div
              key={url}
              className={`relative rounded-3xl overflow-hidden group aspect-video border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${
                index === 0 ? "col-span-2 row-span-2 aspect-auto h-[200px] md:h-[280px]" : ""
              }`}
            >
              <Image
                alt={`Upload ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                src={url}
                className="transition-transform group-hover:scale-105 duration-500"
              />
              {index === 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[11px] uppercase font-black px-3 py-1.5 rounded-full shadow-lg tracking-wider">
                  {t.image_upload_cover || "Couverture"}
                </div>
              )}
              <button
                type="button"
                onClick={(e) => handleRemove(url, e)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 hover:bg-rose-500 hover:text-white text-neutral-600 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 transform group-hover:translate-y-0 translate-y-2"
              >
                <TbTrash size={18} />
              </button>
            </div>
          ))}

          <CldUploadWidget
            onUpload={handleUpload}
            onSuccess={handleUpload}
            onClose={handleClose}
            uploadPreset={uploadPreset}
            options={{ maxFiles: 10 }}
          >
            {({ open }) => (
              <div
                onClick={() => open?.()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-rose-500 hover:bg-rose-50/50 hover:text-rose-600 transition-all duration-300 cursor-pointer rounded-3xl aspect-video text-neutral-400 gap-3 h-full min-h-[120px]"
              >
                <div className="p-3 bg-neutral-100 rounded-full group-hover:bg-rose-100 transition-colors">
                    <TbPhotoPlus size={28} />
                </div>
                <span className="text-sm font-bold">{t.image_upload_add || "Ajouter plus"}</span>
              </div>
            )}
          </CldUploadWidget>
        </div>
      )}

      {imageList.length === 0 && (
        <CldUploadWidget
          onUpload={handleUpload}
          onSuccess={handleUpload}
          onClose={handleClose}
          uploadPreset={uploadPreset}
          options={{ maxFiles: 10 }}
        >
          {({ open }) => (
            <div
              onClick={() => open?.()}
              className="relative cursor-pointer hover:border-rose-500 hover:bg-rose-50/30 transition-all duration-500 border-dashed border-2 p-16 md:p-24 border-neutral-300 flex flex-col justify-center items-center gap-6 text-neutral-600 rounded-[2rem] bg-neutral-50/50 group"
            >
              <div className="p-6 bg-white rounded-full text-rose-500 shadow-sm border border-neutral-100 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                <TbPhotoPlus size={48} />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="font-black text-xl text-neutral-800">{t.image_upload_click || "Importer des photos"}</div>
                <div className="text-sm font-medium text-neutral-400 max-w-sm">
                  {isExperience 
                    ? "Glissez-déposez jusqu'à 10 photos de votre activité."
                    : (t.image_upload_drag || "Commencez par votre meilleure photo. Vous pourrez ajouter les autres ensuite.")}
                </div>
              </div>
            </div>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}

export default ImageUpload;
