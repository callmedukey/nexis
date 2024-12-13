"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import Share from "@/public/share.svg";

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleShare();
      }}
      className={cn(
        "flex size-12 flex-col items-center justify-center rounded-full p-2",
        className
      )}
    >
      <Image src={Share} alt="친구 공유" width={24} height={24} />
      <span className="text-nowrap text-xs">친구 공유</span>
    </button>
  );
}
