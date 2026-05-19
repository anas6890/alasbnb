"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import useLanguage from "@/hook/useLanguage";

type GuestCounts = {
  adults: number;
  children: number;
  babies: number;
  pets: number;
};

type Props = {
  value: GuestCounts;
  onChange: (value: GuestCounts) => void;
  onClose?: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
};

type RowProps = {
  title: string;
  subtitle: React.ReactNode;
  value: number;
  onAdd: () => void;
  onReduce: () => void;
};

function Row({ title, subtitle, value, onAdd, onReduce }: RowProps) {
  return (
    <div className="flex flex-row items-center justify-between py-4">
      <div className="flex flex-col">
        <div className="font-semibold text-[15px] text-neutral-800">{title}</div>
        <div className="text-sm text-neutral-500 mt-0.5">{subtitle}</div>
      </div>
      <div className="flex flex-row items-center gap-3">
        <button
          onClick={onReduce}
          disabled={value <= 0}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition
            ${value <= 0
              ? "border-neutral-200 text-neutral-200 cursor-not-allowed"
              : "border-neutral-400 text-neutral-600 hover:border-neutral-800 cursor-pointer"}`}
        >
          <AiOutlineMinus size={12} />
        </button>
        <span className="w-5 text-center text-[16px] text-neutral-800">{value}</span>
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full border border-neutral-400 flex items-center justify-center text-neutral-600 hover:border-neutral-800 transition cursor-pointer"
        >
          <AiOutlinePlus size={12} />
        </button>
      </div>
    </div>
  );
}

export default function GuestSelector({ value, onChange, onClose, anchorRef }: Props) {
  const { language } = useLanguage();
  const isFr = language === "fr";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 340 });

  // Calculate position from anchorRef
  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 340, // align right edge
        width: 340,
      });
    }
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose, anchorRef]);

  const update = (key: keyof GuestCounts, delta: number) => {
    const next = Math.max(0, value[key] + delta);
    onChange({ ...value, [key]: next });
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: anchorRef ? pos.top : "calc(100% + 8px)",
        left: anchorRef ? pos.left : "auto",
        right: anchorRef ? "auto" : 0,
        width: pos.width,
        zIndex: 9999,
      }}
      className="bg-white rounded-3xl shadow-[0_6px_30px_rgba(0,0,0,0.15)] border border-neutral-100 px-6"
    >
      <Row
        title={isFr ? "Adultes" : "Adults"}
        subtitle={isFr ? "13 ans et plus" : "Ages 13 or above"}
        value={value.adults}
        onAdd={() => update("adults", 1)}
        onReduce={() => update("adults", -1)}
      />
      <hr className="border-neutral-100" />
      <Row
        title={isFr ? "Enfants" : "Children"}
        subtitle={isFr ? "De 2 à 12 ans" : "Ages 2–12"}
        value={value.children}
        onAdd={() => update("children", 1)}
        onReduce={() => update("children", -1)}
      />
      <hr className="border-neutral-100" />
      <Row
        title={isFr ? "Bébés" : "Infants"}
        subtitle={isFr ? "- de 2 ans" : "Under 2"}
        value={value.babies}
        onAdd={() => update("babies", 1)}
        onReduce={() => update("babies", -1)}
      />
      <hr className="border-neutral-100" />
      <Row
        title={isFr ? "Animaux domestiques" : "Pets"}
        subtitle={
          isFr ? (
            <>Vous voyagez avec un animal d&apos;assistance ?{" "}
              <span className="underline cursor-pointer font-medium text-neutral-700">Obtenez de l&apos;aide</span>
            </>
          ) : (
            <>Bringing a service animal?{" "}
              <span className="underline cursor-pointer font-medium text-neutral-700">Get help</span>
            </>
          )
        }
        value={value.pets}
        onAdd={() => update("pets", 1)}
        onReduce={() => update("pets", -1)}
      />
    </div>
  );

  // Render via portal to escape overflow:hidden parents
  if (typeof document !== "undefined") {
    return createPortal(dropdown, document.body);
  }
  return null;
}
