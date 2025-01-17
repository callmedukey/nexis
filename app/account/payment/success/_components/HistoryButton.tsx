"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function HistoryButton() {
  const router = useRouter();

  return (
    <Button
      className="min-w-[200px]"
      onClick={() => router.push("/account/history")}
    >
      주문 내역 보기
    </Button>
  );
}
