"use client";

import Image from "next/image";
import { useState } from "react";

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

  if (error) {
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
      onError={() => setError(true)}
      priority
      {...props}
    />
  );
}; 