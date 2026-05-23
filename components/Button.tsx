"use client";

import React from "react";
import { IconType } from "react-icons";

type Props = {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  isColor?: boolean;
};

function Button({ label, onClick, disabled, outline, small, icon: Icon, isColor }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        relative disabled:opacity-70 disabled:cursor-not-allowed rounded-full w-full
        transition-all duration-300 font-bold tracking-tight active:scale-95
        ${outline
          ? "bg-white border-2 border-neutral-200 text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50 shadow-sm"
          : "bg-gradient-to-r from-rose-500 to-orange-500 border-none text-white hover:from-rose-600 hover:to-orange-600 shadow-[0_8px_20px_rgba(244,63,94,0.25)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.35)] hover:-translate-y-[1px]"
        }
        ${small ? "text-xs py-2 px-4 font-semibold" : "text-[15px] py-3.5 px-8"}
      `}
    >
      {Icon && (
        <Icon
          size={24}
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isColor ? "text-brand-600" : ""}`}
        />
      )}
      {label}
    </button>
  );
}

export default Button;
