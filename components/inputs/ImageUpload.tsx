"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import React, { useCallback, useRef } from "react";
import { TbPhotoPlus, TbTrash } from "react-icons/tb";

declare global {
  var cloudinary: any;
}

type Props = {
  onChange: (value: string[]) => void;
  value: string[];
};

const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cptcecyi";

function ImageUpload({ onChange, value = [] }: Props) {
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

  return (
    <div className="space-y-4">
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border border-neutral-100 rounded-xl bg-neutral-50/50">
          {imageList.map((url, index) => (
            <div
              key={url}
              className={`relative rounded-xl overflow-hidden group aspect-video border border-neutral-200/60 shadow-sm transition hover:shadow-md ${
                index === 0 ? "col-span-2 row-span-2 aspect-auto h-[160px] md:h-[200px]" : ""
              }`}
            >
              <Image
                alt={`Upload ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                src={url}
                className="transition group-hover:scale-105 duration-300"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                  Couverture
                </div>
              )}
              <button
                type="button"
                onClick={(e) => handleRemove(url, e)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-neutral-600 transition shadow-sm opacity-0 group-hover:opacity-100 duration-200"
              >
                <TbTrash size={15} />
              </button>
            </div>
          ))}

          {/* Add more box in the grid */}
          <CldUploadWidget
            onUpload={handleUpload}
            onSuccess={handleUpload}
            uploadPreset={uploadPreset}
            options={{ maxFiles: 10 }}
          >
            {({ open }) => (
              <div
                onClick={() => open?.()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-teal-500 hover:bg-neutral-100/50 transition cursor-pointer rounded-xl aspect-video text-neutral-500 gap-2 h-full min-h-[90px]"
              >
                <TbPhotoPlus size={24} />
                <span className="text-xs font-medium">Ajouter des photos</span>
              </div>
            )}
          </CldUploadWidget>
        </div>
      )}

      {imageList.length === 0 && (
        <CldUploadWidget
          onUpload={handleUpload}
          onSuccess={handleUpload}
          uploadPreset={uploadPreset}
          options={{ maxFiles: 10 }}
        >
          {({ open }) => (
            <div
              onClick={() => open?.()}
              className="relative cursor-pointer hover:border-teal-500 hover:bg-neutral-50/50 transition border-dashed border-2 p-16 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 rounded-2xl bg-neutral-50/20"
            >
              <div className="p-4 bg-teal-50 rounded-full text-teal-500 transition shadow-sm border border-teal-100">
                <TbPhotoPlus size={36} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="font-semibold text-base">Cliquez pour importer des photos</div>
                <div className="text-xs text-neutral-400">Glissez-déposez jusqu&apos;à 10 photos de votre logement</div>
              </div>
            </div>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}

export default ImageUpload;
