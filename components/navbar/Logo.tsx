"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {};

function Logo({}: Props) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push("/")} 
      className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer md:ml-8 lg:ml-12"
    >
      <img
        alt="AlasBnB"
        style={{ height: '45px', width: 'auto', objectFit: 'contain' }}
        src="/assets/logo_transparent.png"
      />
    </div>
  );
}

export default Logo;
