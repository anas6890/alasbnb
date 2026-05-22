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
        transition-all duration-300 font-bold tracking-tight active:scale-[0.97]
        ${outline
          ? "bg-white border-[1px] border-neutral-300 text-neutral-800 hover:border-black hover:bg-neutral-50"
          : "bg-brand-500 border-none text-white hover:bg-brand-600 shadow-md hover:shadow-lg shadow-brand-500/10"
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
