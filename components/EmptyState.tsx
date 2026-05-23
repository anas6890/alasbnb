"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "./Button";
import Heading from "./Heading";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";

type Props = {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
};

function EmptyState({
  title,
  subtitle,
  showReset,
}: Props) {
  const router = useRouter();
  const lang = useLanguage((s) => s.language) || "en";
  const t = translations[lang as keyof typeof translations] || translations.en;

  const displayTitle = title || t.empty_title || "No exact matches";
  const displaySubtitle = subtitle || t.empty_subtitle || "Try changing or removing some of your filters.";

  return (
    <div
      className="h-[60vh] flex flex-col gap-2 justify-center items-center"
    >
      <Heading center title={displayTitle} subtitle={displaySubtitle} />
      <div className="w-48 mt-4">
        {showReset && (
          <Button
            outline
            label={t.remove_filters || "Remove all filters"}
            onClick={() => router.push("/")}
          />
        )}
      </div>
    </div>
  );
}

export default EmptyState;
