"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = "" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/images?folder=logo")
      .then((r) => r.json())
      .then((data) => {
        const blobs = data.blobs || [];
        if (blobs.length > 0) {
          // Use the most recently uploaded logo
          setLogoUrl(blobs[blobs.length - 1].url);
        }
      })
      .catch(() => {});
  }, []);

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt="Sponsor Shas"
        width={size}
        height={size}
        className={`rounded-lg object-contain ${className}`}
        unoptimized
      />
    );
  }

  // Fallback: styled ש
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)] ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="font-bold text-black" style={{ fontSize: size * 0.45 }}>
        ש
      </span>
    </div>
  );
}
