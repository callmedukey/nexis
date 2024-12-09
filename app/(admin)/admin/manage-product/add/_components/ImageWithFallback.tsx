"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export const ImageWithFallback = ({
  src,
  alt,
  ...props
}: {
  src: string;
  alt: string;
  [key: string]: any;
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log(`Loading image with src:`, src);
  }, [src]);

  if (error) {
    console.error(`Failed to load image:`, src);
    return (
      <div className="flex size-full items-center justify-center bg-gray-100 text-sm text-gray-500">
        이미지를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={(e) => {
        console.error(`Image load error for ${src}:`, e);
        setError(true);
      }}
      priority
      {...props}
    />
  );
}; 