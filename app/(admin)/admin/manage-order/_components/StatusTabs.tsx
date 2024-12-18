"use client";

import { PurchaseStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatusKoreanMapping } from "@/constants/general";

interface StatusTabsProps {
  currentStatus: string;
}

export function StatusTabs({ currentStatus }: StatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    
    // Preserve other search params but reset page
    params.delete("page");
    
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={currentStatus} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="ALL">전체</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.PENDING}>상품 준비중</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.PENDING_DELIVERY}>배송 준비중</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.DELIVERING}>배송중</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.COMPLETED}>배송완료</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.CANCELLED}>주문 취소</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.CANCELLING}>취소 중</TabsTrigger>
        <TabsTrigger value={PurchaseStatus.RETURNING}>반품 중</TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 