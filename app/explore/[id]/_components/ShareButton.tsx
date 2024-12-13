"use client";

import { Button } from "@/components/ui/button";

export function ShareButton() {
  return (
    <Button
      className="inline-flex items-center justify-center rounded-full bg-primary px-20 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      onClick={() => {
        navigator.share({
          title: document.title,
          url: window.location.href,
        });
      }}
    >
      공유하기
    </Button>
  );
} 