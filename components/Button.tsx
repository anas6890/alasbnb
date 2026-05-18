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
        relative disabled:opacity-70 disabled:cursor-not-allowed rounded-xl w-full
        transition-all duration-200 font-semibold tracking-wide
        ${outline
          ? "bg-white border-2 border-neutral-300 text-neutral-800 hover:border-brand-500 hover:text-brand-600"
          : "bg-brand-500 border-2 border-brand-500 text-white hover:bg-brand-600 hover:border-brand-600 shadow-sm hover:shadow-md"
        }
        ${small ? "text-sm py-2 px-4 font-medium" : "text-base py-3 px-6"}
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
