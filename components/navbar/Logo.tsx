"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {};

function Logo({}: Props) {
  const router = useRouter();

  return (
    <div onClick={() => router.push("/")}>
      <Image
        alt="AlasBnB"
        className="cursor-pointer object-contain"
        height={58}
        width={160}
        src="/assets/logo.png"
        priority
      />
    </div>
  );
}

export default Logo;
