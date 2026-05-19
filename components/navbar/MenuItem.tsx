" use client";

import React from "react";

import { IconType } from "react-icons";

type Props = {
  onClick: () => void;
  label: string;
  icon?: IconType;
};

function MenuItem({ onClick, label, icon: Icon }: Props) {
  return (
    <div
      className="px-4 py-3 hover:bg-neutral-100 transition font-semibold flex items-center gap-3 text-neutral-700"
      onClick={onClick}
    >
      {Icon && <Icon size={18} className="text-neutral-500" />}
      {label}
    </div>
  );
}

export default MenuItem;
